
import { Pool } from '@neondatabase/serverless';

// Konfigurasi koneksi database Neon
// PENTING: Gunakan library ini hanya di dalam Vercel Serverless Functions (folder /api), 
// jangan diimpor langsung ke komponen React (client-side) karena alasan keamanan.

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({ 
  connectionString,
  ssl: true,
  max: 20, // Set maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper wrapper untuk query yang lebih bersih
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
