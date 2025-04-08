const express = require('express');
const router = express.Router();
const { Question } = require('../db');

// Save candidate answers
router.post('/', async (req, res) => {
  const { question_id, candidate_answer } = req.body;

  try {
    // For now we'll just acknowledge the answer - in a real app you would store this
    console.log(`Received answer for question ${question_id}: ${candidate_answer}`);

    // Check if the question exists
    const question = await Question.findById(question_id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // In a full implementation, you would save the answer to a MongoDB collection
    // const savedAnswer = await Answer.create({ question_id, candidate_answer });

    res.status(201).json({
      success: true,
      message: 'Answer recorded',
      question_id,
      candidate_answer
    });
  } catch (err) {
    console.error('❌ Error saving answer:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
