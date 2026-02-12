
import { Pool } from '@neondatabase/serverless';

// Konfigurasi koneksi database Neon
// Gunakan process.env.DATABASE_URL yang diset di Environment Variables Vercel

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({ 
  connectionString,
  ssl: true,
  max: 1, // Penting: Kurangi max connection untuk serverless agar tidak cepat limit
  idleTimeoutMillis: 3000, // Timeout lebih cepat
  connectionTimeoutMillis: 5000,
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
    // Penting: Release client kembali ke pool secepat mungkin
    client.release();
  }
};

export default pool;
