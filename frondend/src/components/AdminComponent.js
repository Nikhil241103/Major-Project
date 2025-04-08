import React, { useState, useEffect } from "react";
import { questionsAPI } from "../services/api";
import "../styles/admincomponentcss.css";

const AdminComponent = () => {
  const [activeTab, setActiveTab] = useState("interviews"); // Default to 'interviews' tab
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Interview management state
  const [interviews, setInterviews] = useState(() => {
    // Try to get interviews from localStorage first
    const savedInterviews = localStorage.getItem('interviews');
    return savedInterviews ? JSON.parse(savedInterviews) : [
      { id: 1, title: "Frontend Developer", description: "React, JavaScript, CSS", status: "active", questions: [] },
      { id: 2, title: "Backend Developer", description: "Node.js, Express, MongoDB", status: "pending", questions: [] }
    ];
  });
  const [newInterview, setNewInterview] = useState({
    title: "",
    description: "",
    questions: []
  });
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isEditingInterview, setIsEditingInterview] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState(null);

  // Fetch questions from the backend
  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await questionsAPI.getQuestions();
      console.log("Fetched questions:", response.data);
      setQuestions(response.data);

      // Update available questions, filtering out any that are already in selected questions
      const selectedIds = selectedQuestions.map(q => q._id);
      setAvailableQuestions(response.data.filter(q => !selectedIds.includes(q._id)));

      setError("");
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to fetch questions. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(); // Load questions on page load
  }, []);

  // Add this effect to save interviews to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('interviews', JSON.stringify(interviews));
  }, [interviews]);

  // Add a new question
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const response = await questionsAPI.addQuestion({
        question_text: newQuestion,
        correct_answer: correctAnswer,
      });

      const newQuestionData = response.data;
      setQuestions([...questions, newQuestionData]);
      setAvailableQuestions([...availableQuestions, newQuestionData]);

      setNewQuestion("");
      setCorrectAnswer("");
      setSuccess("Question added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error adding question:", err);
      setError("Failed to add question.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  // Delete a question
  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await questionsAPI.deleteQuestion(id);
      console.log("✅ Question deleted, fetching updated list...");

      // Update local state without refetching
      setQuestions(questions.filter(q => q._id !== id));
      setAvailableQuestions(availableQuestions.filter(q => q._id !== id));

      // Also remove from any interviews
      setInterviews(interviews.map(interview => ({
        ...interview,
        questions: interview.questions.filter(qId => qId !== id)
      })));

      setSuccess("Question deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("❌ Error deleting question:", error);
      setError("Failed to delete question.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setDeleteId(null);
    }
  };

  // Handle adding a question to the new interview
  const handleAddQuestionToInterview = (questionId) => {
    const questionToAdd = availableQuestions.find(q => q._id === questionId);
    if (questionToAdd) {
      setSelectedQuestions([...selectedQuestions, questionToAdd]);
      setAvailableQuestions(availableQuestions.filter(q => q._id !== questionId));
    }
  };

  // Handle removing a question from the new interview
  const handleRemoveQuestionFromInterview = (questionId) => {
    const questionToRemove = selectedQuestions.find(q => q._id === questionId);
    if (questionToRemove) {
      setAvailableQuestions([...availableQuestions, questionToRemove]);
      setSelectedQuestions(selectedQuestions.filter(q => q._id !== questionId));
    }
  };

  // Handle creating a new interview
  const handleCreateInterview = (e) => {
    e.preventDefault();

    if (isEditingInterview) {
      // Update existing interview
      const updatedInterviews = interviews.map(interview => {
        if (interview.id === editingInterviewId) {
          return {
            ...interview,
            title: newInterview.title,
            description: newInterview.description,
            questions: selectedQuestions.map(q => q._id)
          };
        }
        return interview;
      });

      setInterviews(updatedInterviews);
      setSuccess("Interview updated successfully!");
    } else {
      // Create new interview
      const newId = interviews.length ? Math.max(...interviews.map(i => i.id)) + 1 : 1;
      const newInterviewWithId = {
        ...newInterview,
        id: newId,
        status: 'pending',
        questions: selectedQuestions.map(q => q._id),
        dateCreated: new Date().toISOString()
      };

      setInterviews([...interviews, newInterviewWithId]);
      setSuccess("Interview created successfully!");
    }

    // Reset form
    setNewInterview({ title: "", description: "", questions: [] });
    setSelectedQuestions([]);
    setIsEditingInterview(false);
    setEditingInterviewId(null);

    // Reset available questions
    fetchQuestions();

    setTimeout(() => setSuccess(""), 3000);
  };

  // Handle editing an interview
  const handleEditInterview = (interview) => {
    setIsEditingInterview(true);
    setEditingInterviewId(interview.id);
    setNewInterview({
      title: interview.title,
      description: interview.description,
      questions: interview.questions
    });

    // Set up selected questions
    const interviewQuestionIds = interview.questions;
    const selectedQuestions = questions.filter(q => interviewQuestionIds.includes(q._id));
    setSelectedQuestions(selectedQuestions);

    // Update available questions
    setAvailableQuestions(questions.filter(q => !interviewQuestionIds.includes(q._id)));

    // Scroll to the form
    document.querySelector('.create-interview').scrollIntoView({ behavior: 'smooth' });
  };

  // Handle deleting an interview
  const handleDeleteInterview = (id) => {
    setInterviews(interviews.filter(interview => interview.id !== id));
    setSuccess("Interview deleted successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Toggle interview status
  const toggleInterviewStatus = (id) => {
    setInterviews(interviews.map(interview => {
      if (interview.id === id) {
        const newStatus = interview.status === 'active' ? 'pending' : 'active';
        return { ...interview, status: newStatus };
      }
      return interview;
    }));
  };

  // Render tabs for the admin dashboard
  const renderTabs = () => {
    return (
      <div className="admin-tabs">
        <button
          className={activeTab === "interviews" ? "tab-active" : ""}
          onClick={() => setActiveTab("interviews")}
        >
          <i className="fas fa-briefcase"></i> Manage Interviews
        </button>
        <button
          className={activeTab === "questions" ? "tab-active" : ""}
          onClick={() => setActiveTab("questions")}
        >
          <i className="fas fa-question-circle"></i> Manage Questions
        </button>
      </div>
    );
  };

  // Render the interviews management tab
  const renderInterviewsTab = () => {
    return (
      <div className="interviews-container">
        <div className="interviews-header">
          <h2>Manage Interviews</h2>
          <p>Create and manage interviews for different job roles</p>
        </div>

        {/* Notification Messages */}
        {error && <div className="notification error fade-in">{error}</div>}
        {success && <div className="notification success fade-in">{success}</div>}

        <div className="interviews-list">
          <h3>Active Interviews</h3>
          {interviews.length > 0 ? (
            <table className="interviews-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map(interview => (
                  <tr key={interview.id}>
                    <td>{interview.title}</td>
                    <td>{interview.description}</td>
                    <td>{interview.questions?.length || 0} questions</td>
                    <td>
                      <span
                        className={`status-badge ${interview.status}`}
                        onClick={() => toggleInterviewStatus(interview.id)}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle status"
                      >
                        {interview.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-btn"
                          title="View Interview Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="edit-btn"
                          title="Edit Interview"
                          onClick={() => handleEditInterview(interview)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="delete-btn"
                          title="Delete Interview"
                          onClick={() => handleDeleteInterview(interview.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">
              <p>No interviews created yet.</p>
            </div>
          )}
        </div>

        <div className="create-interview">
          <h3>{isEditingInterview ? "Edit Interview" : "Create New Interview"}</h3>
          <form onSubmit={handleCreateInterview}>
            <div className="form-group">
              <label>Job Title:</label>
              <input
                type="text"
                value={newInterview.title}
                onChange={(e) => setNewInterview({ ...newInterview, title: e.target.value })}
                placeholder="e.g. Frontend Developer"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={newInterview.description}
                onChange={(e) => setNewInterview({ ...newInterview, description: e.target.value })}
                placeholder="Required skills, experience, etc."
                required
                className="form-input"
                rows="3"
              />
            </div>

            <div className="question-selection">
              <div className="available-questions">
                <h4>Available Questions</h4>
                <div className="question-list">
                  {availableQuestions.length > 0 ? (
                    availableQuestions.map(question => (
                      <div key={question._id} className="question-item">
                        <p>{question.question_text}</p>
                        <button
                          type="button"
                          onClick={() => handleAddQuestionToInterview(question._id)}
                          className="add-btn small"
                          title="Add to interview"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No available questions. Add questions in the Questions tab.</p>
                  )}
                </div>
              </div>

              <div className="selected-questions">
                <h4>Selected Questions</h4>
                <div className="question-list">
                  {selectedQuestions.length > 0 ? (
                    selectedQuestions.map(question => (
                      <div key={question._id} className="question-item selected">
                        <p>{question.question_text}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionFromInterview(question._id)}
                          className="remove-btn small"
                          title="Remove from interview"
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No questions selected.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              {isEditingInterview && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditingInterview(false);
                    setEditingInterviewId(null);
                    setNewInterview({ title: "", description: "", questions: [] });
                    setSelectedQuestions([]);
                    fetchQuestions();
                  }}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              )}
              <button
                type="submit"
                className="create-btn"
                disabled={!newInterview.title || !newInterview.description || selectedQuestions.length === 0}
              >
                <i className={isEditingInterview ? "fas fa-save" : "fas fa-plus-circle"}></i>
                {isEditingInterview ? " Update Interview" : " Create Interview"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render the questions management tab
  const renderQuestionsTab = () => {
  return (
    <div className="question-manager">
      <div className="header-container">
        <h1>Manage Questions</h1>
        <div className="underline"></div>
      </div>

      {/* Add Question Form */}
      <div className="form-container">
        <form onSubmit={handleAddQuestion}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              required
              className="form-input"
            />
            <input
              type="text"
              placeholder="Enter correct answer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              required
              className="form-input"
            />
            <button 
              type="submit" 
              className="add-btn"
              disabled={isAdding}
            >
              {isAdding ? (
                <span className="spinner"></span>
              ) : (
                "Add Question"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Messages */}
      {error && <div className="notification error fade-in">{error}</div>}
      {success && <div className="notification success fade-in">{success}</div>}

      {/* Questions Table */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner large"></div>
            <p>Loading questions...</p>
          </div>
        ) : (
          <table className="questions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Question</th>
                <th>Correct Answer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {questions.length > 0 ? (
                questions.map((q) => (
                    <tr key={q._id} className="table-row">
                      <td>{q._id}</td>
                    <td>{q.question_text}</td>
                    <td>{q.correct_answer}</td>
                    <td>
                      <button
                          onClick={() => handleDelete(q._id)}
                        className="delete-btn"
                          disabled={deleteId === q._id}
                      >
                          {deleteId === q._id ? (
                          <span className="spinner small"></span>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    <div className="no-data-content">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                      <p>No questions found. Add your first question above!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

  return (
    <div className="admin-dashboard">
      {renderTabs()}

      <div className="admin-content">
        {activeTab === "interviews" && renderInterviewsTab()}
        {activeTab === "questions" && renderQuestionsTab()}
      </div>
    </div>
  );
};

export default AdminComponent;
