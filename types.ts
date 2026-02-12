
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_KOS = 'ADMIN_KOS',
  USER = 'USER'
}

export enum KosCategory {
  MALE = 'Pria',
  FEMALE = 'Perempuan',
  MIXED = 'Campur'
}

export enum RoomType {
  STANDARD = 'Standard',
  SUPERIOR = 'Superior',
  VIP = 'VIP'
}

export enum PriceType {
  DAILY = 'Harian',
  WEEKLY = 'Mingguan',
  MONTHLY = 'Bulanan',
  YEARLY = 'Tahunan'
}

export interface Room {
  id: string;
  type: RoomType;
  facilities: string[];
  price: number;
  priceType: PriceType;
  photos: string[];
  stock: number;
}

export interface Kos {
  id: string;
  name: string;
  category: KosCategory;
  lat: number;
  lng: number;
  province: string;
  district: string;
  village: string;
  ownerName: string;
  ownerId: string;
  bankAccount: string;
  ktpNumber: string;
  ktpPhoto: string;
  ownerPhoto: string;
  rooms: Room[];
  description: string;
  address: string;
  isVerified: boolean;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
  ktp: string;
  phone: string;
  email: string;
  address: string;
  ktpPhoto: string;
  profilePhoto: string;
  isVerified: boolean;
  bankName?: string;
  bankAccountNumber?: string;
}

export interface Advertisement {
  id: string;
  type: 'image' | 'video' | 'text';
  content: string;
  title: string;
  description?: string;
  link?: string;
  date?: string; // Added for schedule
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  content: string; // Short snippet
}

export interface ShortVideo {
  id: string;
  title: string;
  videoUrl: string; // URL or Base64
  thumbnail?: string;
  views: string;
  youtubeLink?: string; // Added for sync
}

export interface CompanyInfo {
  name: string;
  about: string;
  address: string;
  phone: string;
  email: string;
  heroImage?: string;
  heroVideo?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroSideImage1?: string;
  heroSideImage2?: string;
  instagram?: string; // New
  facebook?: string; // New
  twitter?: string; // New
}

export interface Booking {
  id: string;
  userId: string;
  kosId: string;
  roomId: string;
  selectedRoomUuid?: string;
  checkIn: string;
  checkOut: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CHECKED_OUT';
  paymentMethod?: string;
  paymentProof?: string;
  basePrice: number;
  taxAmount: number;
  platformFee: number;
  totalPrice: number;
  isCheckedOut?: boolean;
  ownerRevenue?: number; // Calculated field for ease
  adminRevenue?: number; // Calculated field for ease
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisImage?: string; // Support for QRIS
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  image?: string;
  isVoice?: boolean; // New field
  timestamp: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
  referenceId?: string;
  source?: 'CASH_NET' | 'PERSONAL' | 'TAX_CASH'; // New field for budgeting
}
