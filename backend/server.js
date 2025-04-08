const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import middleware
const requestLogger = require('./middleware/logger');
const { rateLimiter, authRateLimiter } = require('./middleware/rateLimiter');

// Initialize Express app
const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger); // Add request logging
app.use(rateLimiter); // Add general rate limiting

// Import MongoDB connection module
const { connectDB, closeDB, User, Admin, Question } = require('./db');

// Start server only after database is connected
async function startServer() {
  try {
    // Wait for database connection
    const db = await connectDB();
    console.log("✅ Database connected successfully");

    // Import routers
    const authRouter = require('./routes/auth');
    const questionsRouter = require('./routes/questions');
    const answersRouter = require('./routes/answers');
    const evaluateRouter = require('./routes/evaluate');

    // Register API routes
    app.use('/api/auth', authRateLimiter, authRouter); // Special rate limiting for auth routes
    app.use('/api/questions', questionsRouter);
    app.use('/api/answers', answersRouter);
    app.use('/api/evaluate', evaluateRouter);

    // Basic health check route
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        message: 'Server is running with MongoDB',
        timestamp: new Date().toISOString()
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    });

    // Start the server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, async () => {
      console.log(`✅ Server running on port ${PORT}`);
      // Initialize database with default data
      await initializeDatabase();
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => handleShutdown(server));
    process.on('SIGINT', () => handleShutdown(server));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown handler
async function handleShutdown(server) {
  console.log('🛑 Shutting down server...');

  server.close(async () => {
    console.log('✅ Server closed');

    // Close database connection
    await closeDB();

    process.exit(0);
  });
}

// Database initialization - Create default data if it doesn't exist
async function initializeDatabase() {
  try {
    const bcrypt = require('bcrypt');

    // Create default admin if none exists
    const adminCount = await Admin.countDocuments({ username: 'admin' });
    if (adminCount === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        username: 'admin',
        password: adminPassword,
        email: 'admin@example.com'
      });
      console.log('✅ Default admin account created (admin/admin123)');
    }

    // Create default candidate if none exists
    const userCount = await User.countDocuments({ username: 'candidate' });
    if (userCount === 0) {
      const candidatePassword = await bcrypt.hash('candidate123', 10);
      await User.create({
        username: 'candidate',
        password: candidatePassword,
        email: 'candidate@example.com'
      });
      console.log('✅ Default candidate account created (candidate/candidate123)');
    }

    // Create sample question if none exists
    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      await Question.create({
        question_text: "What is the capital of France?",
        correct_answer: "Paris"
      });
      console.log('✅ Sample question created');
    }

    console.log('✅ Database initialization complete');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  }
}

// Start the server
startServer();