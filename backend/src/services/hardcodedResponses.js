/**
 * Hardcoded responses for Iteration 1
 * Maps common business questions to SQL queries
 */

export const hardcodedResponses = {
  "top customers": {
    type: "table",
    query: `
      SELECT
        c.company_name,
        c.contact_name,
        c.city,
        c.country,
        COUNT(o.order_id) as total_orders,
        ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) as total_revenue
      FROM customers c
      JOIN orders o ON c.customer_id = o.customer_id
      JOIN order_details od ON o.order_id = od.order_id
      GROUP BY c.customer_id, c.company_name, c.contact_name, c.city, c.country
      ORDER BY total_revenue DESC
      LIMIT 10
    `,
    explanation: "Here are the top 10 customers by total revenue"
  },

  "total revenue": {
    type: "metric",
    query: `
      SELECT
        ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) as total_revenue,
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT o.customer_id) as total_customers
      FROM orders o
      JOIN order_details od ON o.order_id = od.order_id
    `,
    explanation: "Here's the total revenue across all orders"
  },

  "top products": {
    type: "table",
    query: `
      SELECT
        p.product_name,
        c.category_name,
        p.unit_price,
        SUM(od.quantity) as units_sold,
        ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) as revenue
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      JOIN order_details od ON p.product_id = od.product_id
      GROUP BY p.product_id, p.product_name, c.category_name, p.unit_price
      ORDER BY revenue DESC
      LIMIT 10
    `,
    explanation: "Here are the top 10 products by revenue"
  },

  "revenue by category": {
    type: "table",
    query: `
      SELECT
        c.category_name,
        COUNT(DISTINCT p.product_id) as product_count,
        SUM(od.quantity) as total_units_sold,
        ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) as total_revenue
      FROM categories c
      JOIN products p ON c.category_id = p.category_id
      JOIN order_details od ON p.product_id = od.product_id
      GROUP BY c.category_id, c.category_name
      ORDER BY total_revenue DESC
    `,
    explanation: "Here's the revenue breakdown by product category"
  },

  "orders by country": {
    type: "table",
    query: `
      SELECT
        c.country,
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT c.customer_id) as customer_count,
        ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) as total_revenue
      FROM customers c
      JOIN orders o ON c.customer_id = o.customer_id
      JOIN order_details od ON o.order_id = od.order_id
      GROUP BY c.country
      ORDER BY total_revenue DESC
      LIMIT 15
    `,
    explanation: "Here are orders and revenue by country"
  },

  "employee performance": {
    type: "table",
    query: `
      SELECT
        e.first_name || ' ' || e.last_name as employee_name,
        e.title,
        COUNT(o.order_id) as orders_handled,
        ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) as total_sales
      FROM employees e
      JOIN orders o ON e.employee_id = o.employee_id
      JOIN order_details od ON o.order_id = od.order_id
      GROUP BY e.employee_id, e.first_name, e.last_name, e.title
      ORDER BY total_sales DESC
    `,
    explanation: "Here's the sales performance by employee"
  }
};

/**
 * Find matching hardcoded response for user question
 * @param {string} question - User's question
 * @returns {Object|null} Matching response or null
 */
export function findMatchingResponse(question) {
  const lowerQuestion = question.toLowerCase();

  // Simple keyword matching
  for (const [key, response] of Object.entries(hardcodedResponses)) {
    if (lowerQuestion.includes(key)) {
      return { key, ...response };
    }
  }

  return null;
}

/**
 * Get list of available sample questions
 * @returns {Array<string>} Sample questions
 */
export function getSampleQuestions() {
  return [
    "Show me top customers",
    "What's our total revenue?",
    "Show me top products",
    "Revenue by category",
    "Show orders by country",
    "Employee performance"
  ];
}

export default { hardcodedResponses, findMatchingResponse, getSampleQuestions };
