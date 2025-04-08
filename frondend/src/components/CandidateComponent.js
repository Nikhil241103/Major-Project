import React, { useState, useEffect, useRef } from "react";
import { questionsAPI } from "../services/api";
import Results from "./Results";
import "../styles/candidatecomponent.css";

const CandidateComponent = ({ setEvaluationData }) => {
  const [activeView, setActiveView] = useState("dashboard");
  const [interviews, setInterviews] = useState(() => {
    // Try to get interviews from localStorage
    const savedInterviews = localStorage.getItem('interviews');
    return savedInterviews ? JSON.parse(savedInterviews) : [
      { id: 1, title: "Frontend Developer", description: "React, JavaScript, CSS", status: "active", questions: [] },
      { id: 2, title: "Backend Developer", description: "Node.js, Express, MongoDB", status: "pending", questions: [] }
    ];
  });
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Interview state
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [candidateAnswers, setCandidateAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Update the useEffect to check for changes in localStorage
  useEffect(() => {
    // Add event listener to detect changes in localStorage
    const handleStorageChange = () => {
      const savedInterviews = localStorage.getItem('interviews');
      if (savedInterviews) {
        setInterviews(JSON.parse(savedInterviews));
      }
    };

    // Initial load
    handleStorageChange();

    // Listen for changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update the loadInterviewQuestions function to filter questions for the selected interview
  const loadInterviewQuestions = async (interviewId) => {
    try {
      // First, get all questions
      const response = await questionsAPI.getQuestions();
      const allQuestions = response.data || [];

      // Find the selected interview
      const interview = interviews.find(i => i.id === interviewId);

      if (interview && interview.questions && interview.questions.length > 0) {
        // Filter questions to only include those in the interview
        const interviewQuestions = allQuestions.filter(q =>
          interview.questions.includes(q._id)
        );

        setQuestions(interviewQuestions);
        console.log(`Loaded ${interviewQuestions.length} questions for interview ${interviewId}`);
      } else {
        // If interview has no questions or couldn't find interview, show all questions
        console.log("No specific questions found for this interview, showing all available questions");
        setQuestions(allQuestions);
      }

      // Reset interview state
      setCurrentQuestion(0);
      setCandidateAnswers([]);
      setResults([]);
      setTestCompleted(false);
      setTimer(60);
      setTranscript("");

      // Switch to interview view
      setActiveView("interview");
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestions([]);
    }
  };

  const startInterview = (interview) => {
    setSelectedInterview(interview);
    loadInterviewQuestions(interview.id);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;

      if ("webkitSpeechRecognition" in window) {
        recognitionRef.current = new webkitSpeechRecognition();
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            }
          }
          setTranscript(finalTranscript.trim());
        };

        recognitionRef.current.start();
        setIsRecording(true);
        startTimer();
      } else {
        alert("Speech recognition not supported in your browser.");
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
    await saveTranscript();
  };

  const saveTranscript = async () => {
    if (!transcript.trim()) {
      alert("No answer detected! Please try again.");
      return;
    }

    if (!questions[currentQuestion]) {
      alert("Error: Question data is missing.");
      return;
    }

    const updatedAnswers = [...candidateAnswers, transcript];
    setCandidateAnswers(updatedAnswers);

    try {
      // Save the answer (this would typically be an API call)
      // await saveAnswer(questions[currentQuestion]._id, transcript);
      console.log("Saving answer:", transcript);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setTranscript("");
        setTimer(60);
      } else {
        evaluateAnswers(updatedAnswers);
      }
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  const evaluateAnswers = async (answers) => {
    try {
      const evaluationResults = [];
      for (let i = 0; i < questions.length; i++) {
        // This would typically be an API call to evaluate answers
        // For now, we'll simulate with random scores
        const similarityScore = Math.random().toFixed(2);
        evaluationResults.push({
          question: questions[i].question_text,
          candidate_answer: answers[i],
          correct_answer: questions[i].correct_answer,
          similarity_score: similarityScore,
        });
      }

      // Store results locally
      setResults(evaluationResults);
      setTestCompleted(true);

      // Pass evaluation data to parent component for Results page
      if (setEvaluationData) {
        const fullEvaluationData = {
          interviewTitle: selectedInterview.title,
          interviewId: selectedInterview.id,
          candidateName: localStorage.getItem('username') || 'Candidate',
          date: new Date().toISOString(),
          results: evaluationResults,
          averageScore: evaluationResults.reduce((sum, item) => sum + parseFloat(item.similarity_score), 0) / evaluationResults.length
        };
        setEvaluationData(fullEvaluationData);
      }
    } catch (error) {
      console.error("Error evaluating answers:", error);
    }
  };

  const returnToDashboard = () => {
    setActiveView("dashboard");
    setSelectedInterview(null);
    setTestCompleted(false);
  };

  // Render the candidate dashboard with available interviews
  const renderDashboard = () => {
    return (
      <div className="candidate-dashboard">
        <div className="dashboard-header">
          <h1>Available Interviews</h1>
          <p>Select an interview to begin</p>
        </div>

        <div className="interviews-grid">
          {interviews
            .filter(interview => interview.status === "active")
            .map(interview => (
              <div key={interview.id} className="interview-card">
                <div className="card-content">
                  <h2>{interview.title}</h2>
                  <p className="description">{interview.description}</p>
                  <div className="interview-meta">
                    <span className="question-count">{interview.questions?.length || 0} Questions</span>
                    <span className="time-estimate">~{interview.questions?.length * 2 || 0} mins</span>
                  </div>
                </div>
                <button
                  className="start-interview-btn"
                  onClick={() => startInterview(interview)}
                >
                  Start Interview
                </button>
              </div>
            ))}
        </div>

        {interviews.filter(interview => interview.status === "active").length === 0 && (
          <div className="no-interviews">
            <div className="empty-state">
              <i className="fas fa-calendar-times"></i>
              <p>No active interviews available at the moment.</p>
              <p className="sub-message">Please check back later or contact the administrator.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the interview interface
  const renderInterview = () => {
    if (!selectedInterview) return null;

    return (
      <div className="interview-container">
        <div className="interview-header">
          <h1>{selectedInterview.title} Interview</h1>
          <button className="exit-btn" onClick={returnToDashboard}>
            <i className="fas fa-times"></i> Exit Interview
          </button>
        </div>

        {!testCompleted ? (
          <div className="question-container">
            {questions.length > 0 && currentQuestion < questions.length ? (
              <>
                <div className="question-header">
                  <h2>Question {currentQuestion + 1} of {questions.length}</h2>
                  <div className="timer">
                    <i className="fas fa-clock"></i> {timer} seconds
                  </div>
                </div>

                <div className="question-text">
                  <p>{questions[currentQuestion].question_text}</p>
                </div>

                <div className="video-container">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{ width: '100%', height: 'auto', maxHeight: '375px' }}
                  />
                </div>

                <div className="transcript-container">
                  <h3>Your Answer:</h3>
                  <div className="transcript-box">
                    <p>{transcript}</p>
                  </div>
                </div>

                <div className="recording-controls">
                  {!isRecording ? (
                    <button
                      className="record-btn start"
                      onClick={startRecording}
                    >
                      <i className="fas fa-microphone"></i> Start Recording
                    </button>
                  ) : (
                    <button
                      className="record-btn stop"
                      onClick={stopRecording}
                    >
                      <i className="fas fa-stop-circle"></i> Stop Recording
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading questions...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="results-container">
            <h2>Interview Results</h2>

            <div className="results-summary">
              <p>
                You've completed the {selectedInterview.title} interview.
                Here are your results:
              </p>
            </div>

            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className="result-item">
                  <h3>Question {index + 1}</h3>
                  <p className="question">{result.question}</p>

                  <div className="answer-comparison">
                    <div className="your-answer">
                      <h4>Your Answer:</h4>
                      <p>{result.candidate_answer}</p>
                    </div>

                    <div className="correct-answer">
                      <h4>Expected Answer:</h4>
                      <p>{result.correct_answer}</p>
                    </div>
                  </div>

                  <div className="score-container">
                    <p className="score-label">Match Score:</p>
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{ width: `${result.similarity_score * 100}%` }}
                      ></div>
                    </div>
                    <p className="score-value">{Math.round(result.similarity_score * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="results-actions">
              <button className="return-btn" onClick={returnToDashboard}>
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="candidate-main">
      {activeView === "dashboard" ? renderDashboard() : renderInterview()}
    </div>
  );
};

export default CandidateComponent;
