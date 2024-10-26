import React from 'react';
import Header from './Header';
import '../styling/homepage.css';
import styled from "styled-components";
import "./preview.png";
import { Link } from 'react-router-dom';


const HomePage = (props) => {
  return (
    <>
      <div>
        <Header />
      </div>
      <ContentWrapper>
        <div className="HomePage">
          <ImageSection>
            <img src={require("./preview.png")} alt="Description" />
          </ImageSection>
          <Link to="/AnalysisPage">
          <ButtonSection>
            <span> <MyButton /> </span>
          </ButtonSection>
          </Link>
          <AboutSection>
            <AboutPage />
          </AboutSection>
        </div>
      </ContentWrapper>
      <div>

      </div>
    </>
  );
}

const MyButton = (props) => {
  return (
    <ButtonContainer>
      <StyledButton>Get Started</StyledButton>
    </ButtonContainer>
  );
}

function AboutPage() {
  return (
    <AboutContent>
      <h2>About Pre-(inter)-View</h2>
      <h3>Our Product</h3>
      <p>
        We deliver the opportunity for students to prepare for any job interview,
        regardless of background, experience, and industry. By using our platform, you receive automatic
        feedback from AI-powered software on body language, interview answers, and facial expressions.
        <br />
      </p>
      <StyledButton>Try it now!</StyledButton>
    </AboutContent>
  );
}

// Styled Components
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 20px;
  margin-top: 90px; // To account for fixed header
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
  align-self: flex-start;   
  margin-top: 40px;
  margin-left: 23%;        
  text-align: left;       
  
  img {
    max-width: 100%;
    height: auto;
  }

  h1 {
    margin-top: 20px;
  }
`;

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

const AboutSection = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const AboutContent = styled.div`
  text-align: center;
  width: 100%;
  padding: 20px;

  h2, h3 {
    margin-bottom: 20px;
    margin-left: -50px;
  }

  p {
    margin-bottom: 30px;
    margin-left: -50px;
    line-height: 1.6;
  }
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

// Keep your existing NavMenu and Container styled components
const NavMenu = styled.div`
  /* Your existing NavMenu styles */
`;

const Container = styled.div`
  /* Your existing Container styles */
`;

export default HomePage;