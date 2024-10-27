import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styling/interviewpage.css';

const InterviewPage = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleDataAvailable = ({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      webcamRef.current.srcObject = stream;
      setCapturing(true);
      setError(null);

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });
      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.start();
    } catch (err) {
      setError(
        'Failed to access camera and microphone. Please ensure you have granted the necessary permissions.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      const tracks = webcamRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      setCapturing(false);
    }
  };

  const toggleMicrophone = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const audioTrack = webcamRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsSpeaking(!isSpeaking);
      }
    }
  };

  const downloadVideo = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  };

  return (
    <div className="interview-container">
      <div className="interview-card">
        <h1 className="interview-title">Interview Recording Session</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="video-container">
          <video
            ref={webcamRef}
            autoPlay
            playsInline
            muted
            className="video-preview"
          />
        </div>

        <div className="button-group">
          {capturing ? (
            <>
              <button
                onClick={stopRecording}
                className="button stop-button"
              >
                Stop Recording
              </button>
              <div className="mic-control">
                <button
                  onClick={toggleMicrophone}
                  className={`button mic-button ${
                    !isSpeaking ? 'mic-disabled' : ''
                  }`}
                  title={isSpeaking ? 'Click to mute' : 'Click to unmute'}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="mic-icon"
                  >
                    <path
                      d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                      fill="currentColor"
                    />
                    <path
                      d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {!isSpeaking && (
                      <line
                        x1="1"
                        y1="1"
                        x2="23"
                        y2="23"
                        stroke="red"
                        strokeWidth="2"
                        className="mic-disabled-line"
                      />
                    )}
                  </svg>
                </button>
                <span className="mic-status-text">
                  {isSpeaking
                    ? 'You are speaking, the interviewer cannot respond'
                    : 'Press to speak'}
                </span>
              </div>
            </>
          ) : (
            <button
              onClick={startRecording}
              className="button start-button"
            >
              Start Recording
            </button>
          )}

          {recordedChunks.length > 0 && (
            <button
              onClick={downloadVideo}
              className="button download-button"
            >
              Download Recording
            </button>
          )}
        </div>
      </div>

      <Link to="/ResultsPage" className="end-interview-button">
        End Interview
      </Link>
    </div>
  );
};

export default InterviewPage;
