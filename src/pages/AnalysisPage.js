import React, { useState } from 'react';
import "./preview.png";
import Header from './Header';
import '../styling/analysispage.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';


const AnalysisPage = () => {
  const [selectedOptions, setSelectedOptions] = useState({});

  const questions = [
    {
      title: "Current position:",
      options: ["Student", "Recent Graduate", "Professional", "Career Changer"]
    },
    {
      title: "Prospective role:",
      options: ["Software Engineer", "Product Manager", "Data Scientist", "Designer", "Business Analyst", "Marketing", "Other"]
    },
    {
      title: "Upload resume:",
      options: ["Upload PDF", "Upload DOC", "Upload via LinkedIn"]
    },
    {
      title: "Interview length:",
      options: ["10 minutes", "15 minutes", "20 minutes", "30 minutes"]
    },
    {
      title: "Interview type:",
      options: ["Technical", "Behavioral", "Case Study", "Mixed"]
    },
    // ... other questions
  ];

  const handleOptionSelect = (questionTitle, selectedOption) => {
    setSelectedOptions(prevState => ({ ...prevState, [questionTitle]: selectedOption }));
  };

  return (
    <>
    <div className = "color-background">
      <div className="page-container">
        <div className="content-wrapper">
          <div>
            <Header />
          </div>
          <h1 className="question-title">Customize your Interview:</h1>
          <div className="options-container">
            {questions.map((question, index) => (
              <OptionCard
                key={index}
                title={question.title}
                options={question.options}
                onSelect={handleOptionSelect} 
              />
            ))}
          </div>
          <div> 
            {/* Selected Options (for testing) */}
            <h2>Selected Options:</h2>
            <pre>{JSON.stringify(selectedOptions, null, 2)}</pre>
          </div>

          <div>
        <Link to="/InterviewPage">
          <div className="button-section">
            <span><MyButton /></span>
          </div>
        </Link>
      </div>

        </div>
      </div>
      </div>
    </>
  );
};


const MyButton = () => {
  return (
    <div className="button-container">
      <a className="styled-button">I'm Ready</a>
    </div>
  );
};

const OptionCard = ({ title, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="option-card">
      <button onClick={toggleDropdown} className="option-button">
        <span className="option-text">{title}</span>
        <span className="chevron-icon">
          <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} /> 
        </span>
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option, optionIndex) => (
            <li key={optionIndex} className="dropdown-item">
              <label>
                <input
                  type="radio" // Changed to radio buttons for single-select
                  name={title} // Group radio buttons by question title
                  value={option}
                  checked={options[title === option]} 
                  onChange={() => onSelect(title, option)}
                />
                {option}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AnalysisPage;