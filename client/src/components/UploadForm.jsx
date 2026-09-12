//Handles user input: either pasted text OR an uploaded PDF/TXT file.
import React from 'react';
import { useState } from "react";

export default function UploadForm({ onGenerate, isLoading }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [quizCount, setQuizCount] = useState(5);

  function handleFileChange(e) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    // Clear pasted text if a file is chosen, so it's obvious which is used.
    if (selected) setText("");
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
          if (e.target.value) setFile(null); // typing clears any chosen file
        }}
        disabled={isLoading}
      />

      <div className="or-divider">— or —</div>

      <label htmlFor="file">Upload a PDF or TXT file</label>
      <input
        id="file"
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      {file && <p className="file-name">Selected: {file.name}</p>}

      <label htmlFor="quizCount">Number of quiz questions</label>
      <input
        id="quizCount"
        type="number"
        min={1}
        max={10}
        value={quizCount}
        onChange={(e) => setQuizCount(Number(e.target.value))}
        disabled={isLoading}
      />

      <button type="submit" disabled={isLoading || (!text && !file)}>
        {isLoading ? "Generating..." : "Generate Summary & Quiz"}
      </button>
    </form>
  );
}
