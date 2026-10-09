import mysql from 'mysql2/promise';

let pool = null;

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 8,
      waitForConnections: true,
      enableKeepAlive: true,
      timezone: 'Z',
      dateStrings: false,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

const RETRYABLE = new Set(['ER_LOCK_DEADLOCK', 'ER_LOCK_WAIT_TIMEOUT']);
const RETRYABLE_ERRNO = new Set([1213, 1205, 9007, 8022, 8028]);

// Runs fn inside one transaction. Row locks (SELECT … FOR UPDATE) taken inside fn are
// held until commit. Write conflicts and deadlocks are retried a few times.
export async function withTransaction(fn, { retries = 3 } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    const conn = await getPool().getConnection();
    try {
      await conn.beginTransaction();
      const result = await fn(conn);
      await conn.commit();
      return result;
    } catch (error) {
      try { await conn.rollback(); } catch { /* connection may already be closed */ }
      const retryable = RETRYABLE.has(error?.code) || RETRYABLE_ERRNO.has(error?.errno);
      if (!retryable || attempt >= retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 40 * (attempt + 1)));
    } finally {
      conn.release();
    }
  }
}

export function json(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value;
}

export async function closePool() {
  if (pool) { await pool.end(); pool = null; }
}
