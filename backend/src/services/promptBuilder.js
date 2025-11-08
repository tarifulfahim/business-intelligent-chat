import { getSchema } from './database.js';

/**
 * Get schema description for Northwind database
 * @returns {Promise<string>} Formatted schema description
 */
export async function getSchemaDescription() {
  try {
    const schema = await getSchema();

    // Format schema into readable text
    let schemaText = 'Available Tables and Columns:\n\n';

    for (const [tableName, columns] of Object.entries(schema)) {
      schemaText += `${tableName}:\n`;
      schemaText += columns.map(col => `  - ${col.name} (${col.type})`).join('\n');
      schemaText += '\n\n';
    }

    return schemaText;
  } catch (error) {
    console.error('Error fetching schema:', error);
    // Return a basic schema description as fallback
    return `
Available Tables and Columns:

customers:
  - customer_id (character varying)
  - company_name (character varying)
  - contact_name (character varying)
  - city (character varying)
  - country (character varying)

orders:
  - order_id (smallint)
  - customer_id (character varying)
  - employee_id (smallint)
  - order_date (date)
  - shipped_date (date)

order_details:
  - order_id (smallint)
  - product_id (smallint)
  - unit_price (real)
  - quantity (smallint)
  - discount (real)

products:
  - product_id (smallint)
  - product_name (character varying)
  - category_id (smallint)
  - unit_price (real)
  - units_in_stock (smallint)

employees:
  - employee_id (smallint)
  - first_name (character varying)
  - last_name (character varying)
  - title (character varying)
  - hire_date (date)

categories:
  - category_id (smallint)
  - category_name (character varying)
  - description (text)

suppliers:
  - supplier_id (smallint)
  - company_name (character varying)
  - city (character varying)
  - country (character varying)
`;
  }
}

/**
 * Build the complete prompt for Gemini
 * @param {string} userQuestion - User's question
 * @param {Object} conversationContext - Optional conversation context
 * @returns {Promise<string>} Complete prompt
 */
export async function buildPrompt(userQuestion, conversationContext = null) {
  const schemaDescription = await getSchemaDescription();

  // Build context section if conversation history exists
  let contextSection = '';

  if (conversationContext && conversationContext.history && conversationContext.history.length > 0) {
    contextSection = '\n=== CONVERSATION CONTEXT ===\n\n';

    // Add conversation history
    contextSection += 'Previous conversation:\n';
    for (const message of conversationContext.history) {
      if (message._getType() === 'human') {
        contextSection += `User: "${message.content}"\n`;
      } else if (message._getType() === 'ai') {
        contextSection += `Assistant: "${message.content}"\n`;
      }
    }

    // Add extracted entities if available
    if (conversationContext.entities && Object.keys(conversationContext.entities).length > 0) {
      contextSection += '\nReferenced entities from previous query:\n';

      const entities = conversationContext.entities;

      if (entities.customer_ids && entities.customer_ids.length > 0) {
        contextSection += `- Customer IDs: [${entities.customer_ids.slice(0, 10).join(', ')}${entities.customer_ids.length > 10 ? ', ...' : ''}]\n`;
      }
      if (entities.customer_names && entities.customer_names.length > 0) {
        contextSection += `- Customer Names: [${entities.customer_names.slice(0, 5).map(n => `"${n}"`).join(', ')}${entities.customer_names.length > 5 ? ', ...' : ''}]\n`;
      }
      if (entities.product_ids && entities.product_ids.length > 0) {
        contextSection += `- Product IDs: [${entities.product_ids.slice(0, 10).join(', ')}${entities.product_ids.length > 10 ? ', ...' : ''}]\n`;
      }
      if (entities.product_names && entities.product_names.length > 0) {
        contextSection += `- Product Names: [${entities.product_names.slice(0, 5).map(n => `"${n}"`).join(', ')}${entities.product_names.length > 5 ? ', ...' : ''}]\n`;
      }
      if (entities.employee_ids && entities.employee_ids.length > 0) {
        contextSection += `- Employee IDs: [${entities.employee_ids.join(', ')}]\n`;
      }
      if (entities.category_names && entities.category_names.length > 0) {
        contextSection += `- Categories: [${entities.category_names.map(n => `"${n}"`).join(', ')}]\n`;
      }
      if (entities.countries && entities.countries.length > 0) {
        contextSection += `- Countries: [${entities.countries.map(n => `"${n}"`).join(', ')}]\n`;
      }
    }

    contextSection += '\n=== END CONTEXT ===\n\n';
  }

  const prompt = `You are a SQL expert for a business intelligence system using PostgreSQL and the Northwind database.

${schemaDescription}
${contextSection}
Current User Question: "${userQuestion}"

INSTRUCTIONS:
1. If the question is about business data (customers, orders, products, sales, revenue, etc.), generate a PostgreSQL query to answer it.
2. If the question is NOT about business data, politely explain that you can only help with business data questions.
3. **IMPORTANT**: If the user uses pronouns (they, them, those, it) or references from previous conversation, use the CONVERSATION CONTEXT above to understand what they refer to and generate appropriate SQL with those specific IDs/values.

For BUSINESS questions, return ONLY valid JSON in this format:
{
  "sql": "SELECT ... FROM ... WHERE ... LIMIT 100",
  "explanation": "Brief explanation of what the data shows",
  "visualization": "table" or "metric"
}

For NON-BUSINESS questions, return JSON:
{
  "explanation": "I can only help with business data questions about customers, orders, products, and sales from the Northwind database.",
  "visualization": "text"
}

RULES for SQL generation:
- Use ONLY the tables listed above
- Always include LIMIT clause (maximum 100 rows)
- Use proper PostgreSQL syntax
- Use meaningful column aliases with underscores (e.g., total_revenue)
- For aggregations/single values, use "visualization": "metric"
- For lists/tables, use "visualization": "table"
- Handle NULL values properly
- Use appropriate JOINs when needed
- For revenue calculations: unit_price * quantity * (1 - discount)
- When user refers to previous results (using "they", "them", "those"), use the entity IDs from CONVERSATION CONTEXT

EXAMPLES of pronoun resolution:
- User asks "Show top 5 customers" → You return customer IDs [1,2,3,4,5]
- User then asks "What products are they buying?" → Use WHERE customer_id IN ('1','2','3','4','5')
- User asks "Show products in Beverages" → You return product IDs
- User then asks "Who buys them?" → Use WHERE product_id IN (those product IDs)

Return ONLY the JSON, no additional text.`;

  return prompt;
}

export default { buildPrompt, getSchemaDescription };
