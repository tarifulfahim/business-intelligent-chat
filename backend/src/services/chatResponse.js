import { query } from './database.js';
import { generateSQLFromQuestion } from './llm.js';

/**
 * Handle chat messages - Use LLM to generate SQL
 */
export async function chatResponse(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('User question:', message);

    // Generate SQL and explanation using Gemini
    const llmResponse = await generateSQLFromQuestion(message);

    console.log('LLM Response:', llmResponse);

    // If no SQL was generated, return text response only
    if (!llmResponse.sql) {
      return res.json({
        answer: llmResponse.explanation,
        data: [],
        visualization: llmResponse.visualization || 'text'
      });
    }

    // Validate SQL for security
    // const validation = completeValidation(llmResponse.sql);

    // if (!validation.isValid) {
    //   console.error('SQL validation failed:', validation.error);
    //   return res.json({
    //     answer: `I generated a query, but it failed security validation: ${validation.error}. Please try rephrasing your question.`,
    //     data: [],
    //     visualization: 'text'
    //   });
    // }

    console.log('Executing SQL:', llmResponse.sql);

    // Execute the validated SQL query
    const data = await query(llmResponse.sql);

    console.log(`Query returned ${data.length} rows`);

    // Return results
    return res.json({
      answer: llmResponse.explanation,
      data: data,
      visualization: llmResponse.visualization || 'table',
      sql: llmResponse.sql // Include for debugging
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Failed to process your question',
      details: error.message
    });
  }
}

export default { chatResponse };
