import React from 'react';
import styled from 'styled-components';
import "./preview.png";
import Header from './Header';
import Grid from '../styling/grid.css'
import { Link } from 'react-router-dom';

const AnalysisPage = () => {
  const questions = [
    {
      title: "Tell us about yourself:",
      options: ["Student", "Recent Graduate", "Professional", "Career Changer"]
    },
    {
      title: "What role are you preparing for?",
      options: ["Software Engineer", "Product Manager", "Data Scientist", "Designer", "Business Analyst", "Marketing", "Other"]
    },
    {
      title: "Upload your resume:",
      options: ["Upload PDF", "Upload DOC", "Upload via LinkedIn"]
    },
    {
      title: "How long is your interview?",
      options: ["10 minutes", "15 minutes", "20 minutes", "30 minutes"]
    },
    {
      title: "Interview type:",
      options: ["Technical", "Behavioral", "Case Study", "Mixed"]
    },
    {
      title: "Ready to get started?",
      options: [<MyButton />, "Retry Later"]
    }
  ];

  return (
    <><PageContainer>
          <ContentWrapper>
              <div>
                  <Header />
              </div>
              <PageTitle>
                  <ImageSection>
                      <img src={require("./preview.png")} alt="Description" />
                  </ImageSection>
              </PageTitle>
              <QuestionTitle>What would you like to practice for?</QuestionTitle>
              <OptionsContainer>
                  {questions.map((question, index) => (
                      <OptionCard
                          key={index}
                          title={question.title}
                          options={question.options} />
                  ))}
              </OptionsContainer>
          </ContentWrapper>
      </PageContainer><div>
              <Link to="/InterviewPage">
                  <ButtonSection>
                      <span> <MyButton /> </span>
                  </ButtonSection>
              </Link>
          </div></>

  );
};

const MyButton = (props) => {
    return (
      <ButtonContainer>
        <StyledButton>I'm Ready</StyledButton>
      </ButtonContainer>
    );
  }

const OptionCard = ({ title, options }) => {
  return (
    <OptionButton>
      <OptionText>{title}</OptionText>
      <ChevronRight>›</ChevronRight>
    </OptionButton>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #F8F9FA;
  padding: 2rem;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 400;
  text-align: center;
  margin-bottom: 4rem;
  font-family: 'Google Sans', Arial, sans-serif;
`;

const QuestionTitle = styled.h2`
  font-size: 1.5rem;
  color: #202124;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 400;
  font-family: 'Google Sans', Arial, sans-serif;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 600px;
  margin: 0 auto;
`;

const OptionButton = styled.button`
  width: 100%;
  background: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);

  &:hover {
    background-color: #F8F9FA;
  }
`;

const OptionText = styled.span`
  color: #202124;
  font-size: 1rem;
  text-align: left;
  font-weight: 400;
  font-family: 'Google Sans', Arial, sans-serif;
`;

const ChevronRight = styled.span`
  color: #5F6368;
  font-size: 1.5rem;
  font-weight: 300;
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
  align-self: flex-start;   
  margin-top: 40px;
  margin-left: 10%;        
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

export default AnalysisPage;