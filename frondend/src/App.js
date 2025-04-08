import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import AdminComponent from './components/AdminComponent';
import Interview from './components/Interview';
import CandidateComponent from './components/CandidateComponent';
import Results from './components/Results';
import TestEvaluation from './components/TestEvaluation';
import Navbar from './components/Navbar';
import './styles/app.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('');
  const [evaluationData, setEvaluationData] = useState(null);

  // Check auth status on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Get role from localStorage if available
      const savedRole = localStorage.getItem('userRole');
      if (savedRole) {
        setRole(savedRole);
      }
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setRole('');
    setEvaluationData(null);
  };

  return (
    <Router>
      <div className="app-container">
        {!isAuthenticated ? (
          <div className="auth-container">
            <Routes>
              <Route path="/" element={<Login setAuth={setIsAuthenticated} setRole={setRole} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        ) : (
          <div className="app-content">
            <Navbar role={role} handleLogout={handleLogout} evaluationData={evaluationData} />

            <main className="main-content">
              <Routes>
                <Route
                  path="/admin"
                  element={role === 'admin' ? <AdminComponent /> : <Navigate to="/dashboard" />}
                />
                <Route
                  path="/dashboard"
                  element={<CandidateComponent setEvaluationData={setEvaluationData} />}
                />
                <Route
                  path="/interview"
                  element={<Navigate to="/dashboard" />}
                />
                <Route
                  path="/results"
                  element={evaluationData ? <Results data={evaluationData} /> : <Navigate to="/dashboard" />}
                />
                {role === 'admin' && (
                  <Route path="/test-evaluation" element={<TestEvaluation />} />
                )}
                <Route path="*" element={<Navigate to={role === 'admin' ? "/admin" : "/dashboard"} />} />
              </Routes>
            </main>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;