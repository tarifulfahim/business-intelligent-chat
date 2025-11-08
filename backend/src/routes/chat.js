import express from 'express';
import { chatResponse } from '../services/chatResponse.js';
import { getSampleQuestions } from '../services/hardcodedResponses.js';

const router = express.Router();

/**
 * POST /api/chat
 * Process chat messages
 */
router.post('/', chatResponse);

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
