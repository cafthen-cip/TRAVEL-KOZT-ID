
import { User, UserRole, Kos, KosCategory, RoomType, PriceType, CompanyInfo, NewsItem, ShortVideo } from './types';

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

export const INITIAL_USERS: User[] = [
  { id: 'sa-1', username: 'admcip', password: 'Cip.123', role: UserRole.SUPER_ADMIN, fullName: 'Admin Master Cip', email: 'admin@travelkozt.com', isVerified: true, ktp: '1234567890123456', phone: '08123456789', address: 'Jakarta', ktpPhoto: '', profilePhoto: '' },
  { id: 'u-1', username: 'budi', password: 'user123', role: UserRole.ADMIN_KOS, fullName: 'Budi Santoso', email: 'budi@owner.com', isVerified: true, ktp: '3201234567890123', phone: '08123456788', address: 'Jakarta Selatan', ktpPhoto: 'https://picsum.photos/400/250?random=ktp-budi', profilePhoto: '', bankName: 'BCA', bankAccountNumber: '123456789' },
  { id: 'u-2', username: 'ani', password: 'user123', role: UserRole.USER, fullName: 'Ani Wijaya', email: 'ani@tenant.com', isVerified: true, ktp: '3201234567890124', phone: '08123456787', address: 'Tangerang', ktpPhoto: 'https://picsum.photos/400/250?random=ktp-ani', profilePhoto: '', bankName: 'Mandiri', bankAccountNumber: '987654321' }
];

export const INITIAL_KOSES: Kos[] = [
  {
    id: 'k-1',
    name: "D'Green Residence Senopati",
    category: KosCategory.FEMALE,
    lat: -6.237,
    lng: 106.812,
    province: 'DKI Jakarta',
    district: 'Jakarta Selatan',
    village: 'Kebayoran Baru',
    ownerName: 'Budi Santoso',
    ownerId: 'u-1',
    bankAccount: '123456789',
    ktpNumber: '320123456',
    ktpPhoto: 'https://picsum.photos/400/250?random=ktp1',
    ownerPhoto: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2070',
    rooms: [
       { id: 'r-1', type: RoomType.VIP, facilities: ['AC', 'Wifi'], price: 2500000, priceType: PriceType.MONTHLY, photos: [], stock: 5 }
    ],
    description: 'Hunian eksklusif di jantung Senopati. Dekat dengan area bisnis SCBD.',
    address: 'Kebayoran Baru, Jakarta Selatan',
    isVerified: true
  },
  {
    id: 'k-2',
    name: "Kost Executive Bandung",
    category: KosCategory.MIXED,
    lat: -6.917,
    lng: 107.619,
    province: 'Jawa Barat',
    district: 'Bandung Wetan',
    village: 'Tamansari',
    ownerName: 'Siti Aminah',
    ownerId: 'u-1',
    bankAccount: '987654321',
    ktpNumber: '320987654',
    ktpPhoto: 'https://picsum.photos/400/250?random=ktp2',
    ownerPhoto: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=2080',
    rooms: [
       { id: 'r-2', type: RoomType.STANDARD, facilities: ['Wifi', 'Kamar Mandi Dalam'], price: 1500000, priceType: PriceType.MONTHLY, photos: [], stock: 3 }
    ],
    description: 'Kos nyaman dengan udara sejuk Bandung, dekat ITB dan UNPAD.',
    address: 'Tamansari, Bandung',
    isVerified: true
  }
];

export const INITIAL_COMPANY: CompanyInfo = {
  name: 'TRAVEL KOZT INDONESIA',
  about: 'Travel Kozt adalah platform marketplace kos-kosan nomor 1 di Indonesia yang menghubungkan pemilik kos dengan pencari kos secara aman, transparan, dan modern. Kami berfokus pada kemudahan verifikasi dan kepastian hunian bagi seluruh masyarakat Indonesia.',
  address: 'Jl. Jenderal Sudirman Kav. 52-53, Jakarta Selatan, 12190',
  phone: '021-555-1234',
  email: 'info@travelkozt.id',
  heroTitle: 'TRAVEL KOZT',
  heroSubtitle: 'Eksplorasi hunian impian dengan sistem pemesanan modern tercepat di Indonesia.',
  heroImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
  heroSideImage1: 'https://images.unsplash.com/photo-1596276122653-65ddf3be52e6?auto=format&fit=crop&q=80&w=600',
  heroSideImage2: 'https://images.unsplash.com/photo-1502005229766-939cb934d60b?auto=format&fit=crop&q=80&w=600',
  instagram: 'travelkozt_id',
  facebook: 'Travel Kozt Indonesia',
  twitter: '@travelkozt'
};

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'n-1',
    title: 'Tren Hunian Co-Living 2025: Lebih Hemat & Seru',
    category: 'Lifestyle',
    date: '24 Feb 2025',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000',
    content: 'Konsep hunian bersama kini semakin diminati kaum milenial karena fasilitas lengkap dan komunitas yang suportif. Selain lebih hemat biaya, co-living menawarkan kesempatan networking yang luas.'
  },
  {
    id: 'n-2',
    title: 'Tips Memilih Kos Aman di Jakarta Selatan',
    category: 'Tips & Trik',
    date: '20 Feb 2025',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000',
    content: 'Jangan sampai salah pilih! Perhatikan 5 hal krusial ini sebelum Anda membayar uang muka kos: Keamanan lingkungan, akses transportasi, fasilitas air, sirkulasi udara, dan reputasi pemilik kos.'
  },
  {
    id: 'n-3',
    title: 'Travel Kozt Raih Penghargaan Startup Properti Terbaik',
    category: 'Press Release',
    date: '15 Feb 2025',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000',
    content: 'Berkomitmen pada keamanan transaksi dan kenyamanan pengguna, Travel Kozt dinobatkan sebagai platform properti terpercaya tahun ini oleh Asosiasi Properti Digital Indonesia.'
  }
];

export const INITIAL_VIDEOS: ShortVideo[] = [
  {
    id: 'v-1',
    title: 'Room Tour VIP Senopati',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-with-a-view-4842-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1502005229766-939cb934d60b?auto=format&fit=crop&q=80&w=600',
    views: '1.2K',
    youtubeLink: ''
  },
  {
    id: 'v-2',
    title: 'Kos Murah Jogja 500rb!',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-living-room-with-a-fireplace-4846-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1596276122653-65ddf3be52e6?auto=format&fit=crop&q=80&w=600',
    views: '8.5K',
    youtubeLink: ''
  },
  {
    id: 'v-3',
    title: 'Review Jujur Kos Campur',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-at-home-4061-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1522771753035-1a5b6564f3a4?auto=format&fit=crop&q=80&w=600',
    views: '3.4K',
    youtubeLink: ''
  }
];
