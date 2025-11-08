import { query } from "./database";

export async function chatResponse(req, res) {
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
}