import { useEffect, useRef, useState, useCallback } from 'react';

export const useAudioPlayback = () => {
  const audioPlayerRef = useRef(null);
  const completeAudioChunks = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const createWavHeader = useCallback((pcmDataLength) => {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    // Possibly adjust these values for better quality
    const sampleRate = 24000; // Could try 44100 for higher quality
    const numChannels = 1;    // Mono
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    
    view.setUint32(0, 0x52494646, false); // 'RIFF' in ASCII
    view.setUint32(4, 36 + pcmDataLength, true);
    view.setUint32(8, 0x57415645, false); // 'WAVE' in ASCII
    view.setUint32(12, 0x666d7420, false); // 'fmt ' in ASCII
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    view.setUint32(36, 0x64617461, false); // 'data' in ASCII
    view.setUint32(40, pcmDataLength, true);
    
    return new Uint8Array(header);
  }, []);

  /**
   * Handles 'response.audio.delta' events from the server.
   * Accumulates audio data chunks.
   * @param {Object} data - The event data.
   */
  const handleResponseAudioDelta = useCallback((data) => {
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
  }, [createWavHeader]);

  useEffect(() => {
    // Store ref in variable for cleanup
    const currentAudioPlayer = audioPlayerRef.current;
    
    return () => {
      if (currentAudioPlayer?.src) {
        URL.revokeObjectURL(currentAudioPlayer.src);
      }
    };
  }, []);
  
  const playCollectedChunks = useCallback(() => {
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
              const playbackDuration = (duration * 1000) / audioPlayerRef.current.playbackRate;
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
          .catch((err) => {
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
  }, [setIsPlaying], completeAudioChunks, audioPlayerRef);

  // Return the functions and variables needed for the component
  return {
    // Refs
    audioPlayerRef,
  
    // State
    isPlaying,
    
    // Methods
    handleResponseAudioDelta,
    playCollectedChunks,
  };
};