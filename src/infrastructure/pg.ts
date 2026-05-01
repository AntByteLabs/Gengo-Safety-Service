import { Pool } from 'pg';
import { config } from '../config.js';

// One pool shared across the process lifetime; pg handles connection reuse
export const pool = new Pool({
  host: config.PG_HOST,
  port: config.PG_PORT,
  user: config.PG_USER,
  password: config.PG_PASSWORD,
  database: config.PG_DATABASE,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  // Surface pool-level errors without crashing — individual queries surface
  // their own errors through the normal Promise rejection path
  console.error('[pg] idle client error', err.message);
});

/** Verifies the pool can reach the database. Called at startup. */
export async function checkDbConnection(): Promise<void> {
  const client = await pool.connect();
  client.release();
}

export async function closePool(): Promise<void> {
  await pool.end();
}
