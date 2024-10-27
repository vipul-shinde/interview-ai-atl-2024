import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header'; // Import your existing Header component
import '../styling/resultspage.css';

const ResultsPage = () => {
  return (
    <div className="results-page">
      <Header /> {/* Use your existing Header component */}
      <div className="results-container">
        <h1 className="results-title">Final Feedback Summary: Mock Interview Performance</h1>
        <Summary />
        <FeedbackSection title="Verbal Communication" content={verbalCommunicationContent} />
        <FeedbackSection title="Non-Verbal Communication" content={nonVerbalCommunicationContent} />
        <FeedbackSection title="Overall Evaluation and Next Steps" content={overallEvaluationContent} />
      </div>
    </div>
  );
};

const Summary = () => (
  <div className="summary-section">
    <p>Sabina demonstrates a solid foundation in data science concepts and a genuine interest in the field. Her responses show understanding, but there's room for improvement in delivery and conciseness to make a stronger impact. Non-verbally, she presents professionally, but addressing a few nervous habits will boost her confidence and engagement.</p>
  </div>
);

const FeedbackSection = ({ title, content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="feedback-section">
      <button className="section-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <h2>{title}</h2>
        <span>{isExpanded ? '−' : '+'}</span>
      </button>
      {isExpanded && (
        <div className="section-content">
          {content.map((item, index) => (
            <FeedbackItem key={index} {...item} />
          ))}
        </div>
      )}
    </div>
  );
};

const FeedbackItem = ({ subtitle, points }) => (
  <div className="feedback-item">
    <h3>{subtitle}</h3>
    <ul>
      {points.map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  </div>
);
const verbalCommunicationContent = [
  {
    subtitle: "Strengths",
    points: [
      "Clearly understands core concepts like overfitting and underfitting, explaining them accurately.",
      "Demonstrates project experience with the sentiment analysis project, highlighting relevant steps like data cleaning, NLP techniques, and model building.",
      "Expresses enthusiasm for data science and AI."
    ]
  },
  {
    subtitle: "Areas for Improvement",
    points: [
      "Responses sometimes lack conciseness and become slightly rambling (e.g., the project description). Focus on delivering key information succinctly and structuring answers with a clear beginning, middle, and end.",
      "The response about the desired role was cut short due to perceived time constraints. Practice anticipating common interview questions and formulating concise, impactful responses.",
      "While the sentiment analysis project description is good, quantifying the impact with metrics would significantly strengthen the response."
    ]
  },
  {
    subtitle: "Recommendations",
    points: [
      "Use the STAR method (Situation, Task, Action, Result) to structure project descriptions and highlight quantifiable achievements.",
      "Practice delivering concise, focused answers to common interview questions, emphasizing relevance to the specific role.",
      "Prepare a closing statement summarizing key skills and reiterating interest in the position, even if time is limited."
    ]
  }
];

const nonVerbalCommunicationContent = [
  {
    subtitle: "Strengths",
    points: [
      "Maintains good posture throughout the interview, projecting professionalism and attentiveness.",
      "Uses natural hand gestures to illustrate points, enhancing communication.",
      "Makes reasonable eye contact, creating a sense of connection."
    ]
  },
  {
    subtitle: "Areas for Improvement",
    points: [
      "Occasional gaze aversion and touching of chin/glasses can be perceived as nervousness or a lack of confidence.",
      "Limited facial expressiveness might be interpreted as a lack of enthusiasm.",
      "Overuse of filler words (\"um,\" \"like\") diminishes the impact of responses."
    ]
  },
  {
    subtitle: "Recommendations",
    points: [
      "Practice maintaining consistent eye contact by imagining speaking directly to a person.",
      "Minimize touching the face and glasses by holding a small, unobtrusive object or practicing mindful hand placement.",
      "Increase facial expressiveness, particularly when discussing projects or experiences, to convey passion and energy.",
      "Reduce filler words by embracing short pauses to gather thoughts and practicing responses beforehand."
    ]
  }
];

const overallEvaluationContent = [
  {
    subtitle: "Evaluation",
    points: [
      "Sabina possesses the technical knowledge and enthusiasm for a data science role.",
      "By focusing on delivering more concise and impactful responses, quantifying achievements, and addressing her nervous habits, she can significantly enhance her interview performance.",
      "Practicing with mock interviews and actively working on these recommendations will boost her confidence and allow her skills to shine through."
    ]
  }
];

export default ResultsPage;