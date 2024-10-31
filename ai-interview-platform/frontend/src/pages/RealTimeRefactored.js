import React, { useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioProcessing } from '../hooks/useAudioProcessing';
import { useAudioPlayback } from '../hooks/useAudioPlayback';

/**
 * RealerTimeComponent - A real-time audio recording and playback component that interfaces
 * with an OpenAI-compatible WebSocket server.
 * 
 * Audio Pipeline:
 * 1. Records audio from user's microphone
 * 2. Processes audio to PCM16 mono 24kHz format
 * 3. Sends to WebSocket server
 * 4. Receives streamed audio response
 * 5. Plays back response with chunk management
 * 
 * WebSocket Protocol:
 * - Sends: {
 *     type: 'conversation.item.create',
 *     item: {
 *       type: 'message',
 *       role: 'user',
 *       content: [{ type: 'input_audio', audio: base64Audio }]
 *     }
 *   }
 * - Receives: {
 *     type: 'response.audio.delta' | 'response.audio.done' | 'response.audio_transcript.done',
 *     delta?: string, // base64 audio chunk
 *     transcript?: string // final transcription
 *   }
 */

export const RealerTimeComponent = () => {
    // Holds complete audio chunks for continuous playback
    const audioBufferRef = useRef([]);

    /**
     * Audio Playback Hook
     * - Manages audio element and playback state
     * - Handles incoming audio chunks from WebSocket
     * - Creates WAV format audio from PCM data
     * - Manages continuous playback with chunk overlap
     */
    const { 
      audioPlayerRef,  // Ref to <audio> element
      isPlaying,       // Current playback state
      handleResponseAudioDelta,  // Processes incoming audio chunks
      playCollectedChunks       // Starts continuous playback of collected chunks
    } = useAudioPlayback();
    
    /**
     * WebSocket Hook
     * - Manages WebSocket connection to server
     * - Handles message types: conversation.item.created, response.audio.delta, 
     *   response.audio.done, response.audio_transcript.done
     * - Maintains message history
     * @param {string} url - WebSocket server URL
     * @param {Function} handleResponseAudioDelta - Audio chunk handler
     * @param {React.RefObject} audioPlayerRef - Reference to audio element
     * @param {React.RefObject} audioBufferRef - Reference to audio buffer
     */
    const { 
      messages,     // Array of message objects {role: string, text?: string, audio?: string}
      setMessages,  // Message state setter
      wsRef         // Reference to WebSocket instance
    } = useWebSocket(
      'ws://localhost:4000/ws-client',
      handleResponseAudioDelta,
      audioPlayerRef,
      audioBufferRef
    );
    
    /**
     * Audio Processing Hook
     * - Handles microphone access and recording
     * - Processes audio to PCM16 mono 24kHz format
     * - Converts audio chunks to base64 for transmission
     * - Manages recording state and audio chunks
     */
    const {
      isRecording,     // Current recording state
      startRecording,  // Starts microphone recording
      stopRecording   // Stops recording and triggers processing
    } = useAudioProcessing({
      setMessages,
      wsRef,
      playCollectedChunks
    });

    // Current state of the component for UI display
    const status = isRecording ? 'Recording...' : isPlaying ? 'Playing...' : 'Idle';
  
    return (
      <div className="RealTimeComponent">
        <h1>OpenAI Realtime API Demo</h1>
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isPlaying}
          className="record-button"
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
  
        <div id="status" className="status-indicator">
          {status}
        </div>
  
        {/* Hidden audio element for playing processed audio chunks */}
        <audio 
          ref={audioPlayerRef}
          style={{ display: 'none' }}
          preload="auto"
          onError={(e) => console.error('Audio element error:', e.target.error)}
        />
  
        {/* Message history display */}
        <div className="messages">
          {messages.map((msg, idx) => (
            <div 
              key={`message-${idx}`} 
              className={`message ${msg.role}`}
            >
              {/* Text messages (transcripts or system messages) */}
              {msg.text && <p>{msg.text}</p>}
              {/* Audio messages with controls */}
              {msg.audio && (
                <audio 
                  controls 
                  src={`data:audio/wav;base64,${msg.audio}`} 
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

export default RealerTimeComponent;