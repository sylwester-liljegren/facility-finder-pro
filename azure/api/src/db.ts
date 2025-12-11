import { Pool } from 'pg';

// Log connection config for debugging
console.log('Creating database pool with config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  ssl: process.env.DB_SSL,
  password: process.env.DB_PASSWORD ? '***SET***' : '***NOT SET***'
});

// Create connection pool with increased timeouts
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased from 2000 to 10000ms
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Database pool connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Test connection immediately
pool.query('SELECT NOW()')
  .then(res => console.log('Database connection test successful:', res.rows[0]))
  .catch(err => console.error('Database connection test FAILED:', err.message));

export { pool };

// Helper function for queries
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Query executed in ${duration}ms, rows: ${result.rowCount}`);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper for single row queries
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}
