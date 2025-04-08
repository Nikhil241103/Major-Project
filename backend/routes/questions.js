const express = require('express');
const router = express.Router();
const { Question } = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');

// Get all questions - public route
router.get('/', async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        res.status(200).json(questions);
    } catch (err) {
        console.error('❌ Error fetching questions:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Get question by ID - public route
router.get('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json(question);
    } catch (err) {
        console.error('❌ Error fetching question by ID:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Add a new question - admin only
router.post('/', authenticate, adminOnly, async (req, res) => {
    console.log("📝 Adding new question:", req.body);
    const { question_text, correct_answer } = req.body;

    if (!question_text || !correct_answer) {
        console.warn("⚠️ Missing required question fields");
        return res.status(400).json({ message: 'Both question_text and correct_answer are required' });
    }

    try {
        const newQuestion = new Question({
            question_text,
            correct_answer
        });

        const savedQuestion = await newQuestion.save();
        console.log("✅ Question added successfully:", savedQuestion._id);
        res.status(201).json(savedQuestion);
    } catch (err) {
        console.error('❌ Error adding question:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Update a question - admin only
router.put('/:id', authenticate, adminOnly, async (req, res) => {
    const { question_text, correct_answer } = req.body;

    if (!question_text || !correct_answer) {
        return res.status(400).json({ message: 'Both question_text and correct_answer are required' });
    }

    try {
        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            { question_text, correct_answer },
            { new: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json(updatedQuestion);
    } catch (err) {
        console.error('❌ Error updating question:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Delete a question - admin only
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);

        if (!deletedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json({
            message: 'Question deleted successfully',
            deletedQuestion
        });
    } catch (err) {
        console.error('❌ Error deleting question:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router; 