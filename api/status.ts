
import { pool } from '../lib/db';

export default async function handler(request: any, response: any) {
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT version()');
      return response.status(200).json({ status: 'online', db_version: rows[0].version });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return response.status(500).json({ status: 'error', message: error.message });
  }
}
