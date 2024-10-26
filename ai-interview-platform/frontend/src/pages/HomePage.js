import React from 'react';
// Import other components if they are in different files
import Header from './Header';
import '../styling/homepage.css';

function HomePage() {
  return (
    <div>
      <Header />
      <div className="App">
        <img src="path/to/your/image.jpg" className="profile-info" alt="Description" />
        <h1>Pre-(inter)-View</h1>
        <MyButton />
        <AboutPage />
      </div>
    </div>
  );
}

function MyButton() {
  return (
    <div>
      <button>Get Started</button>
    </div>
  );
}


function AboutPage() {
  return (
    <>
      <h2>About Pre-(inter)-View</h2>
      <h3>Our Product</h3>
      <p>We deliver the opportunity for students to prepare for any job interview,
        regardless of background, experience, and industry. By using our platform, you receive automatic
        feedback from AI-powered software on body language, interview answers, and facial expressions.
        <br />
      </p>
      <button>Try it now!</button>
    </>
  );
}

export default HomePage;
