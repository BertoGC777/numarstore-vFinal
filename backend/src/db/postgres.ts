import { Pool, PoolClient } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getDatabase() {
  // Test connection
  const client = await pool.connect();
  client.release();
  return pool;
}

export async function dbRun(sql: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    await client.query(sql, params);
  } finally {
    client.release();
  }
}

export async function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows.length ? (result.rows[0] as T) : null;
  } finally {
    client.release();
  }
}

export async function closePool() {
  await pool.end();
}
