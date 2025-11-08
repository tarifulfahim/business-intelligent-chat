import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;
dotenv.config();


console.log('DB_USER:', process.env.DB_USER);

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'northwind',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 55432,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a SQL query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export async function query(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get database schema information
 * @returns {Promise<Object>} Schema information
 */
export async function getSchema() {
  const sql = `
    SELECT
      table_name,
      column_name,
      data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `;

  const columns = await query(sql);

  // Group by table
  const schema = {};
  columns.forEach(col => {
    if (!schema[col.table_name]) {
      schema[col.table_name] = [];
    }
    schema[col.table_name].push({
      name: col.column_name,
      type: col.data_type
    });
  });

  return schema;
}

export default { query, getSchema };
