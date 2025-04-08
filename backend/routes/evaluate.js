const express = require('express');
const axios = require('axios');
const router = express.Router();

const GEMINI_API_KEY = 'AIzaSyCKQa8dR7UU0bTuqVz8uz_v3lgS0K11uHw';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';  // Updated URL

router.post('/', async (req, res) => {
  const { candidate_answer, correct_answer } = req.body;

  console.log('Received request:', req.body);

  if (!candidate_answer || !correct_answer) {
    console.error('Missing candidate_answer or correct_answer');
    return res.status(400).json({ error: 'Both candidate_answer and correct_answer are required' });
  }

  try {
    console.log('Sending request to Gemini API...');

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          role: 'user',  // Ensure role is set correctly
          parts: [{
            text: `Rate similarity between these answers (0-100). 
                   Correct: "${correct_answer}". 
                   Candidate: "${candidate_answer}". 
                   Return ONLY a number between 0 and 100.`
          }]
        }]
      }
    );

    console.log('Gemini API Response:', JSON.stringify(response.data, null, 2));

    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('Invalid response from Gemini API: No candidates found');
    }

    const content = candidates[0]?.content?.parts;
    if (!content || content.length === 0) {
      throw new Error('Invalid response: No content parts found');
    }

    const textResponse = content[0]?.text?.trim();
    console.log('Extracted text response:', textResponse);

    const similarityScore = parseInt(textResponse, 10);

    if (isNaN(similarityScore)) {
      throw new Error('Failed to extract numerical similarity score');
    }

    console.log('Final similarity score:', similarityScore);
    res.status(200).json({ similarity_score: similarityScore });

  } catch (err) {
    console.error('Gemini API Error:', err.response?.status, err.response?.data || err.message);
    res.status(500).json({ error: 'Evaluation failed' });
  }
});

module.exports = router;
