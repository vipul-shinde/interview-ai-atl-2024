import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:5000';
const socket = io(WEBSOCKET_URL, { transports: ['websocket'] });

const AudioStream = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [transcription, setTranscription] = useState('');
  const mediaRecorder = useRef(null);

  useEffect(() => {
    // Connection events
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsStreaming(false);
    });

    // Stream events
    socket.on('stream_started', () => setIsStreaming(true));
    socket.on('stream_stopped', () => setIsStreaming(false));
    socket.on('transcription', (data) => setTranscription(data.text));

    return () => {
      socket.disconnect();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Convert blob to array buffer before sending
          const reader = new FileReader();
          reader.onload = () => {
            socket.emit('audio_data', reader.result);
          };
          reader.readAsArrayBuffer(event.data);
        }
      };

      // Start recording and emit chunks every 250ms
      mediaRecorder.current.start(250);
      socket.emit('start_stream');
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      socket.emit('stop_stream');
    }
  };

  const toggleStream = async () => {
    if (isStreaming) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      
      <button 
        onClick={toggleStream}
        disabled={!isConnected}
        className={`px-4 py-2 rounded ${
          isStreaming 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        } text-white disabled:opacity-50`}
      >
        {isStreaming ? 'Stop Recording' : 'Start Recording'}
      </button>

      {transcription && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Transcription:</h3>
          <p className="p-3 bg-gray-100 rounded">{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default AudioStream;