import { useState, useRef, useEffect, useCallback } from 'react';

export const useWebSocket = (url, handleAudioDelta, audioPlayerRef, audioBufferRef) => { // Add handleAudioDelta prop
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  const handleConversationItemCreated = useCallback((item) => {
    if (item.type === 'message' && item.role === 'assistant') {
      item.content.forEach((contentItem) => {
        if (contentItem.type === 'text') {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            text: contentItem.text 
          }]);
        } else if (contentItem.type === 'audio') {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            audio: contentItem.audio 
          }]);

          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = `data:audio/wav;base64,${contentItem.audio}`;
            audioPlayerRef.current.play();
          }
        }
      });
    }
  }, []);

  const handleResponseAudioDelta = useCallback((data) => {
    if (handleAudioDelta) {
      handleAudioDelta(data);
    }
  }, [handleAudioDelta]);

  const handleResponseAudioDone = useCallback((data) => {
    console.log('Audio response completed.');
    setMessages(prev => [...prev, { 
      role: 'system', 
      text: 'Audio response completed.' 
    }]);

    if (audioBufferRef.current.length > 0) {
      const audioData = audioBufferRef.current.join('');
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = `data:audio/wav;base64,${audioData}`;
        audioPlayerRef.current.play();
      }
    }
    audioBufferRef.current = [];
  }, []);

  const handleResponseAudioTranscriptDone = useCallback((data) => {
    const { transcript } = data;
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      text: transcript 
    }]);
  }, []);

  const handleErrorEvent = useCallback((error) => {
    console.error('Error from server:', error);
    setMessages(prev => [...prev, { 
      role: 'system', 
      text: `Error: ${error.message}` 
    }]);
  }, []);

  const processServerMessage = useCallback((dataStr) => {
    try {
      const data = JSON.parse(dataStr);
      console.log('Received from backend:', data);

      switch (data.type) {
        case 'conversation.item.created':
          handleConversationItemCreated(data.item);
          break;
        case 'response.audio.delta':
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
  }, [
    handleConversationItemCreated, 
    handleResponseAudioDelta, 
    handleResponseAudioDone, 
    handleResponseAudioTranscriptDone, 
    handleErrorEvent
  ]);

  useEffect(() => {
    const backendUrl = url || 'ws://localhost:4000/ws-client';
    const ws = new WebSocket(backendUrl);

    ws.onopen = () => {
      console.log('Connected to backend WebSocket');
      setMessages(prev => [...prev, { 
        role: 'system', 
        text: 'Connected to assistant.' 
      }]);
    };

    ws.onmessage = (event) => {
      try {
        if (event.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            processServerMessage(reader.result);
          };
          reader.readAsText(event.data);
        } else {
          processServerMessage(event.data);
        }
      } catch (error) {
        console.error('Error handling incoming message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        text: 'WebSocket error occurred.' 
      }]);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setMessages(prev => [...prev, { 
        role: 'system', 
        text: 'Disconnected from assistant.' 
      }]);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [url, processServerMessage]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open');
    }
  }, []);

  return {
    messages,
    setMessages,
    sendMessage,
    wsRef
  };
};