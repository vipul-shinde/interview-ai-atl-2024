import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import InterviewPage from './pages/InterviewPage';
import ResultsPage from './pages/ResultsPage';

const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/InterviewPage" element={<InterviewPage />} />
      <Route path="/AnalysisPage" element={<AnalysisPage />} />
      <Route path="/ResultsPage" element={<ResultsPage />} />
    </Routes>
  </BrowserRouter>
);

