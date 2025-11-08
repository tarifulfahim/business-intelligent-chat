import { query } from './database.js';
import { generateSQLFromQuestion } from './llm.js';
import conversationManager from './conversationMemory.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handle chat messages - Use LLM to generate SQL with conversation context
 */
export async function chatResponse(req, res) {
  try {
    const { message, conversation_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate or use provided conversation_id
    const conversationId = conversation_id || uuidv4();

    console.log('User question:', message);
    console.log('Conversation ID:', conversationId);

    // Get conversation context from LangChain memory
    const conversationContext = await conversationManager.getContext(conversationId);

    if (conversationContext.history && conversationContext.history.length > 0) {
      console.log(`Using context with ${conversationContext.history.length} previous messages`);
    }

    // Generate SQL and explanation using Gemini with context
    const llmResponse = await generateSQLFromQuestion(message, conversationContext);

    console.log('LLM Response:', llmResponse);

    // Save user message to memory
    await conversationManager.addUserMessage(conversationId, message);

    // If no SQL was generated, return text response only
    if (!llmResponse.sql) {
      // Save assistant response to memory
      await conversationManager.addAssistantMessage(
        conversationId,
        llmResponse.explanation,
        {}
      );

      return res.json({
        answer: llmResponse.explanation,
        data: [],
        visualization: llmResponse.visualization || 'text',
        conversation_id: conversationId
      });
    }

    console.log('Executing SQL:', llmResponse.sql);

    // Execute the SQL query
    const data = await query(llmResponse.sql);

    console.log(`Query returned ${data.length} rows`);

    // Save assistant response with metadata to memory
    await conversationManager.addAssistantMessage(
      conversationId,
      llmResponse.explanation,
      {
        sql: llmResponse.sql,
        data: data,
        visualization: llmResponse.visualization
      }
    );

    // Return results
    return res.json({
      answer: llmResponse.explanation,
      data: data,
      visualization: llmResponse.visualization || 'table',
      sql: llmResponse.sql, // Include for debugging
      conversation_id: conversationId
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
