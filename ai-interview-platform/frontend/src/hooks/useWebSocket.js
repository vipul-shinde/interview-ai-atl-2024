import React, { useState, useRef, useEffect } from 'react';

export const useWebSocket = (url) => {
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const audioBufferRef = useRef([]);

  useEffect(() => {
    // Initialize WebSocket connection to the backend server
    const backendUrl = url || 'ws://localhost:4000/ws-client'; // Use the provided URL or default to localhost
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
        if (event.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            const dataStr = reader.result;
            processServerMessage(dataStr);
          };
          reader.readAsText(event.data);
        } else {
          const dataStr = event.data;
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
  }, [url]);

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
          } else {
            console.warn('Audio player ref is not set');
          }
        }
      });
    }
  };

  /**
   * Handles 'response.audio.delta' events for streaming audio data.
   * @param {Object} data - The event data.
   */
  const handleResponseAudioDelta = (data) => {
    const { delta } = data;
    if (delta) {
      // Append the delta to the audio buffer
      audioBufferRef.current = audioBufferRef.current.concat(delta);

      // Optionally process the audio buffer here
    }
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

    // Process the complete audio buffer if needed
    if (audioBufferRef.current.length > 0) {
      const audioData = audioBufferRef.current.join(''); // Assuming delta is base64 strings
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = `data:audio/wav;base64,${audioData}`;
        audioPlayerRef.current.play();
      } else {
        console.warn('Audio player ref is not set');
      }
    }

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
   * Sends a message to the server via WebSocket.
   * @param {Object} message - The message object to send.
   */
  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open');
    }
  };

  // Return the messages, sendMessage function, and audioPlayerRef for use in components
  return {
    messages,
    sendMessage,
    audioPlayerRef,
    wsRef,
  };
};