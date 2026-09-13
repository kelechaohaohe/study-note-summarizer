import React from 'react';
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import UploadForm from "./components/UploadForm.jsx";
import SummaryPanel from "./components/SummaryPanel.jsx";
import QuizPanel from "./components/QuizPanel.jsx";

// Reads the backend URL from an environment variable so the same build
// works locally and in production (set VITE_API_URL when deploying).
const API_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  import.meta.env.VITE_API_URL || 
  "http://localhost:5001";

const LOADING_STEPS = [
  "Parsing study notes and document content...",
  "Connecting to Google Gemini API...",
  "Analyzing key takeaways and generating summary...",
  "Building multiple-choice questions & explanations...",
  "Finalizing your study package..."
];

function HomePage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  async function handleGenerate({ text, file, quizCount }) {
    setIsLoading(true);
    setLoadingStep(0);
    setError("");
    setResult(null);

    const intervalId = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    try {
      let response;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("quizCount", quizCount);
        response = await fetch(`${API_URL}/api/summarize`, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(`${API_URL}/api/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, quizCount }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      clearInterval(intervalId);
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Study Notes Summarizer & Quiz Generator</h1>
        <p>Paste your notes or upload a PDF to get an instant summary and self-test quiz.</p>
      </header>

      <UploadForm onGenerate={handleGenerate} isLoading={isLoading} loadingText={LOADING_STEPS[loadingStep]} />

      {isLoading && (
        <div className="loading-status">
          <p>{LOADING_STEPS[loadingStep]}</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <div className="results">
        <SummaryPanel summary={result?.summary} />
        <QuizPanel quiz={result?.quiz} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </>
  );
}