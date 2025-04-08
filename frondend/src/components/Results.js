// import React from 'react';

// const Results = ({ results }) => {
//   return (
//     <div>
//       <h2>Test Results</h2>
//       {results.length > 0 ? (
//         <div>
//           <table>
//             <thead>
//               <tr>
//                 <th>Question</th>
//                 <th>Your Answer</th>
//                 <th>Similarity Score</th>
//               </tr>
//             </thead>
//             <tbody>
//               {results.map((result, index) => (
//                 <tr key={index}>
//                   <td>Question {index + 1}</td>
//                   <td>{result.candidate_answer}</td>
//                   <td>{result.similarity_score}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <h3>Overall Performance</h3>
//           <p>
//             Average Score: {(
//               results.reduce((sum, result) => sum + result.similarity_score, 0) / results.length
//             ).toFixed(2)}
//           </p>
//         </div>
//       ) : (
//         <p>No results to display.</p>
//       )}
//     </div>
//   );
// };

// export default Results;





//results component by vercel

// "use client"
// "use client"


import { useEffect, useState } from "react";
import "../styles/resultscomponent.css";

const Results = ({ results }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setAnimate(true);
    }, 100);
  }, []);

  // Update helper functions to work with 0–100 values
  const getScoreColor = (score) => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "average";
    return "poor";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  const calculateOverallScore = () => {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, result) => acc + result.similarity_score, 0);
    return sum / results.length;
  };

  const overallScore = calculateOverallScore();

  return (
    <div className="results-container">
      <div className="container">
        <div className={`results-header ${animate ? "animate" : ""}`}>
          <h1>Interview Results</h1>
          <div className="overall-score-container">
            <div className={`overall-score ${getScoreColor(overallScore)}`}>
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${overallScore}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">
                  {overallScore.toFixed(0)}%
                </text>
              </svg>
              <span className="score-label">{getScoreLabel(overallScore)}</span>
            </div>
          </div>
        </div>

        {results.length > 0 ? (
          <>
            <div className="results-summary">
              <div className={`summary-card ${animate ? "animate" : ""}`} style={{ animationDelay: "0.2s" }}>
                <div className="summary-icon">
                  <i className="fas fa-question-circle"></i>
                </div>
                <div className="summary-content">
                  <h3>{results.length}</h3>
                  <p>Questions</p>
                </div>
              </div>
              <div className={`summary-card ${animate ? "animate" : ""}`} style={{ animationDelay: "0.3s" }}>
                <div className="summary-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="summary-content">
                  <h3>{results.filter((r) => r.similarity_score >= 80).length}</h3>
                  <p>Excellent Answers</p>
                </div>
              </div>
              <div className={`summary-card ${animate ? "animate" : ""}`} style={{ animationDelay: "0.4s" }}>
                <div className="summary-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="summary-content">
                  <h3>{overallScore.toFixed(0)}%</h3>
                  <p>Average Score</p>
                </div>
              </div>
            </div>

            <div className="results-content">
              {results.map((result, index) => (
                <div
                  className={`result-card ${animate ? "animate" : ""}`}
                  key={index}
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="result-header">
                    <h3>Question {index + 1}</h3>
                    <div className={`score-badge ${getScoreColor(result.similarity_score)}`}>
                      {result.similarity_score.toFixed(0)}%
                    </div>
                  </div>

                  <div className="answer-container">
                    <h4>Your Answer:</h4>
                    <div className="answer-text">
                      {result.candidate_answer || <span className="no-answer">No answer provided</span>}
                    </div>
                  </div>

                  <div className="score-bar-container">
                    <div className="score-bar-label">
                      <span>Score</span>
                      <span>{result.similarity_score.toFixed(0)}%</span>
                    </div>
                    <div className="score-bar-background">
                      <div
                        className={`score-bar-fill ${getScoreColor(result.similarity_score)}`}
                        style={{
                          width: animate ? `${result.similarity_score}%` : "0%",
                          transition: `width 1s ease-in-out ${0.7 + index * 0.1}s`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="feedback-container">
                    <h4>Feedback:</h4>
                    <div className="feedback-text">
                      <p>
                        {getScoreLabel(result.similarity_score)} - {getFeedbackText(result.similarity_score)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={`no-results ${animate ? "animate" : ""}`}>
            <div className="no-results-icon">📋</div>
            <h2>No Results to Display</h2>
            <p>Complete the interview to see your results here.</p>
          </div>
        )}

        <div
          className={`results-actions ${animate ? "animate" : ""}`}
          style={{ animationDelay: `${0.5 + results.length * 0.1 + 0.2}s` }}
        >
          <button className="action-btn primary">
            <i className="fas fa-download"></i> Download Results
          </button>
          <button className="action-btn secondary">
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate feedback text based on score
const getFeedbackText = (score) => {
  if (score >= 80) {
    return "Your answer demonstrates a comprehensive understanding of the topic with clear articulation.";
  } else if (score >= 60) {
    return "Your answer shows good knowledge of the subject, with room for more detailed explanations.";
  } else if (score >= 40) {
    return "Your answer covers some key points, but could benefit from more depth and clarity.";
  } else {
    return "Your answer needs more development. Consider reviewing the topic and providing more specific details.";
  }
};

export default Results;
