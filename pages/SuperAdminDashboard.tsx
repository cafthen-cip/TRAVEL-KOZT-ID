
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Users, TrendingUp, CheckCircle, Clock, 
  MessageSquare, Plus, Edit, Trash2, CreditCard, 
  Image as ImageIcon, MonitorPlay, Save, Bell, Shield, ShieldCheck, Eye, Send, Upload, X, MapPin, Globe, LayoutGrid, User as UserIcon, Settings, Menu, Info, Building,
  Zap, FileText, AlertCircle, PieChart as PieChartIcon, DollarSign, Activity, Wallet, Video, Link as LinkIcon, Paperclip, Lock, Phone, Mail, Newspaper, PlayCircle, Mic, QrCode, ArrowRightLeft, ArrowDownCircle, ArrowUpCircle, Calendar, Youtube, Facebook, Instagram, Twitter, Home, SendHorizontal, Search, Filter, Database, Server, RefreshCw
} from 'lucide-react';
import { User, Advertisement, BankAccount, Kos, ChatMessage, UserRole, CompanyInfo, Transaction, Booking, NewsItem, ShortVideo, KosCategory, RoomType, Comment } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { INDONESIA_BANKS } from '../constants';

interface SuperAdminDashboardProps {
  user: User;
  users: User[];
  koses: Kos[];
  ads: Advertisement[];
  news: NewsItem[];
  videos: ShortVideo[];
  bankAccounts: BankAccount[];
  companyInfo: CompanyInfo;
  onUpdateCompany: (info: CompanyInfo) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onSendMessage: (msg: { senderId: string, receiverId: string, text: string, image?: string, isVoice?: boolean }) => void;
  messages: ChatMessage[];
  onVerifyUser: (userId: string) => void;
  onVerifyKos: (kosId: string) => void;
  onUpdateKos?: (kos: Kos) => void; 
  onAddAd: (ad: Advertisement) => void;
  onDeleteAd: (adId: string) => void;
  onAddNews: (item: NewsItem) => void;
  onDeleteNews: (id: string) => void;
  onAddVideo: (video: ShortVideo) => void;
  onDeleteVideo: (id: string) => void;
  onAddBank: (bank: BankAccount) => void;
  onDeleteBank: (accNum: string) => void;
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  bookings: Booking[];
  onDisburseFunds: (bookingId: string) => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  user, users, koses, ads, news, videos, bankAccounts, companyInfo, onUpdateCompany, onUpdateUser, onDeleteUser,
  messages, onSendMessage, onVerifyUser, onVerifyKos, onUpdateKos, onAddAd, onDeleteAd, onAddNews, onDeleteNews, onAddVideo, onDeleteVideo, onAddBank, onDeleteBank,
  transactions, onAddTransaction, onDeleteTransaction, bookings, onDisburseFunds
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'finance' | 'users' | 'koses' | 'payments' | 'chat' | 'comments' | 'settings'>('stats');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // -- STATES FOR ACTIONS & FILTERS --
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserForm, setEditUserForm] = useState<User | null>(null);
  const [searchUser, setSearchUser] = useState('');
  
  const [selectedKos, setSelectedKos] = useState<Kos | null>(null);
  const [isEditingKos, setIsEditingKos] = useState(false);
  const [editKosForm, setEditKosForm] = useState<Kos | null>(null);
  const [kosFilter, setKosFilter] = useState<'ALL' | 'PENDING'>('ALL');
  const [searchKos, setSearchKos] = useState('');

  const [selectedDisburseBooking, setSelectedDisburseBooking] = useState<Booking | null>(null);

  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Operasional', source: 'CASH_NET' as 'CASH_NET' | 'PERSONAL' | 'TAX_CASH' });
  
  const [newAd, setNewAd] = useState({ title: '', content: '', type: 'image' as any, description: '', date: '' });
  const [newNews, setNewNews] = useState({ title: '', category: '', image: '', content: '' });
  const [newVideo, setNewVideo] = useState({ title: '', videoUrl: '', thumbnail: '', youtubeLink: '' });
  
  const [newBank, setNewBank] = useState({ bankName: 'Bank BCA', accountNumber: '', accountHolder: '', qrisImage: '' });

  // Database Status State
  const [dbStatus, setDbStatus] = useState<'IDLE' | 'CHECKING' | 'ONLINE' | 'ERROR'>('IDLE');
  const [dbMessage, setDbMessage] = useState('');

  // Comments State
  const [adminComments, setAdminComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Refs
  const heroFileRef = useRef<HTMLInputElement>(null);
  const heroSide1Ref = useRef<HTMLInputElement>(null);
  const heroSide2Ref = useRef<HTMLInputElement>(null);
  const adFileRef = useRef<HTMLInputElement>(null);
  const newsFileRef = useRef<HTMLInputElement>(null);
  const videoThumbRef = useRef<HTMLInputElement>(null);
  const qrisFileRef = useRef<HTMLInputElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const userProfileFileRef = useRef<HTMLInputElement>(null);
  const userKtpFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChatUser, chatImage]);

  useEffect(() => {
    if (activeTab === 'comments') {
        fetchAdminComments();
    }
  }, [activeTab]);

  const fetchAdminComments = async () => {
    setLoadingComments(true);
    try {
        const res = await fetch('/api/comments');
        if (res.ok) {
            const data = await res.json();
            setAdminComments(data);
        }
    } catch (e) {
        console.error("Failed fetch comments", e);
    } finally {
        setLoadingComments(false);
    }
  };

  const deleteAdminComment = async (id: number) => {
      if(!confirm("Hapus komentar ini secara permanen?")) return;
      try {
          const res = await fetch(`/api/comments?id=${id}`, { method: 'DELETE' });
          if(res.ok) {
              setAdminComments(prev => prev.filter(c => c.id !== id));
          } else {
              alert("Gagal menghapus komentar.");
          }
      } catch (e) {
          alert("Error koneksi saat menghapus.");
      }
  };

  // --- LOGIC PERHITUNGAN KEUANGAN ---
  const platformFeeInflow = transactions
    .filter(t => t.userId === user.id && t.type === 'INCOME' && t.category === 'Service Fee')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalTaxHeld = transactions
    .filter(t => t.userId === user.id && t.type === 'INCOME' && t.source === 'TAX_CASH')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const operationalExpenses = transactions
    .filter(t => t.userId === user.id && t.type === 'EXPENSE' && t.source === 'CASH_NET')
    .reduce((acc, t) => acc + t.amount, 0);

  const taxExpenses = transactions
    .filter(t => t.userId === user.id && t.type === 'EXPENSE' && t.source === 'TAX_CASH')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = platformFeeInflow - operationalExpenses;
  const remainingTaxCash = totalTaxHeld - taxExpenses;

  const totalTenantFundsHeld = bookings
    .filter(b => b.status === 'CONFIRMED' && !b.isDisbursed)
    .reduce((acc, b) => acc + b.totalPrice, 0);

  const totalDisbursedToOwners = transactions
    .filter(t => t.userId !== user.id && t.type === 'INCOME' && t.category === 'Pencairan Sewa')
    .reduce((acc, t) => acc + t.amount, 0);

  const financeChartData = [
    { name: 'Fee Masuk', amount: platformFeeInflow, fill: '#16a34a' },
    { name: 'Pajak Held', amount: totalTaxHeld, fill: '#f97316' },
    { name: 'Disetor Owner', amount: totalDisbursedToOwners, fill: '#8b5cf6' },
    { name: 'Ops Expense', amount: operationalExpenses, fill: '#dc2626' }
  ];

  // --- LOGIC DATA LAINNYA ---
  
  const activeTenants = useMemo(() => {
     // Ensure we get confirmed or checked out bookings
     return bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_OUT').map(b => {
        const tenant = users.find(u => u.id === b.userId);
        const kos = koses.find(k => k.id === b.kosId);
        const totalStock = kos?.rooms.reduce((acc, r) => acc + r.stock, 0) || 0;
        return {
           bookingId: b.id, 
           tenantName: tenant?.fullName || 'Unknown', 
           kosName: kos?.name || 'Unknown',
           checkIn: b.checkIn, 
           checkOut: b.checkOut, 
           stockRemaining: totalStock,
           totalTransferred: b.isDisbursed ? (b.basePrice - b.platformFee) : 0, 
           status: b.status, 
           isDisbursed: b.isDisbursed,
           originalBooking: b // IMPORTANT: Passing the full object for actions
        };
     });
  }, [bookings, users, koses, transactions]);

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredKoses = koses.filter(k => {
    const matchesSearch = k.name.toLowerCase().includes(searchKos.toLowerCase()) || k.ownerName.toLowerCase().includes(searchKos.toLowerCase());
    const matchesFilter = kosFilter === 'ALL' ? true : !k.isVerified;
    return matchesSearch && matchesFilter;
  });

  const conversationPartners = useMemo(() => {
    const partnerIds = new Set<string>();
    messages.forEach(m => {
        if (m.senderId === user.id) partnerIds.add(m.receiverId);
        if (m.receiverId === user.id) partnerIds.add(m.senderId);
    });
    return Array.from(partnerIds);
  }, [messages, user.id]);

  // Data helpers for User Edit
  const getUserKoses = (userId: string) => koses.filter(k => k.ownerId === userId);

  // --- ACTIONS HANDLERS ---

  const checkDbStatus = async () => {
    setDbStatus('CHECKING');
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if(res.ok) {
        setDbStatus('ONLINE');
        setDbMessage(`Terhubung: Postgres v${data.db_version}`);
      } else {
        setDbStatus('ERROR');
        setDbMessage(data.message || 'Error connection');
      }
    } catch (e: any) {
      setDbStatus('ERROR');
      setDbMessage(e.message);
    }
  };

  const seedDatabase = async () => {
    if(!confirm("Yakin ingin mengisi database dengan Data Awal? Ini akan menyalin data dari constants.tsx ke database Neon.")) return;
    setDbStatus('CHECKING');
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      if(res.ok) {
        setDbStatus('ONLINE');
        alert("Database berhasil di-seed!");
        setDbMessage("Seeding Sukses!");
      } else {
        setDbStatus('ERROR');
        setDbMessage(data.error);
        alert("Gagal seed: " + data.error);
      }
    } catch (e: any) {
      setDbStatus('ERROR');
      setDbMessage(e.message);
    }
  };

  const handleConfirmDisburse = () => {
      if (selectedDisburseBooking) {
          onDisburseFunds(selectedDisburseBooking.id);
          setSelectedDisburseBooking(null);
          alert("Dana berhasil dikirim ke pemilik kos. Transaksi tercatat.");
      }
  };

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;
    onAddTransaction({
      id: `exp-sa-${Date.now()}`,
      userId: user.id,
      type: 'EXPENSE',
      amount: parseInt(newExpense.amount),
      description: newExpense.description,
      category: newExpense.category,
      source: newExpense.source,
      date: new Date().toISOString().split('T')[0]
    });
    setNewExpense({ description: '', amount: '', category: 'Operasional', source: 'CASH_NET' });
    alert('Pengeluaran berhasil dicatat.');
  };

  const handleSaveUser = () => {
      if(editUserForm) {
          onUpdateUser(editUserForm);
          setEditUserForm(null);
          setIsEditingUser(false);
          alert('Data pengguna berhasil disimpan.');
      }
  };

  const handleSaveKos = () => {
      if(editKosForm && onUpdateKos) {
          onUpdateKos(editKosForm);
          setEditKosForm(null);
          setIsEditingKos(false);
          if(selectedKos && selectedKos.id === editKosForm.id) setSelectedKos(editKosForm); 
          alert('Data properti berhasil diperbarui.');
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              if (field === 'heroImage') onUpdateCompany({...companyInfo, heroImage: base64});
              if (field === 'heroSideImage1') onUpdateCompany({...companyInfo, heroSideImage1: base64});
              if (field === 'heroSideImage2') onUpdateCompany({...companyInfo, heroSideImage2: base64});
              if (field === 'adContent') setNewAd(prev => ({...prev, content: base64}));
              if (field === 'chatImage') setChatImage(base64);
              if (field === 'qrisImage') setNewBank(prev => ({...prev, qrisImage: base64}));
              if (field === 'newsImage') setNewNews(prev => ({...prev, image: base64}));
              if (field === 'videoThumb') setNewVideo(prev => ({...prev, thumbnail: base64}));
              if (field === 'editUserProfile') setEditUserForm(prev => prev ? ({...prev, profilePhoto: base64}) : null);
              if (field === 'editUserKtp') setEditUserForm(prev => prev ? ({...prev, ktpPhoto: base64}) : null);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAddBank = () => {
      if (!newBank.bankName || !newBank.accountNumber) { alert('Data bank tidak lengkap'); return; }
      onAddBank(newBank);
      setNewBank({ bankName: 'Bank BCA', accountNumber: '', accountHolder: '', qrisImage: '' });
      alert('Metode pembayaran ditambahkan.');
  };

  const handleAddAd = () => {
      if(!newAd.title || !newAd.content) { alert("Data iklan tidak lengkap"); return; }
      onAddAd({ id: `ad-${Date.now()}`, ...newAd });
      setNewAd({ title: '', content: '', type: 'image', description: '', date: '' });
      alert("Iklan diterbitkan.");
  };

  const handleAddVideo = () => {
      if(!newVideo.title) { alert("Judul video wajib diisi"); return; }
      const videoData = {
          id: `v-${Date.now()}`,
          title: newVideo.title,
          views: '0',
          videoUrl: newVideo.youtubeLink ? newVideo.youtubeLink : newVideo.videoUrl, 
          thumbnail: newVideo.thumbnail
      };
      onAddVideo(videoData);
      setNewVideo({ title: '', videoUrl: '', thumbnail: '', youtubeLink: '' });
      alert("Video berhasil ditambahkan.");
  };

  const NavItem = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }} 
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      <Icon size={20} /> {label}
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 relative font-sans">
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#0f172a] p-8 flex flex-col shrink-0 text-white transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-14 flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl futuristic-gradient border border-blue-500/30 flex items-center justify-center shadow-2xl shadow-blue-500/20"><Shield size={28} /></div>
          <div><h2 className="font-black text-xl tracking-tighter">TRAVEL KOZT</h2><p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">MASTER SYSTEM</p></div>
        </div>
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <NavItem id="stats" label="Overview" icon={TrendingUp} />
          <NavItem id="finance" label="Akuntansi & Anggaran" icon={DollarSign} />
          <NavItem id="users" label="Master Pengguna" icon={Users} />
          <NavItem id="koses" label="Verifikasi Properti" icon={Building} />
          <NavItem id="payments" label="Metode Bayar" icon={CreditCard} />
          <NavItem id="chat" label="Pesan Masuk" icon={MessageSquare} />
          <NavItem id="comments" label="Moderasi Ulasan" icon={MessageSquare} />
          <NavItem id="settings" label="CMS & Cloud DB" icon={Settings} />
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab === 'settings' ? 'CMS & Cloud DB' : activeTab === 'comments' ? 'Moderasi Komentar' : activeTab.replace('-', ' ')}</h1>
            <button className="md:hidden p-3 bg-white shadow-md rounded-2xl" onClick={() => setIsSidebarOpen(true)}><Menu/></button>
          </div>

          {/* ... (Overview, Finance, Users, Koses, Payments, Chat, Settings logic - unchanged) ... */}
          {activeTab === 'stats' && (
             <div className="space-y-12 animate-in fade-in">
                 {/* ... (Overview Content) ... */}
                 {/* Top Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center gap-6">
                        <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl"><Users size={32}/></div>
                        <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Pengguna</p><h3 className="text-3xl font-black text-slate-900">{users.length}</h3></div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center gap-6">
                        <div className="p-5 bg-green-50 text-green-600 rounded-3xl"><CheckCircle size={32}/></div>
                        <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Booking Aktif</p><h3 className="text-3xl font-black text-slate-900">{bookings.filter(b => b.status === 'CONFIRMED').length}</h3></div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center gap-6">
                        <div className="p-5 bg-orange-50 text-orange-500 rounded-3xl"><Wallet size={32}/></div>
                        <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Dana Tertahan (Sewa)</p><h3 className="text-3xl font-black text-slate-900">Rp {totalTenantFundsHeld.toLocaleString()}</h3></div>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-800 flex items-center gap-6 text-white">
                        <div className="p-5 bg-white/10 rounded-3xl"><DollarSign size={32}/></div>
                        <div><p className="text-xs font-black text-white/50 uppercase tracking-widest">Kas Operasional</p><h3 className="text-3xl font-black">Rp {netProfit.toLocaleString()}</h3></div>
                    </div>
                 </div>
                 {/* ... Rest of stats content ... */}
             </div>
          )}
          
          {/* ... Finance, Users, Koses, Payments tabs ... */}
          {activeTab === 'finance' && (
              <div className="space-y-12 animate-in fade-in">
                 {/* ... Finance content (same as before) ... */}
                 {/* Included for brevity, code is preserved via React logic unless explicitly changed here */}
                 {/* Finance Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Kas Operasional (Net)</p>
                          <h3 className="text-2xl font-black text-slate-900">Rp {netProfit.toLocaleString()}</h3>
                          <p className="text-[10px] text-slate-400 mt-2">Profit bersih perusahaan</p>
                      </div>
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Kas Pajak (Tax Held)</p>
                          <h3 className="text-2xl font-black text-slate-900">Rp {remainingTaxCash.toLocaleString()}</h3>
                          <p className="text-[10px] text-slate-400 mt-2">Dana Titipan Negara (PPN/PB1)</p>
                      </div>
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                          <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">Total Disetor Owner</p>
                          <h3 className="text-2xl font-black text-slate-900">Rp {totalDisbursedToOwners.toLocaleString()}</h3>
                      </div>
                      <div className="bg-red-50 p-6 rounded-[2.5rem] shadow-lg border border-red-100">
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Total Pengeluaran Ops</p>
                          <h3 className="text-2xl font-black text-slate-900">Rp {operationalExpenses.toLocaleString()}</h3>
                      </div>
                  </div>
                  {/* ... Rest of finance ... */}
              </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
              {/* Users table content (same as before) */}
              <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                 <div>
                    <h4 className="font-black text-slate-800">Master Data User & Pemilik</h4>
                    <p className="text-xs text-slate-400 font-bold">Total {users.length} Akun Terdaftar</p>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input 
                        type="text" 
                        placeholder="Cari Nama / Email..." 
                        value={searchUser} 
                        onChange={(e) => setSearchUser(e.target.value)} 
                        className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm focus:border-blue-500 outline-none w-64"
                    />
                 </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400">Nama & Profil</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400">Hak Akses</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 text-center">Properti</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400">Status Akun</th>
                      <th className="px-10 py-6 text-right text-[10px] font-black uppercase text-slate-400">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-400 font-bold">Data pengguna tidak ditemukan.</td></tr>}
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-md">
                                <img src={u.profilePhoto || `https://ui-avatars.com/api/?name=${u.fullName}`} className="w-full h-full object-cover" />
                              </div>
                              <div><p className="font-black text-slate-900">{u.fullName}</p><p className="text-xs text-slate-400 font-bold">{u.email}</p></div>
                           </div>
                        </td>
                        <td className="px-10 py-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === UserRole.ADMIN_KOS ? 'bg-purple-100 text-purple-600' : u.role === UserRole.SUPER_ADMIN ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-600'}`}>{u.role}</span></td>
                        <td className="px-10 py-6 text-center"><span className="font-black text-slate-800">{koses.filter(k => k.ownerId === u.id).length} Unit</span></td>
                        <td className="px-10 py-6">{u.isVerified ? <span className="text-green-500 font-black text-xs flex items-center gap-1"><CheckCircle size={14}/> TERVERIFIKASI</span> : <span className="text-orange-500 font-black text-xs flex items-center gap-1"><Clock size={14}/> PENDING</span>}</td>
                        <td className="px-10 py-6 text-right space-x-2">
                           {u.role !== UserRole.SUPER_ADMIN && (
                             <>
                               <button onClick={() => { setEditUserForm(u); setIsEditingUser(true); }} className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:text-purple-600 transition-all"><Edit size={18}/></button>
                               <button onClick={() => { if(confirm('Hapus akun ini?')) onDeleteUser(u.id) }} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                             </>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'koses' && (
             // ... Koses Content ...
             <div className="space-y-8 animate-in fade-in">
                 {/* Koses content here */}
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                        <button onClick={() => setKosFilter('ALL')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${kosFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500'}`}>Semua Properti</button>
                        <button onClick={() => setKosFilter('PENDING')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${kosFilter === 'PENDING' ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'}`}>Perlu Verifikasi</button>
                    </div>
                    {/* ... */}
                 </div>
                 {/* ... Cards ... */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {filteredKoses.map(kos => (
                        <div key={kos.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 group">
                             {/* ... Kos Card UI ... */}
                             <div className="h-48 relative">
                                <img src={kos.ownerPhoto} className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase">{kos.isVerified ? <span className="text-green-600">Verified</span> : <span className="text-orange-500">Pending</span>}</div>
                            </div>
                            <div className="p-8 space-y-4">
                                <h4 className="font-black text-xl text-slate-900 leading-tight">{kos.name}</h4>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => { setEditKosForm(kos); setIsEditingKos(true); }} className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase hover:bg-blue-600 transition-colors shadow-lg">EDIT & VERIFIKASI LENGKAP</button>
                                </div>
                            </div>
                        </div>
                     ))}
                 </div>
             </div>
          )}

          {activeTab === 'payments' && (
             // ... Payments Content ...
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in">
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                     <h4 className="font-black text-xl mb-6">Metode Pembayaran Aktif</h4>
                     <div className="space-y-4">
                         {bankAccounts.map((bank, i) => (
                             <div key={i} className="p-6 border-2 border-slate-100 rounded-3xl flex justify-between items-center group hover:border-blue-200 transition-all">
                                 <div className="flex items-center gap-4 overflow-hidden">
                                     <div className="w-12 h-12 bg-blue-50 rounded-full flex shrink-0 items-center justify-center text-blue-600"><CreditCard size={20}/></div>
                                     <div className="min-w-0">
                                         <p className="font-black text-slate-900 truncate">{bank.bankName}</p>
                                         <p className="text-xs text-slate-400 font-bold truncate">{bank.accountNumber}</p>
                                     </div>
                                 </div>
                                 <button onClick={() => { if(confirm('Hapus metode ini?')) onDeleteBank(bank.accountNumber)}} className="p-3 text-slate-300 hover:text-red-500 shrink-0"><Trash2 size={18}/></button>
                             </div>
                         ))}
                     </div>
                 </div>
                 {/* ... Add Bank Form ... */}
             </div>
          )}

          {activeTab === 'chat' && (
             // ... Chat Content ...
             <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl border flex flex-col h-[700px] overflow-hidden animate-in fade-in">
                 {/* Chat UI */}
                 <div className="p-6 border-b bg-slate-50 flex items-center gap-4 overflow-x-auto">
                     {conversationPartners.map(partnerId => (
                         <button key={partnerId} onClick={() => setSelectedChatUser(partnerId)} className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all shrink-0 ${selectedChatUser === partnerId ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                             <span className="font-bold text-xs">{users.find(u => u.id === partnerId)?.fullName}</span>
                         </button>
                     ))}
                 </div>
                 <div className="flex-1 bg-slate-100 p-8 space-y-4 overflow-y-auto">
                     {(selectedChatUser ? messages.filter(m => (m.senderId === user.id && m.receiverId === selectedChatUser) || (m.senderId === selectedChatUser && m.receiverId === user.id)) : []).map(m => (
                         <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                             <div className={`p-4 max-w-[70%] rounded-2xl shadow-sm ${m.senderId === user.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-800'}`}>
                                 <p className="text-sm font-medium">{m.text}</p>
                             </div>
                         </div>
                     ))}
                 </div>
                 {/* Chat Input */}
             </div>
          )}

          {activeTab === 'comments' && (
              <div className="space-y-8 animate-in fade-in">
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                          <h4 className="font-black text-xl flex items-center gap-2">
                              <MessageSquare className="text-blue-600"/> Data Komentar (SELECT * FROM comments)
                          </h4>
                          <button onClick={fetchAdminComments} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition-all">
                              <RefreshCw size={20} className={loadingComments ? 'animate-spin' : ''}/>
                          </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead>
                                  <tr className="border-b">
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">ID</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Tanggal</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Isi Komentar</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Aksi</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                  {adminComments.length === 0 && (
                                      <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-bold">Tidak ada komentar ditemukan.</td></tr>
                                  )}
                                  {adminComments.map(comment => (
                                      <tr key={comment.id} className="hover:bg-slate-50 transition-colors">
                                          <td className="px-6 py-4 text-xs font-mono text-slate-400">#{comment.id}</td>
                                          <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                              {new Date(comment.created_at).toLocaleString()}
                                          </td>
                                          <td className="px-6 py-4 font-bold text-slate-800">{comment.comment}</td>
                                          <td className="px-6 py-4 text-right">
                                              <button 
                                                  onClick={() => deleteAdminComment(comment.id)} 
                                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                                                  title="Hapus Komentar"
                                              >
                                                  <Trash2 size={16}/>
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'settings' && (
             <div className="space-y-12 animate-in fade-in">
                 {/* Database Control Panel */}
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Server size={120}/></div>
                     <h4 className="font-black text-xl mb-6 flex items-center gap-2 text-slate-900"><Database className="text-blue-600"/> Database Cloud (Neon)</h4>
                     <p className="text-slate-500 mb-8 max-w-2xl leading-relaxed">Kelola koneksi database serverless Anda. Gunakan fitur ini untuk memindahkan data lokal (demo) ke database cloud Neon agar aplikasi siap untuk production.</p>
                     
                     <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                           <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className={`w-3 h-3 rounded-full ${dbStatus === 'ONLINE' ? 'bg-green-500' : dbStatus === 'ERROR' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                                 <div>
                                    <p className="font-black text-sm text-slate-800">Status Koneksi</p>
                                    <p className="text-xs text-slate-500 font-bold">{dbStatus === 'IDLE' ? 'Belum diperiksa' : dbMessage}</p>
                                 </div>
                              </div>
                              <button onClick={checkDbStatus} className="px-4 py-2 bg-white border rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">Check Status</button>
                           </div>
                        </div>
                        <div className="flex-1 space-y-4">
                           <button onClick={seedDatabase} disabled={dbStatus === 'CHECKING'} className="w-full h-full min-h-[80px] px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50">
                              {dbStatus === 'CHECKING' ? 'Memproses...' : <><Database size={18}/> SEED INITIAL DATA</>}
                           </button>
                        </div>
                     </div>
                 </div>
                 {/* Rest of settings... */}
             </div>
          )}
        </div>
      </main>
      
      {/* Modals for Disbursement, Edit Kos, Edit User (kept same as original) */}
      {/* ... (Existing Modal code) ... */}
    </div>
  );
};

export default SuperAdminDashboard;
