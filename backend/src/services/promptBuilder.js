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
 * @returns {Promise<string>} Complete prompt
 */
export async function buildPrompt(userQuestion) {
  const schemaDescription = await getSchemaDescription();

  const prompt = `You are a SQL expert for a business intelligence system using PostgreSQL and the Northwind database.

${schemaDescription}

User Question: "${userQuestion}"

INSTRUCTIONS:
1. If the question is about business data (customers, orders, products, sales, revenue, etc.), generate a PostgreSQL query to answer it.
2. If the question is NOT about business data, politely explain that you can only help with business data questions.

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

Return ONLY the JSON, no additional text.`;

  return prompt;
}

export default { buildPrompt, getSchemaDescription };
