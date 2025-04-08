import React, { useState } from 'react';
import { evaluateAPI } from '../services/api';

const TestEvaluation = () => {
  const [testResults, setTestResults] = useState([]);
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Test cases
  const testCases = [
    { candidate: "JavaScript.", correct: "javascript", expected: 100 },
    { candidate: "JS", correct: "javascript", expected: 50 },
    { candidate: "Python", correct: "javascript", expected: 0 },
    { candidate: "The DOM is a programming interface", correct: "DOM is a web API", expected: 60 }
  ];

  const testApiConnection = async () => {
    setLoading(true);
    try {
      const response = await evaluateAPI.testConnection();
      setApiStatus({
        status: 'success',
        data: response.data
      });
    } catch (error) {
      setApiStatus({
        status: 'error',
        error: error.response?.data || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const runEvaluationTests = async () => {
    setLoading(true);
    const results = [];

    for (const testCase of testCases) {
      try {
        const startTime = performance.now();
        const response = await evaluateAPI.evaluateAnswer(
          testCase.candidate,
          testCase.correct
        );
        const endTime = performance.now();

        results.push({
          ...testCase,
          actual: response.data.similarity_score,
          method: response.data.method || 'local',
          time: `${(endTime - startTime).toFixed(1)}ms`,
          match: Math.abs(response.data.similarity_score - testCase.expected) <= 20
        });
      } catch (error) {
        results.push({
          ...testCase,
          actual: 'Error',
          error: error.message
        });
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="test-container">
      <h2>Evaluation System Tests</h2>

      <div className="test-section">
        <h3>API Connection</h3>
        <button onClick={testApiConnection} disabled={loading}>
          Test Gemini API Connection
        </button>
        {apiStatus && (
          <div className={`api-status ${apiStatus.status}`}>
            <pre>{JSON.stringify(apiStatus, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="test-section">
        <h3>Evaluation Logic</h3>
        <button onClick={runEvaluationTests} disabled={loading}>
          Run Evaluation Tests
        </button>

        {testResults.length > 0 && (
          <table className="test-results">
            <thead>
              <tr>
                <th>Candidate Answer</th>
                <th>Correct Answer</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Method</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((test, index) => (
                <tr key={index}>
                  <td>{test.candidate}</td>
                  <td>{test.correct}</td>
                  <td>{test.expected}%</td>
                  <td>{typeof test.actual === 'number' ? `${test.actual}%` : test.actual}</td>
                  <td>{test.method}</td>
                  <td>{test.time || '-'}</td>
                  <td>
                    {test.error ? (
                      <span className="error">Error</span>
                    ) : test.match ? (
                      <span className="success">✓</span>
                    ) : (
                      <span className="warning">⚠</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TestEvaluation;