import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

function InterviewPage() {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const handleDataAvailable = ({ data }) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => prev.concat(data));
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // Update the state to reflect that recording has started
    setCapturing(true);

    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' }); // Or 'video/mp4' if supported
    mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  };

  const downloadVideo = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' }); // Or 'video/mp4'
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = 'react-webcam-stream-capture.webm'; // Or .mp4
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  };

  return (
    <div className="App">
      <h1>React Webcam Recording</h1>
      <Webcam audio={true} ref={webcamRef} />

      {capturing ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}

      {recordedChunks.length > 0 && (
        <button onClick={downloadVideo}>Download Recording</button>
      )}
      <h1> Camera </h1>

      <Link to="/ResultsPage">
                  <ButtonSection>
                      <span> <MyButton /> </span>
                  </ButtonSection>
              </Link>

    </div>
  );
}
const MyButton = (props) => {
    return (
      <ButtonContainer>
        <StyledButton>End Interview</StyledButton>
      </ButtonContainer>
    );
  }

  const ButtonSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 30px 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const StyledButton = styled.a`
  color: #000000;
  background-color: rgba(255, 255, 255, 255);
  padding: 10px 16px;
  margin-right: 45px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border: 2px solid #55559e;
  border-radius: 4px;
  transition: all 0.2s ease 0s;
  cursor: pointer;
  display: inline-block;
  text-decoration: none;

  &:hover {
    background-color: #55559e;
    color: #000;
  }
`;

export default InterviewPage;