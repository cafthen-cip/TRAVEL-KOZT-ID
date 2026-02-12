
import { Pool } from '@neondatabase/serverless';

// Pastikan Environment Variable DATABASE_URL sudah diatur di Vercel
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({ 
  connectionString,
  ssl: true,
  max: 1, // Penting untuk serverless: membatasi koneksi aktif
  idleTimeoutMillis: 3000, 
  connectionTimeoutMillis: 5000,
});

// Helper wrapper untuk query
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
