// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import '../styling/realtime.css';

function RealTimeComponent() {
  // State variables to manage recording status and conversation messages
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const completeAudioChunks = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs to store mutable objects across renders
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wsRef = useRef(null);
  const audioPlayerRef = useRef(null); // Hidden audio player for auto-playing responses
  const audioBufferRef = useRef([]); // Buffer to assemble audio deltas

  useEffect(() => {
    // Initialize WebSocket connection to the backend server on port 4000s
    const backendUrl = 'ws://localhost:4000/ws-client'; // Ensure your backend server listens on this path
    const ws = new WebSocket(backendUrl);

    ws.onopen = () => {
      console.log('Connected to backend WebSocket');
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: 'Connected to assistant.' },
      ]);
    };

    ws.onmessage = (event) => {
      try {
        // If the message is binary (Blob), convert it to string
        let dataStr;
        if (event.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            dataStr = reader.result;
            processServerMessage(dataStr);
          };
          reader.readAsText(event.data);
        } else {
          dataStr = event.data;
          processServerMessage(dataStr);
        }
      } catch (error) {
        console.error('Error handling incoming message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: 'WebSocket error occurred.' },
      ]);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: 'Disconnected from assistant.' },
      ]);
    };

    wsRef.current = ws;

    // Cleanup WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  /**
   * Processes incoming server messages after ensuring they are strings.
   * @param {string} dataStr - The JSON string received from the server.
   */
  const processServerMessage = (dataStr) => {
    try {
      const data = JSON.parse(dataStr);
      console.log('Received from backend:', data);

      // Handle different types of server events
      switch (data.type) {
        case 'conversation.item.created':
          handleConversationItemCreated(data.item);
          break;
        case 'response.audio.delta':
          console.log('Audio delta chunk size:', data.delta?.length || 0);
          handleResponseAudioDelta(data);
          break;
        case 'response.audio.done':
          handleResponseAudioDone(data);
          break;
        case 'response.audio_transcript.done':
          handleResponseAudioTranscriptDone(data);
          break;
        case 'error':
          handleErrorEvent(data.error);
          break;
        default:
          console.log('Unhandled event type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };

  /**
   * Handles 'conversation.item.created' events from the server.
   * @param {Object} item - The conversation item created by the server.
   */
  const handleConversationItemCreated = (item) => {
    if (item.type === 'message' && item.role === 'assistant') {
      item.content.forEach((contentItem) => {
        if (contentItem.type === 'text') {
          // Add assistant's text message to the UI
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', text: contentItem.text },
          ]);
        } else if (contentItem.type === 'audio') {
          // Add assistant's audio message to the UI and play it
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', audio: contentItem.audio },
          ]);

          // Play the audio response automatically
          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = `data:audio/wav;base64,${contentItem.audio}`;
            audioPlayerRef.current.play();
          }
        }
      });
    }
  };
  const createWavHeader = (pcmDataLength) => {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    // Possibly adjust these values for better quality
    const sampleRate = 24000; // Could try 44100 for higher quality
    const numChannels = 1;    // Mono
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    
    view.setUint32(0, 0x52494646, false);
    view.setUint32(4, 36 + pcmDataLength, true);
    view.setUint32(8, 0x57415645, false);
    view.setUint32(12, 0x666D7420, false);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    view.setUint32(36, 0x64617461, false);
    view.setUint32(40, pcmDataLength, true);
    
    return new Uint8Array(header);
};
  /**
   * Handles 'response.audio.delta' events from the server.
   * Accumulates audio data chunks.
   * @param {Object} data - The event data.
   */
  const handleResponseAudioDelta = (data) => {
    const pcmData = data.delta;
    if (!pcmData) return;
  
    try {
      // Convert base64 PCM to binary
      const binaryStr = atob(pcmData);
      const pcmBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        pcmBytes[i] = binaryStr.charCodeAt(i);
      }
  
      // Create WAV header
      const wavHeader = createWavHeader(pcmBytes.length);
      
      // Combine header and PCM data
      const wavBytes = new Uint8Array(wavHeader.length + pcmBytes.length);
      wavBytes.set(wavHeader);
      wavBytes.set(pcmBytes, wavHeader.length);
  
      // Store the chunk instead of playing it
      completeAudioChunks.current.push(wavBytes);
  
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current?.src) {
        URL.revokeObjectURL(audioPlayerRef.current.src);
      }
    };
  }, []);
  const playCollectedChunks = () => {
    if (completeAudioChunks.current.length === 0) return;
    
    const playNextChunk = (index) => {
      if (index >= completeAudioChunks.current.length) {
        setIsPlaying(false);
        completeAudioChunks.current = [];
        return;
      }
  
      if (audioPlayerRef.current) {
        const chunk = completeAudioChunks.current[index];
        const blob = new Blob([chunk], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
  
        // Set audio properties before playback
        audioPlayerRef.current.preservesPitch = true; // Try to maintain audio quality at different speeds
        audioPlayerRef.current.playbackRate = 2;
        audioPlayerRef.current.volume = 1.0; // Ensure full volume
        audioPlayerRef.current.src = audioUrl;
        
        // Optional: Add these properties if available in your browser
        if ('mozPreservesPitch' in audioPlayerRef.current) {
          audioPlayerRef.current.mozPreservesPitch = true;
        }
        if ('webkitPreservesPitch' in audioPlayerRef.current) {
          audioPlayerRef.current.webkitPreservesPitch = true;
        }
        
        const previousUrl = audioPlayerRef.current.src;
        
        audioPlayerRef.current.play()
          .then(() => {
            if (previousUrl) {
              URL.revokeObjectURL(previousUrl);
            }
  
            const duration = audioPlayerRef.current.duration;
            if (duration) {
              const playbackDuration = (duration * 1000 / audioPlayerRef.current.playbackRate);
              const overlapTime = playbackDuration * 0.17; // 17% overlap - right in the sweet spot
              
              setTimeout(() => {
                // Start loading next chunk slightly before playing it
                if (index + 1 < completeAudioChunks.current.length) {
                  const nextChunk = completeAudioChunks.current[index + 1];
                  const nextBlob = new Blob([nextChunk], { type: 'audio/wav' });
                  const nextUrl = URL.createObjectURL(nextBlob);
                  audioPlayerRef.current.preload = 'auto';  // Ensure preloading is enabled
                }
                playNextChunk(index + 1);
              }, playbackDuration - overlapTime);
            } else {
              setTimeout(() => playNextChunk(index + 1), 300);
            }
          })
          .catch(err => {
            console.error('Audio play error:', err);
            URL.revokeObjectURL(audioUrl);
            setTimeout(() => playNextChunk(index + 1), 50);
          });
      }
    };
  
    // Small initial delay to ensure smooth start
    setTimeout(() => {
      setIsPlaying(true);
      playNextChunk(0);
    }, 50);
  };
  /**
   * Handles 'response.audio.done' events indicating the end of audio streaming.
   * @param {Object} data - The event data.
   */
  const handleResponseAudioDone = (data) => {
    console.log('Audio response completed.');
    setMessages((prev) => [
      ...prev,
      { role: 'system', text: 'Audio response completed.' },
    ]);

    // Clear the audio buffer
    audioBufferRef.current = [];
  };

  /**
   * Handles 'response.audio_transcript.done' events indicating transcript completion.
   * @param {Object} data - The event data.
   */
  const handleResponseAudioTranscriptDone = (data) => {
    const { transcript } = data;
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', text: transcript },
    ]);
  };

  /**
   * Handles 'error' events from the server.
   * @param {Object} error - The error object received from the server.
   */
  const handleErrorEvent = (error) => {
    console.error('Error from server:', error);
    setMessages((prev) => [
      ...prev,
      { role: 'system', text: `Error: ${error.message}` },
    ]);
  };

  /**
   * Starts recording audio from the user's microphone.
   */
  const startRecording = async () => {
    setIsRecording(true);
    audioChunksRef.current = [];
    completeAudioChunks.current = [];

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();

      mediaRecorder.onstart = () => {
        console.log('Recording started');
        setMessages((prev) => [
          ...prev,
          { role: 'system', text: 'Recording started...' },
        ]);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped');
        setMessages((prev) => [
          ...prev,
          { role: 'system', text: 'Processing audio...' },
        ]);
        processAudio();
      };
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: 'Microphone access denied or unavailable.' },
      ]);
    }
  };

  /**
   * Stops the ongoing audio recording.
   */
  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    console.log(`Playing ${completeAudioChunks.current.length} chunks in 3 seconds...`);
    setTimeout(playCollectedChunks, 3000);
  };

  /**
   * Processes the recorded audio, encodes it to PCM16 mono 24kHz, and sends it to the backend server.
   */
  const processAudio = async () => {
    const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

    // Process the audio to PCM16 mono 24kHz using AudioContext
    const processedBase64Audio = await convertBlobToPCM16Mono24kHz(blob);

    if (!processedBase64Audio) {
      console.error('Audio processing failed.');
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: 'Failed to process audio.' },
      ]);
      return;
    }

    // Send the audio event to the backend via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const conversationCreateEvent = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_audio',
              audio: processedBase64Audio,
            },
          ],
        },
      };
      wsRef.current.send(JSON.stringify(conversationCreateEvent));

      // Optionally, add the user's audio message to the UI
      setMessages((prev) => [
        ...prev,
        { role: 'user', audio: processedBase64Audio },
      ]);

      // Trigger a response.create event to prompt assistant's response
      const responseCreateEvent = {
        type: 'response.create',
        response: {
          modalities: ['text', 'audio'], // Include audio modality
        },
      };
      wsRef.current.send(JSON.stringify(responseCreateEvent));

      setMessages((prev) => [
        ...prev,
        { role: 'system', text: 'Audio sent to assistant for processing.' },
      ]);
    } else {
      console.error('WebSocket is not open.');
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: 'Unable to send audio. Connection is closed.' },
      ]);
    }
  };

  /**
   * Converts an audio Blob to a base64-encoded PCM16 mono 24kHz string.
   * @param {Blob} blob - The audio Blob to convert.
   * @returns {Promise<string|null>} - The base64-encoded string or null if failed.
   */
  const convertBlobToPCM16Mono24kHz = async (blob) => {
    try {
      // Initialize AudioContext with target sample rate
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000, // Target sample rate
      });

      // Decode the audio data
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Downmix to mono if necessary
      let channelData =
        audioBuffer.numberOfChannels > 1
          ? averageChannels(
              audioBuffer.getChannelData(0),
              audioBuffer.getChannelData(1)
            )
          : audioBuffer.getChannelData(0);

      // Convert Float32Array to PCM16
      const pcm16Buffer = float32ToPCM16(channelData);

      // Base64 encode the PCM16 buffer
      const base64Audio = arrayBufferToBase64(pcm16Buffer);

      // Close the AudioContext to free resources
      audioCtx.close();

      return base64Audio;
    } catch (error) {
      console.error('Error processing audio:', error);
      return null;
    }
  };

  /**
   * Averages two Float32Arrays to produce a mono channel.
   * @param {Float32Array} channel1 - First channel data.
   * @param {Float32Array} channel2 - Second channel data.
   * @returns {Float32Array} - Averaged mono channel data.
   */
  const averageChannels = (channel1, channel2) => {
    const length = Math.min(channel1.length, channel2.length);
    const result = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = (channel1[i] + channel2[i]) / 2;
    }
    return result;
  };

  /**
   * Converts a Float32Array of audio samples to a PCM16 ArrayBuffer.
   * @param {Float32Array} float32Array - The audio samples.
   * @returns {ArrayBuffer} - The PCM16 encoded audio.
   */
  const float32ToPCM16 = (float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(i * 2, s, true); // little-endian
    }
    return buffer;
  };

  /**
   * Converts an ArrayBuffer or Uint8Array to a base64-encoded string.
   * @param {ArrayBuffer | Uint8Array} buffer - The buffer to encode.
   * @returns {string} - The base64-encoded string.
   */
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return (
    <div className="RealTimeComponent">
      <h1>OpenAI Realtime API Demo</h1>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      <div id="status">{isRecording ? 'Recording...' : 'Idle'}</div>

      <audio 
        ref={audioPlayerRef} 
        style={{ display: 'none' }} 
        preload="auto"
        onError={(e) => console.log('Audio element error:', e.target.error)}
        
      />

      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.text && <p>{msg.text}</p>}
            {msg.audio && (
              <audio controls src={`data:audio/wav;base64,${msg.audio}`} />
            )}
          </div>
        ))}
      </div>

      
    </div>
  );
}

export default RealTimeComponent;