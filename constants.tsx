
import { User, UserRole } from './types';

export const FACILITIES = [
  "AC", "Kipas Angin", "Kasur Tanpa Ranjang", "Kasur Pakai Ranjang", 
  "Ranjang Tingkat", "Token Listrik", "PDAM", "Air Sumur", 
  "Dapur Bersama", "Dapur Pribadi", "Ruang Tunggu Tamu", 
  "Laundry", "Sarapan Pagi", "CCTV", "Lemari", "Meja Belajar", 
  "TV", "Kamar Mandi Dalam", "Kamar Mandi Luar", "Keamanan", "Parkir"
];

export const PROVINCES = [
  "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta",
  "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur",
  "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah",
  "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung",
  "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat",
  "Papua Pegunungan", "Papua Selatan", "Papua Tengah", "Papua Barat Daya",
  "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah",
  "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat",
  "Sumatera Selatan", "Sumatera Utara"
];

export const INITIAL_ADS = [
  {
    id: '1',
    type: 'image' as const,
    title: 'Diskon Akhir Tahun!',
    content: 'https://picsum.photos/1200/600?random=1',
  },
  {
    id: '2',
    type: 'text' as const,
    title: 'Promo Spesial Mahasiswa',
    content: 'Dapatkan potongan 20% untuk penyewaan tahunan di seluruh kos terverifikasi.',
  }
];

export const BANK_LIST = [
  { bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'PT TRAVEL KOZT INDONESIA' },
  { bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'PT TRAVEL KOZT INDONESIA' },
];

export const INDONESIA_BANKS = [
  "Bank BCA", "Bank Mandiri", "Bank BNI", "Bank BRI", "Bank CIMB Niaga", 
  "Bank Danamon", "Bank Permata", "Bank Panin", "Bank Mega", "Bank BTN",
  "Bank BSI (Syariah)", "Jenius (BTPN)", "Bank Jago", "Seabank", "Bank Muamalat",
  "Bank DKI", "Bank BJB", "Bank Jatim", "Bank Jateng"
];

export const INITIAL_USERS: User[] = [
  { id: 'sa-1', username: 'admcip', password: 'Cip.123', role: UserRole.SUPER_ADMIN, fullName: 'Admin Master Cip', email: 'admin@travelkozt.com', isVerified: true, ktp: '1234567890123456', phone: '08123456789', address: 'Jakarta', ktpPhoto: '', profilePhoto: '' },
  { id: 'u-1', username: 'budi', password: 'user123', role: UserRole.ADMIN_KOS, fullName: 'Budi Santoso', email: 'budi@owner.com', isVerified: true, ktp: '3201234567890123', phone: '08123456788', address: 'Jakarta Selatan', ktpPhoto: 'https://picsum.photos/400/250?random=ktp-budi', profilePhoto: '', bankName: 'BCA', bankAccountNumber: '123456789' },
  { id: 'u-2', username: 'ani', password: 'user123', role: UserRole.USER, fullName: 'Ani Wijaya', email: 'ani@tenant.com', isVerified: true, ktp: '3201234567890124', phone: '08123456787', address: 'Tangerang', ktpPhoto: 'https://picsum.photos/400/250?random=ktp-ani', profilePhoto: '', bankName: 'Mandiri', bankAccountNumber: '987654321' }
];
