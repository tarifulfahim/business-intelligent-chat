import { BufferWindowMemory } from 'langchain/memory';

/**
 * Conversation Memory Manager using LangChain
 * Manages conversation history and context for multi-turn conversations
 */
class ConversationManager {
  constructor() {
    // Store sessions by conversation_id
    this.sessions = new Map();
  }

  /**
   * Get or create memory for a conversation
   * @param {string} conversationId - Unique conversation identifier
   * @returns {BufferWindowMemory} LangChain memory instance
   */
  getMemory(conversationId) {
    if (!this.sessions.has(conversationId)) {
      // Create new memory that keeps last 5 exchanges
      const memory = new BufferWindowMemory({
        k: 5, // Keep last 5 message pairs
        returnMessages: true,
        memoryKey: 'history'
      });
      this.sessions.set(conversationId, {
        memory,
        entities: {}, // Store extracted entities (customer_ids, product_ids, etc.)
        lastQuery: null, // Store last SQL query
        lastResults: null // Store summary of last results
      });
    }
    return this.sessions.get(conversationId);
  }

  /**
   * Add user message to conversation history
   * @param {string} conversationId - Conversation identifier
   * @param {string} message - User's message
   */
  async addUserMessage(conversationId, message) {
    const session = this.getMemory(conversationId);
    await session.memory.saveContext(
      { input: message },
      { output: '' } // Will be filled when assistant responds
    );
  }

  /**
   * Add assistant response to conversation history
   * @param {string} conversationId - Conversation identifier
   * @param {string} response - Assistant's response
   * @param {Object} metadata - Additional metadata (sql, entities, etc.)
   */
  async addAssistantMessage(conversationId, response, metadata = {}) {
    const session = this.getMemory(conversationId);

    // Store SQL query and results summary
    if (metadata.sql) {
      session.lastQuery = metadata.sql;
    }

    // Extract and store entities from results
    if (metadata.data && metadata.data.length > 0) {
      session.entities = this.extractEntities(metadata.data);
      session.lastResults = {
        rowCount: metadata.data.length,
        columns: Object.keys(metadata.data[0]),
        sample: metadata.data.slice(0, 3) // Keep first 3 rows as sample
      };
    }

    // Save to memory (update the last output)
    await session.memory.saveContext(
      { input: 'hello' },
      { output: response }
    );
  }

  /**
   * Extract entities from query results for context
   * @param {Array} data - Query results
   * @returns {Object} Extracted entities
   */
  extractEntities(data) {
    if (!data || data.length === 0) return {};

    const entities = {};
    const firstRow = data[0];

    // Extract customer information
    if (firstRow.customer_id) {
      entities.customer_ids = data.map(row => row.customer_id).filter(Boolean);
    }
    if (firstRow.company_name) {
      entities.customer_names = data.map(row => row.company_name).filter(Boolean);
    }

    // Extract product information
    if (firstRow.product_id) {
      entities.product_ids = data.map(row => row.product_id).filter(Boolean);
    }
    if (firstRow.product_name) {
      entities.product_names = data.map(row => row.product_name).filter(Boolean);
    }

    // Extract order information
    if (firstRow.order_id) {
      entities.order_ids = data.map(row => row.order_id).filter(Boolean);
    }

    // Extract employee information
    if (firstRow.employee_id) {
      entities.employee_ids = data.map(row => row.employee_id).filter(Boolean);
    }
    if (firstRow.employee_name) {
      entities.employee_names = data.map(row => row.employee_name).filter(Boolean);
    }

    // Extract category information
    if (firstRow.category_id) {
      entities.category_ids = data.map(row => row.category_id).filter(Boolean);
    }
    if (firstRow.category_name) {
      entities.category_names = data.map(row => row.category_name).filter(Boolean);
    }

    // Extract country/location information
    if (firstRow.country) {
      entities.countries = [...new Set(data.map(row => row.country).filter(Boolean))];
    }
    if (firstRow.city) {
      entities.cities = [...new Set(data.map(row => row.city).filter(Boolean))];
    }

    return entities;
  }

  /**
   * Get conversation context including history and entities
   * @param {string} conversationId - Conversation identifier
   * @returns {Promise<Object>} Context object
   */
  async getContext(conversationId) {
    console.log('Getting context for conversation:', conversationId);
    const session = this.getMemory(conversationId);

    // Load memory variables from LangChain
    const memoryVariables = await session.memory.loadMemoryVariables({});

    return {
      history: memoryVariables.history || [],
      entities: session.entities || {},
      lastQuery: session.lastQuery,
      lastResults: session.lastResults
    };
  }

  /**
   * Format conversation history for prompt
   * @param {Array} history - Chat history from LangChain
   * @returns {string} Formatted history string
   */
  formatHistoryForPrompt(history) {
    if (!history || history.length === 0) {
      return 'No previous conversation.';
    }

    let formatted = 'CONVERSATION HISTORY:\n';

    for (const message of history) {
      if (message._getType() === 'human') {
        formatted += `User: "${message.content}"\n`;
      } else if (message._getType() === 'ai') {
        formatted += `Assistant: "${message.content}"\n`;
      }
    }

    return formatted;
  }

  /**
   * Format entities for prompt
   * @param {Object} entities - Extracted entities
   * @returns {string} Formatted entities string
   */
  formatEntitiesForPrompt(entities) {
    if (!entities || Object.keys(entities).length === 0) {
      return '';
    }

    let formatted = '\nREFERENCED ENTITIES FROM PREVIOUS QUERY:\n';

    if (entities.customer_ids && entities.customer_ids.length > 0) {
      formatted += `- Customer IDs: [${entities.customer_ids.slice(0, 10).join(', ')}${entities.customer_ids.length > 10 ? '...' : ''}]\n`;
    }
    if (entities.customer_names && entities.customer_names.length > 0) {
      formatted += `- Customer Names: [${entities.customer_names.slice(0, 5).join(', ')}${entities.customer_names.length > 5 ? '...' : ''}]\n`;
    }
    if (entities.product_ids && entities.product_ids.length > 0) {
      formatted += `- Product IDs: [${entities.product_ids.slice(0, 10).join(', ')}${entities.product_ids.length > 10 ? '...' : ''}]\n`;
    }
    if (entities.product_names && entities.product_names.length > 0) {
      formatted += `- Product Names: [${entities.product_names.slice(0, 5).join(', ')}${entities.product_names.length > 5 ? '...' : ''}]\n`;
    }
    if (entities.employee_ids && entities.employee_ids.length > 0) {
      formatted += `- Employee IDs: [${entities.employee_ids.join(', ')}]\n`;
    }
    if (entities.category_names && entities.category_names.length > 0) {
      formatted += `- Categories: [${entities.category_names.join(', ')}]\n`;
    }
    if (entities.countries && entities.countries.length > 0) {
      formatted += `- Countries: [${entities.countries.join(', ')}]\n`;
    }

    return formatted;
  }

  /**
   * Clear conversation history
   * @param {string} conversationId - Conversation identifier
   */
  clearConversation(conversationId) {
    this.sessions.delete(conversationId);
  }

  /**
   * Get all active conversation IDs
   * @returns {Array<string>} List of conversation IDs
   */
  getActiveConversations() {
    return Array.from(this.sessions.keys());
  }
}

// Export singleton instance
export default new ConversationManager();
