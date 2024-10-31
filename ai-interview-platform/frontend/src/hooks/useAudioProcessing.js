import { useState, useRef, useCallback } from 'react';

export const useAudioProcessing = ({ 
  setMessages, 
  wsRef,
  playCollectedChunks
}) => {
  // States
  const [isRecording, setIsRecording] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Utility functions defined first
  const arrayBufferToBase64 = useCallback((buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }, []);

  const float32ToPCM16 = useCallback((float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(i * 2, s, true);
    }
    return buffer;
  }, []);

  const averageChannels = useCallback((channel1, channel2) => {
    const length = Math.min(channel1.length, channel2.length);
    const result = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = (channel1[i] + channel2[i]) / 2;
    }
    return result;
  }, []);

  const resampleAudioBuffer = useCallback(async (audioBuffer, targetSampleRate) => {
    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.duration * targetSampleRate,
      targetSampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    return await offlineCtx.startRendering();
  }, []);

  const convertBlobToPCM16Mono24kHz = useCallback(async (blob) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const resampledBuffer = await resampleAudioBuffer(audioBuffer, 24000);

      const channelData = resampledBuffer.numberOfChannels > 1
        ? averageChannels(
            resampledBuffer.getChannelData(0),
            resampledBuffer.getChannelData(1)
          )
        : resampledBuffer.getChannelData(0);

      const pcm16Buffer = float32ToPCM16(channelData);
      const base64Audio = arrayBufferToBase64(pcm16Buffer);

      await audioCtx.close();
      return base64Audio;
    } catch (error) {
      console.error('Error processing audio:', error);
      return null;
    }
  }, [resampleAudioBuffer, averageChannels, float32ToPCM16, arrayBufferToBase64]);

  const processAudio = useCallback(async () => {
    const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    const processedBase64Audio = await convertBlobToPCM16Mono24kHz(blob);

    if (!processedBase64Audio) {
      console.error('Audio processing failed.');
      setMessages(prev => [...prev, { role: 'system', text: 'Failed to process audio.' }]);
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const conversationCreateEvent = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{
            type: 'input_audio',
            audio: processedBase64Audio,
          }],
        },
      };
      wsRef.current.send(JSON.stringify(conversationCreateEvent));

      setMessages(prev => [...prev, { 
        role: 'user', 
        audio: processedBase64Audio 
      }]);

      const responseCreateEvent = {
        type: 'response.create',
        response: {
          modalities: ['text', 'audio'],
        },
      };
      wsRef.current.send(JSON.stringify(responseCreateEvent));

      setMessages(prev => [...prev, { 
        role: 'system', 
        text: 'Audio sent to assistant for processing.' 
      }]);
    } else {
      console.error('WebSocket is not open.');
      setMessages(prev => [...prev, { 
        role: 'system', 
        text: 'Unable to send audio. Connection is closed.' 
      }]);
    }
  }, [wsRef, setMessages, convertBlobToPCM16Mono24kHz]);

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();

      mediaRecorder.onstart = () => {
        console.log('Recording started');
        setMessages(prev => [...prev, { 
          role: 'system', 
          text: 'Recording started...' 
        }]);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped');
        setMessages(prev => [...prev, { 
          role: 'system', 
          text: 'Processing audio...' 
        }]);
        processAudio();
      };
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      setMessages(prev => [...prev, { 
        role: 'system', 
        text: 'Microphone access denied or unavailable.' 
      }]);
    }
  }, [setIsRecording, setMessages, processAudio]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setTimeout(playCollectedChunks, 3000);
  }, [setIsRecording, playCollectedChunks]);

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};