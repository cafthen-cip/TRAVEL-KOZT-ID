
-- Enable UUID extension untuk generate ID unik
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL USERS (Pengguna & Admin)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN_KOS', 'USER')),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  ktp_number VARCHAR(20),
  ktp_photo TEXT,     -- Base64 or URL
  profile_photo TEXT, -- Base64 or URL
  is_verified BOOLEAN DEFAULT FALSE,
  bank_name VARCHAR(50),
  bank_account_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL KOSES (Data Properti)
CREATE TABLE IF NOT EXISTS koses (
  id VARCHAR(50) PRIMARY KEY,
  owner_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('Pria', 'Perempuan', 'Campur')),
  description TEXT,
  address TEXT NOT NULL,
  province VARCHAR(50),
  district VARCHAR(50),
  village VARCHAR(50),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  owner_name VARCHAR(100),
  ktp_number VARCHAR(20),
  ktp_photo TEXT,
  owner_photo TEXT,
  bank_account VARCHAR(50),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL ROOMS (Kamar)
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(50) PRIMARY KEY,
  kos_id VARCHAR(50) REFERENCES koses(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'Standard', 'Superior', 'VIP'
  price NUMERIC(15, 2) NOT NULL,
  price_type VARCHAR(20) DEFAULT 'Bulanan',
  stock INTEGER DEFAULT 0,
  facilities TEXT[], -- Array of strings: ['AC', 'Wifi']
  photos TEXT[],     -- Array of strings (URLs)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL BOOKINGS (Transaksi Sewa)
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  kos_id VARCHAR(50) REFERENCES koses(id),
  room_id VARCHAR(50), -- ID referensi ke tipe kamar
  room_type_name VARCHAR(50), -- Nama tipe kamar (snapshot)
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'CHECKED_OUT')),
  payment_method VARCHAR(50),
  payment_proof TEXT,
  base_price NUMERIC(15, 2),
  tax_amount NUMERIC(15, 2),
  platform_fee NUMERIC(15, 2),
  total_price NUMERIC(15, 2),
  is_checked_out BOOLEAN DEFAULT FALSE,
  is_disbursed BOOLEAN DEFAULT FALSE, -- Status pencairan dana ke owner
  checkout_reason VARCHAR(50),
  refund_amount NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL TRANSACTIONS (Buku Besar Keuangan)
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  amount NUMERIC(15, 2) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  source VARCHAR(20) DEFAULT 'CASH_NET', -- 'CASH_NET', 'PERSONAL', 'TAX_CASH'
  transaction_date DATE,
  reference_id VARCHAR(50), -- Bisa referensi ke booking_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(50) PRIMARY KEY,
  sender_id VARCHAR(50) REFERENCES users(id),
  receiver_id VARCHAR(50) REFERENCES users(id),
  text TEXT,
  image TEXT,
  is_voice BOOLEAN DEFAULT FALSE,
  sent_at BIGINT NOT NULL
);

-- 7. TABEL ADS (Iklan)
CREATE TABLE IF NOT EXISTS advertisements (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(10) NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  link TEXT,
  schedule_date VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABEL NEWS
CREATE TABLE IF NOT EXISTS news (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  date_display VARCHAR(50),
  image TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABEL COMMENTS (Fitur Baru)
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXING untuk performa
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_kos_id ON bookings(kos_id);
CREATE INDEX idx_rooms_kos_id ON rooms(kos_id);
CREATE INDEX idx_koses_owner_id ON koses(owner_id);
CREATE INDEX idx_messages_sender_receiver ON chat_messages(sender_id, receiver_id);
