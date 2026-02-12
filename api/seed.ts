
import { pool } from '../lib/db';
import { INITIAL_USERS, INITIAL_KOSES, INITIAL_ADS, INITIAL_NEWS } from '../constants';

export default async function handler(request: any, response: any) {
  const client = await pool.connect();
  
  try {
    // 1. Seed Users
    for (const user of INITIAL_USERS) {
      await client.query(`
        INSERT INTO users (id, username, password, role, full_name, email, phone, address, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.username, user.password, user.role, user.fullName, user.email, user.phone, user.address, user.isVerified]);
    }

    // 2. Seed Koses
    for (const kos of INITIAL_KOSES) {
       // Insert Kos
       await client.query(`
        INSERT INTO koses (id, owner_id, name, category, description, address, province, district, village, lat, lng, owner_name, bank_account, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO NOTHING
       `, [kos.id, kos.ownerId, kos.name, kos.category, kos.description, kos.address, kos.province, kos.district, kos.village, kos.lat, kos.lng, kos.ownerName, kos.bankAccount, kos.isVerified]);

       // Insert Rooms
       if (kos.rooms) {
           for (const room of kos.rooms) {
              await client.query(`
                INSERT INTO rooms (id, kos_id, type, price, price_type, stock, facilities, photos)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO NOTHING
              `, [room.id, kos.id, room.type, room.price, room.priceType, room.stock, room.facilities, room.photos]);
           }
       }
    }

    // 3. Seed Ads
    for (const ad of INITIAL_ADS) {
        await client.query(`
            INSERT INTO advertisements (id, type, title, content)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO NOTHING
        `, [ad.id, ad.type, ad.title, ad.content]);
    }
    
    // 4. Seed News
    for (const news of INITIAL_NEWS) {
        await client.query(`
            INSERT INTO news (id, title, category, date_display, image, content)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO NOTHING
        `, [news.id, news.title, news.category, news.date, news.image, news.content]);
    }

    return response.status(200).json({ message: 'Database seeded successfully with Initial Data!' });
  } catch (error: any) {
    console.error('Seeding Error:', error);
    return response.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}
