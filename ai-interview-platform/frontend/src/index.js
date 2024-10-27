import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import InterviewPage from './pages/InterviewPage';
import ResultsPage from './pages/ResultsPage';
import RealTimeComponent from './pages/RealTime';
import './index.css'


const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/AnalysisPage" element={<AnalysisPage />} />
      <Route path="/InterviewPage" element={<InterviewPage />} />
      <Route path="/ResultsPage" element={<ResultsPage />} />
      <Route path="/RealTime" element={<RealTimeComponent />} />
    </Routes>
  </BrowserRouter>
);

