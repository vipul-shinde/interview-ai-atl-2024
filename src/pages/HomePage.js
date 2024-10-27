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
          <Link to="/AnalysisPage">
            <div className="button-section">
              <span><MyButton /></span>
            </div>
          </Link>
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
    <div className="about-content">
      <h2>About Pre-View</h2>
      <h3>Our Product</h3>
      <div className="about-container"> 
      <p>
        We deliver the opportunity for students to prepare for any job interview,
        regardless of background, experience, and industry. By using our platform, you receive automatic
        feedback from AI-powered software on body language, interview answers, and facial expressions.
        <br />
      </p>
      </div>
      <a className="styled-button">Try it now!</a>
    </div>
  );
}

export default HomePage;