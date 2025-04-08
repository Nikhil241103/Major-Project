import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EvaluationResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/evaluate-all');
      setResults(response.data.results);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <div className="container">
      <h2>Evaluation Results</h2>
      <button onClick={fetchResults} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Results'}
      </button>

      <table className="results-table">
        <thead>
          <tr>
            <th>Question ID</th>
            <th>Question</th>
            <th>Candidate Answer</th>
            <th>Correct Answer</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td>{result.question_id}</td>
              <td>{result.question_text}</td>
              <td>{result.candidate_answer}</td>
              <td>{result.correct_answer}</td>
              <td className={`score-${Math.floor(result.similarity_score/25)}`}>
                {result.similarity_score}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EvaluationResults;