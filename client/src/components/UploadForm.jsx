//Handles user input: either pasted text OR an uploaded PDF/TXT file.
import React from 'react';
import { useState } from "react";

export default function UploadForm({ onGenerate, isLoading }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [quizCount, setQuizCount] = useState(5);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileChange(e) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) setText("");
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0] || null;
    if (dropped) {
      setFile(dropped);
      setText("");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onGenerate({ text, file, quizCount });
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label htmlFor="notes">Paste your notes</label>
      <textarea
        id="notes"
        rows={10}
        placeholder="Paste your study notes here..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (e.target.value) setFile(null);
        }}
        disabled={isLoading}
      />

      <div className="or-divider">or</div>

      <label htmlFor="file">Upload a PDF or TXT file</label>
      <div
        className={`dropzone${isDragging ? " dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {file ? `Selected: ${file.name}` : "Drag a file here, or click to browse"}
        <input
          id="file"
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>

      <label htmlFor="quizCount">Number of quiz questions</label>
      <div className="quiz-count-row">
        <span>{quizCount} questions</span>
        <input
          id="quizCount"
          type="number"
          min={1}
          max={10}
          value={quizCount}
          onChange={(e) => setQuizCount(Number(e.target.value))}
          disabled={isLoading}
        />
      </div>

      <button type="submit" disabled={isLoading || (!text && !file)}>
        {isLoading ? "Generating..." : "Generate Summary & Quiz"}
      </button>
    </form>
  );
}