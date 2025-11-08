import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPrompt } from './promptBuilder.js';

import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate SQL and explanation from user question using Gemini
 * @param {string} userQuestion - User's question
 * @returns {Promise<Object>} Response object with sql, explanation, and visualization type
 */
export async function generateSQLFromQuestion(userQuestion) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build the prompt
    const prompt = await buildPrompt(userQuestion);

    console.log('Prompt:', prompt);

    console.log('Sending prompt to Gemini...');

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('Gemini response:', text);

    // Try to parse as JSON
    const parsedResponse = parseGeminiResponse(text);

    return parsedResponse;

  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate SQL: ${error.message}`);
  }
}

/**
 * Parse Gemini response - handle JSON or plain text
 * @param {string} text - Response text from Gemini
 * @returns {Object} Parsed response
 */
function parseGeminiResponse(text) {
  try {
    // Remove markdown code blocks if present
    let cleanedText = text.trim();

    // Remove ```json and ``` if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Try to parse as JSON
    const parsed = JSON.parse(cleanedText);

    // Validate the response structure
    if (!parsed.explanation) {
      throw new Error('Response missing explanation field');
    }

    // Set defaults if missing
    if (!parsed.visualization) {
      parsed.visualization = parsed.sql ? 'table' : 'text';
    }

    return {
      sql: parsed.sql || null,
      explanation: parsed.explanation,
      visualization: parsed.visualization
    };

  } catch (error) {
    console.error('Failed to parse Gemini response as JSON:', error);

    // If parsing fails, return the text as explanation
    return {
      sql: null,
      explanation: text,
      visualization: 'text'
    };
  }
}

export default { generateSQLFromQuestion };
