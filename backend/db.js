const mongoose = require('mongoose');
require('dotenv').config();

// Get MongoDB Atlas connection URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI;

// Alternative connection to in-memory MongoDB if no URI is provided
let mongoServer;

// Function to initialize the database connection
async function connectDB() {
    try {
        // Check if we have a MongoDB URI in .env
        if (MONGODB_URI) {
            // Connect to MongoDB Atlas with optimized settings
            await mongoose.connect(MONGODB_URI, {
                // Modern connection settings
                serverSelectionTimeoutMS: 5000, // Timeout for server selection
                socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
                maxPoolSize: 50, // Maintain up to 50 socket connections
            });
            console.log('✅ Connected to MongoDB Atlas database');
            return mongoose.connection;
        } else {
            // If no URI, use in-memory MongoDB for development
            console.log('⚠️ No MongoDB URI found, using in-memory database');
            const { MongoMemoryServer } = require('mongodb-memory-server');

            // Create an in-memory MongoDB server
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();

            // Connect to the in-memory server
            await mongoose.connect(mongoUri);

            console.log('✅ Connected to in-memory MongoDB database');
            return mongoose.connection;
        }
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        throw err;
    }
}

// Function to close database connection
async function closeDB() {
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');

        // If using in-memory server, stop it
        if (mongoServer) {
            await mongoServer.stop();
            console.log('✅ In-memory MongoDB server stopped');
        }
    } catch (err) {
        console.error('❌ Error closing MongoDB connection:', err);
    }
}

// Create MongoDB schemas and models

// User Schema (for candidates)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String },
    createdAt: { type: Date, default: Date.now, index: true }
});

// Admin Schema
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String },
    createdAt: { type: Date, default: Date.now, index: true }
});

// Question Schema
const questionSchema = new mongoose.Schema({
    question_text: { type: String, required: true },
    correct_answer: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: true }
});

// Create models
const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Question = mongoose.model('Question', questionSchema);

// Export connection promise and models
module.exports = {
    connectDB,
    closeDB,
    User,
    Admin,
    Question
}; 