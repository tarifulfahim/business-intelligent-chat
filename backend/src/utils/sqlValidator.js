/**
 * SQL Validator for security and safety
 */

// Allowed SQL keywords for SELECT queries
const ALLOWED_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
  'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'ROUND',
  'CAST', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COALESCE',
  'UPPER', 'LOWER', 'SUBSTRING', 'CONCAT', 'LENGTH',
  'EXTRACT', 'DATE', 'YEAR', 'MONTH', 'DAY', 'NOW', 'CURRENT_DATE'
];

// Dangerous keywords that should be blocked
const DANGEROUS_KEYWORDS = [
  'DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE',
  'EXEC', 'EXECUTE', 'GRANT', 'REVOKE', 'COMMIT', 'ROLLBACK',
  'SAVEPOINT', 'TRANSACTION', 'VACUUM', 'ANALYZE',
  '--', '/*', '*/', ';--', 'xp_', 'sp_'
];

// Allowed Northwind tables
const ALLOWED_TABLES = [
  'customers', 'orders', 'order_details', 'products', 'employees',
  'categories', 'suppliers', 'shippers', 'territories', 'region',
  'employee_territories', 'customer_demographics', 'customer_customer_demo',
  'us_states'
];

/**
 * Validate SQL query for security
 * @param {string} sql - SQL query to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateSQL(sql) {
  if (!sql || typeof sql !== 'string') {
    return { isValid: false, error: 'SQL query is required' };
  }

  const upperSQL = sql.toUpperCase();

  // Check for dangerous keywords
  for (const keyword of DANGEROUS_KEYWORDS) {
    if (upperSQL.includes(keyword.toUpperCase())) {
      return {
        isValid: false,
        error: `Dangerous keyword detected: ${keyword}`
      };
    }
  }

  // Must start with SELECT
  if (!upperSQL.trim().startsWith('SELECT')) {
    return {
      isValid: false,
      error: 'Query must start with SELECT'
    };
  }

  // Check for multiple statements (prevent SQL injection)
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  if (statements.length > 1) {
    return {
      isValid: false,
      error: 'Multiple SQL statements are not allowed'
    };
  }

  // Should have LIMIT clause (optional but recommended)
  if (!upperSQL.includes('LIMIT')) {
    console.warn('SQL query does not have LIMIT clause, adding default LIMIT 100');
  }

  return { isValid: true, error: null };
}

/**
 * Add LIMIT clause if not present
 * @param {string} sql - SQL query
 * @param {number} limit - Maximum rows (default 100)
 * @returns {string} SQL with LIMIT clause
 */
export function ensureLimit(sql, limit = 100) {
  const upperSQL = sql.toUpperCase();

  if (!upperSQL.includes('LIMIT')) {
    // Add LIMIT at the end
    return `${sql.trim()} LIMIT ${limit}`;
  }

  return sql;
}

/**
 * Extract table names from SQL query
 * @param {string} sql - SQL query
 * @returns {Array<string>} Table names found
 */
export function extractTableNames(sql) {
  const tables = [];
  const upperSQL = sql.toUpperCase();

  // Simple regex to find table names after FROM and JOIN
  const fromMatch = upperSQL.match(/FROM\s+(\w+)/g);
  const joinMatch = upperSQL.match(/JOIN\s+(\w+)/g);

  if (fromMatch) {
    fromMatch.forEach(match => {
      const tableName = match.replace(/FROM\s+/i, '').toLowerCase();
      tables.push(tableName);
    });
  }

  if (joinMatch) {
    joinMatch.forEach(match => {
      const tableName = match.replace(/JOIN\s+/i, '').toLowerCase();
      tables.push(tableName);
    });
  }

  return [...new Set(tables)]; // Remove duplicates
}

/**
 * Validate table names against allowed list
 * @param {string} sql - SQL query
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateTableNames(sql) {
  const tables = extractTableNames(sql);

  for (const table of tables) {
    if (!ALLOWED_TABLES.includes(table)) {
      return {
        isValid: false,
        error: `Table '${table}' is not allowed. Use only Northwind tables.`
      };
    }
  }

  return { isValid: true, error: null };
}

/**
 * Complete validation - runs all checks
 * @param {string} sql - SQL query to validate
 * @returns {Object} { isValid: boolean, error: string|null, sql: string }
 */
export function completeValidation(sql) {
  // Basic SQL validation
  const basicValidation = validateSQL(sql);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // Table name validation
  const tableValidation = validateTableNames(sql);
  if (!tableValidation.isValid) {
    return tableValidation;
  }

  // Ensure LIMIT clause
  const safeSql = ensureLimit(sql);

  return {
    isValid: true,
    error: null,
    sql: safeSql
  };
}

export default {
  validateSQL,
  validateTableNames,
  ensureLimit,
  completeValidation,
  extractTableNames
};
