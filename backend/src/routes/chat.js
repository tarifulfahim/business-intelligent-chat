import express from 'express';
import { chatResponse } from '../services/chatResponse.js';

const router = express.Router();

// Sample questions for users to try
const SAMPLE_QUESTIONS = [
  "Show me top customers by revenue",
  "What's our total revenue?",
  "Show me top selling products",
  "Revenue by product category",
  "Show orders by country",
  "Employee sales performance",
  "Which customers are from Germany?",
  "What's the average order value?"
];

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
    questions: SAMPLE_QUESTIONS
  });
});

export default router;
