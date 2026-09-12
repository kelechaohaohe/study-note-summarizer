// Renders the interactive multiple-choice quiz.
// Clicking an option immediately reveals whether it was correct, no submit button needed.

import React, { useEffect, useState } from 'react';

export default function QuizPanel({ quiz }) {
  // Tracks which option the user picked for each question: { [qIndex]: optionIndex }
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    setAnswers({});
  }, [quiz]);

  if (!quiz || quiz.length === 0) return null;

  function selectAnswer(questionIndex, optionIndex) {
    // Don't allow changing an answer after it's been picked.
    if (answers[questionIndex] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  return (
    <section className="panel quiz-panel">
      <h2>Quiz</h2>
      {quiz.map((q, qIndex) => {
        const selected = answers[qIndex];
        const hasAnswered = selected !== undefined;
        const isCorrect = selected === q.correctIndex;

        return (
          <div className="quiz-question" key={qIndex}>
            <p className="question-text">
              {qIndex + 1}. {q.question}
            </p>
            <div className="options">
              {q.options.map((option, optIndex) => {
                let className = "option";
                let icon = null;
                if (hasAnswered) {
                  if (optIndex === q.correctIndex) {
                    className += " correct";
                    icon = "✓ ";
                  } else if (optIndex === selected) {
                    className += " incorrect";
                    icon = "✗ ";
                  }
                }
                return (
                  <button 
                    key={optIndex} 
                    type="button" 
                    className={className} 
                    onClick={() => selectAnswer(qIndex, optIndex)} 
                    disabled={hasAnswered}
                  >
                    {icon}{option}
                  </button>
                );
              })}
            </div>
            {hasAnswered && (
              <div className={`feedback ${isCorrect ? "feedback-correct" : "feedback-incorrect"}`}>
                <p className="feedback-status">
                  {isCorrect ? "Correct!" : "Incorrect"}
                </p>
                {q.explanation && (
                  <p className="feedback-explanation">
                    {q.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}