import express from 'express';
import { query } from '../services/database.js';
import { findMatchingResponse, getSampleQuestions } from '../services/hardcodedResponses.js';

const router = express.Router();

/**
 * POST /api/chat
 * Process chat messages
 */
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Find matching hardcoded response
    const matchedResponse = findMatchingResponse(message);

    if (!matchedResponse) {
      return res.json({
        answer: "I'm not sure how to answer that question yet. Try asking about:\n" +
          getSampleQuestions().map(q => `• ${q}`).join('\n'),
        data: [],
        visualization: 'text',
        suggestions: getSampleQuestions()
      });
    }

    // Execute the SQL query
    const data = await query(matchedResponse.query);

    return res.json({
      answer: matchedResponse.explanation,
      data: data,
      visualization: matchedResponse.type,
      sql: matchedResponse.query // Include for debugging
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Failed to process your question',
      details: error.message
    });
  }
});

/**
 * GET /api/sample-questions
 * Get list of sample questions
 */
router.get('/sample-questions', (req, res) => {
  res.json({
    questions: getSampleQuestions()
  });
});

export default router;
