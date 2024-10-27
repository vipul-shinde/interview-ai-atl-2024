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
      title: "Question 1: What was this question?",
      options: ["Verbal Notes:", "Non-Verbal Notes:"]
    },
    {
      title: "Question 2: Not sure what this was?",
      options: ["Verbal Notes:", "Non-Verbal Notes:"]
    },
    {
      title: "Question 3: another question guys yay",
      options: ["Verbal Notes:", "Non-Verbal Notes:"]
    },
    {
      title: "General Notes:",
      options: ["Verbal Notes:", "Non-Verbal Notes:"]
    },
    {
      title: "Future Recommendations: ",
      options: ["Verbal Notes:", "Non-Verbal Notes:"]
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
          <h1 className="question-title">Interview feedback and review: </h1>
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
        <Link to="/HomePage">
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
      <a className="styled-button">Home</a>
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
