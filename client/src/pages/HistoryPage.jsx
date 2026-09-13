import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001";

export default function HistoryPage() {
  const { token } = useAuth();
  const [summaries, setSummaries] = useState([]);
  const [selected, setSelected] = useState(null); // full summary + quiz, once clicked
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the list once, when the page loads
  useEffect(() => {
    fetch(`${API_URL}/api/summaries`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error);
        setSummaries(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  function viewSummary(id) {
    setSelected(null);
    fetch(`${API_URL}/api/summaries/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error);
        setSelected(data);
      })
      .catch((err) => setError(err.message));
  }

  if (isLoading) return <div className="app"><p>Loading your history...</p></div>;

  return (
    <div className="app">
      <header>
        <h1>Past Summaries</h1>
      </header>

      {error && <p className="error">{error}</p>}

      {summaries.length === 0 ? (
        <p>You haven't generated any summaries yet.</p>
      ) : (
        <div className="results">
          <ul className="history-list">
            {summaries.map((s) => (
              <li key={s._id} className="history-item" onClick={() => viewSummary(s._id)}>
                <strong>{s.fileName || "Pasted notes"}</strong>
                <p>{s.sourceTextPreview}...</p>
                <span className="history-date">
                  {new Date(s.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>

          {selected && (
            <div className="panel summary-panel">
              <h2>Summary</h2>
              <p>{selected.summary}</p>
              <h2>Quiz</h2>
              {selected.quiz.map((q, i) => (
                <div className="quiz-question" key={i}>
                  <p className="question-text">{i + 1}. {q.question}</p>
                  <ul>
                    {q.options.map((opt, j) => (
                      <li key={j} style={{ fontWeight: j === q.correctIndex ? 600 : 400 }}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}