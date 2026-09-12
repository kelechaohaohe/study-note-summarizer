import React from 'react';
import { useState } from "react";
import UploadForm from "./components/UploadForm.jsx";
import SummaryPanel from "./components/SummaryPanel.jsx";
import QuizPanel from "./components/QuizPanel.jsx";

// Reads the backend URL from an environment variable so the same build
// works locally and in production (set VITE_API_URL when deploying).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function App() {
  const [result, setResult] = useState(null); // { summary, quiz }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate({ text, file, quizCount }) {
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      let response;

      if (file) {
        // File uploads need multipart/form-data, not JSON.
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
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Study Notes Summarizer & Quiz Generator</h1>
        <p>Paste your notes or upload a PDF to get an instant summary and self-test quiz.</p>
      </header>

      <UploadForm onGenerate={handleGenerate} isLoading={isLoading} />

      {error && <p className="error">{error}</p>}

      <div className="results">
        <SummaryPanel summary={result?.summary} />
        <QuizPanel quiz={result?.quiz} />
      </div>
    </div>
  );
}
