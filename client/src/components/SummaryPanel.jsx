// Displays the AI-generated summary text.

import React from 'react';

export default function SummaryPanel({ summary }) {
  if (!summary) return null;

  return (
    <section className="panel summary-panel">
      <h2>Summary</h2>
      <p>{summary}</p>
    </section>
  );
}