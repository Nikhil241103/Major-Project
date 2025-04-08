import axios from 'axios';

// Backend API URL
const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optionally redirect to login page if 401 error
      // window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (usernameOrEmail, password, role) => {
    console.log(`Attempting to login as ${role} with identifier: ${usernameOrEmail}`);
    // Use the unified login endpoint with either username or email
    return api.post('/auth/login', { identifier: usernameOrEmail, password, role })
      .then(response => {
        console.log('Login successful:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Login failed:', error.response?.data || error.message);
        throw error;
      });
  },

  // Separate login methods for backward compatibility
  adminLogin: (usernameOrEmail, password) => {
    console.log(`Attempting admin login with identifier: ${usernameOrEmail}`);
    return api.post('/auth/login/admin', { identifier: usernameOrEmail, password });
  },

  candidateLogin: (usernameOrEmail, password) => {
    console.log(`Attempting candidate login with identifier: ${usernameOrEmail}`);
    return api.post('/auth/login/candidate', { identifier: usernameOrEmail, password });
  },

  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // Add methods to check username and email availability
  checkUsername: (username) => {
    return api.post('/auth/check-username', { username });
  },

  checkEmail: (email) => {
    return api.post('/auth/check-email', { email });
  },

  forgotPassword: (usernameOrEmail) => {
    return api.post('/auth/forgot-password', { identifier: usernameOrEmail });
  },

  resetPassword: (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword });
  }
};

// Questions API
export const questionsAPI = {
  getAll: () => {
    return api.get('/questions');
  },

  getQuestions: () => {
    return api.get('/questions');
  },

  getById: (id) => {
    return api.get(`/questions/${id}`);
  },

  addQuestion: (questionData) => {
    return api.post('/questions', questionData);
  },

  create: (questionData) => {
    return api.post('/questions', questionData);
  },

  update: (id, questionData) => {
    return api.put(`/questions/${id}`, questionData);
  },

  delete: (id) => {
    return api.delete(`/questions/${id}`);
  },

  deleteQuestion: (id) => {
    return api.delete(`/questions/${id}`);
  },

  saveAnswer: (questionId, candidateAnswer) => {
    return api.post('/answers', {
      question_id: questionId,
      candidate_answer: candidateAnswer
    });
  }
};

// Evaluation API
export const evaluateAPI = {
  evaluateAnswer: (candidateAnswer, correctAnswer) => {
    return api.post('/evaluate', { candidate_answer: candidateAnswer, correct_answer: correctAnswer });
  },

  testConnection: () => {
    return api.get('/evaluate/test-gemini');
  }
};

export default api;
