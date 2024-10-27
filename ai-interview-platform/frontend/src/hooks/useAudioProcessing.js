import { useRef, useState } from 'react';

export const useAudioRecording = ({
  setMessages,
  wsRef,
  playCollectedChunks,
  audioStream,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const completeAudioChunksRef = useRef([]);

  const startRecording = async () => {
    setIsRecording(true);
    audioChunksRef.current = [];
    completeAudioChunksRef.current = [];

    try {
      let stream = audioStream;

      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

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
          completeAudioChunksRef.current.push(event.data);
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

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    console.log(
      `Playing ${completeAudioChunksRef.current.length} chunks in 3 seconds...`
    );
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
      // Initialize AudioContext
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Decode the audio data
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Resample the audio to 24kHz
      const resampledBuffer = await resampleAudioBuffer(audioBuffer, 24000);

      // Downmix to mono if necessary
      let channelData =
        resampledBuffer.numberOfChannels > 1
          ? averageChannels(
              resampledBuffer.getChannelData(0),
              resampledBuffer.getChannelData(1)
            )
          : resampledBuffer.getChannelData(0);

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
   * Resamples an AudioBuffer to a target sample rate.
   * @param {AudioBuffer} audioBuffer - The original AudioBuffer.
   * @param {number} targetSampleRate - The desired sample rate.
   * @returns {Promise<AudioBuffer>} - The resampled AudioBuffer.
   */
  const resampleAudioBuffer = async (audioBuffer, targetSampleRate) => {
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

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};