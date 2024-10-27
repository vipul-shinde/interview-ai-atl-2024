import React from 'react';
import Header from './Header';
import '../styling/homepage.css';
import "./bgflogo.png";
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <>
    <div className="color-background">
      <div>
        <Header />
      </div>
      <div className="content-wrapper">
        <div className="HomePage">
          <div className="image-section">
            <img src={require("./bgflogo.png")} alt="Description" />
          </div>

          <div className="about-section">
            <AboutPage />
          </div>
        </div>
      </div>
      <div></div>
      </div>
    </>
  );
}

const MyButton = () => {
  return (
    <div className="button-container">
      <a className="styled-button">Get Started</a>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="center">
    <div className="about-content">
      <h2>About Pre-View</h2>
      <h3>Our Product</h3>
      <div className="about-container"> 
      <p>
      Pre-view is your personal interview coach, designed to help you ace any interview!
      We strive to provide a private space to practice and receive targeted feedback on your responses and nonverbal cues.
        <br />
      </p>
      </div>
      <Link to="/AnalysisPage">
              <span><MyButton /></span>
          </Link>
        </div>
    </div>
  );
}

export default HomePage;