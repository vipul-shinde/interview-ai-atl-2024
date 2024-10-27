import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Link } from 'react-router-dom';
import Header from './Header';
import '../styling/interviewpage.css';

function InterviewPage() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isEnabled, setIsEnabled] = useState({ video: true, audio: true });

  const handleDataAvailable = ({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: isEnabled.video,
      audio: isEnabled.audio,
    });

    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  };

  const downloadVideo = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = 'interview-recording.webm';
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  };

  const toggleMedia = (type) => {
    setIsEnabled(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="color-background">
      <Header />
      <div className="content-wrapper">
        <div className="question-content">
          <h1>Welcome to your Interview</h1>
        </div>
        
        <div className="webcam-container">
          <Webcam
            audio={isEnabled.audio}
            video={isEnabled.video}
            ref={webcamRef}
            className="webcam-view"
          />
        </div>

        <div className="buttons-row">
          <button 
            className="styled-button"
            onClick={() => toggleMedia('video')}
          >
            {isEnabled.video ? 'Disable Video' : 'Enable Video'}
          </button>
          
          <button 
            className="styled-button"
            onClick={() => toggleMedia('audio')}
          >
            {isEnabled.audio ? 'Disable Audio' : 'Enable Audio'}
          </button>

          <button 
            className="styled-button"
            onClick={capturing ? stopRecording : startRecording}
          >
            {capturing ? 'Stop Recording' : 'Start Recording'}
          </button>

          {recordedChunks.length > 0 && (
            <button 
              className="styled-button"
              onClick={downloadVideo}
            >
              Download Recording
            </button>
          )}

          <Link to="/ResultsPage" className="styled-button">
            Results Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;