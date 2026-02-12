
import { pool } from '../lib/db';

export default async function handler(request: any, response: any) {
  // Simple CORS and Method handling
  
  if (request.method === 'POST') {
    try {
      const { comment } = request.body;
      
      if (!comment) {
        return response.status(400).json({ error: 'Comment is required' });
      }

      const client = await pool.connect();
      try {
        await client.query('INSERT INTO comments (comment) VALUES ($1)', [comment]);
        return response.status(201).json({ message: 'Comment added' });
      } finally {
        client.release();
      }
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  } else if (request.method === 'GET') {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM comments ORDER BY created_at DESC');
      return response.status(200).json(rows);
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  } else if (request.method === 'DELETE') {
    try {
      const { id } = request.query;
      if (!id) {
        return response.status(400).json({ error: 'Comment ID is required' });
      }

      const client = await pool.connect();
      try {
        await client.query('DELETE FROM comments WHERE id = $1', [id]);
        return response.status(200).json({ message: 'Comment deleted successfully' });
      } finally {
        client.release();
      }
    } catch (error: any) {
      return response.status(500).json({ error: error.message });
    }
  } else {
    return response.status(405).json({ error: 'Method not allowed' });
  }
}
