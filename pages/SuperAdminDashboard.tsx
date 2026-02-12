
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Users, TrendingUp, CheckCircle, Clock, 
  MessageSquare, Plus, Edit, Trash2, CreditCard, 
  Image as ImageIcon, MonitorPlay, Save, Bell, Shield, ShieldCheck, Eye, Send, Upload, X, MapPin, Globe, LayoutGrid, User as UserIcon, Settings, Menu, Info, Building,
  Zap, FileText, AlertCircle, PieChart as PieChartIcon, DollarSign, Activity, Wallet, Video, Link as LinkIcon, Paperclip, Lock, Phone, Mail, Newspaper, PlayCircle, Mic, QrCode, ArrowRightLeft, ArrowDownCircle, ArrowUpCircle, Calendar, Youtube, Facebook, Instagram, Twitter, Home
} from 'lucide-react';
import { User, Advertisement, BankAccount, Kos, ChatMessage, UserRole, CompanyInfo, Transaction, Booking, NewsItem, ShortVideo, KosCategory, RoomType } from '../types';
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
  bookings: Booking[];
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  user, users, koses, ads, news, videos, bankAccounts, companyInfo, onUpdateCompany, onUpdateUser, onDeleteUser,
  messages, onSendMessage, onVerifyUser, onVerifyKos, onUpdateKos, onAddAd, onDeleteAd, onAddNews, onDeleteNews, onAddVideo, onDeleteVideo, onAddBank, onDeleteBank,
  transactions, onAddTransaction, bookings
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'finance' | 'users' | 'koses' | 'payments' | 'chat' | 'settings'>('stats');
  const [cmsTab, setCmsTab] = useState<'ads' | 'news' | 'videos'>('ads');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // -- STATES FOR ACTIONS --
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserForm, setEditUserForm] = useState<User | null>(null);
  
  // Property Verification & Edit
  const [selectedKos, setSelectedKos] = useState<Kos | null>(null);
  const [isEditingKos, setIsEditingKos] = useState(false);
  const [editKosForm, setEditKosForm] = useState<Kos | null>(null);

  // Chat
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  // Finance
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Operasional', source: 'CASH_NET' as 'CASH_NET' | 'PERSONAL' | 'TAX_CASH' });
  
  // CMS / Global Settings
  const [newAd, setNewAd] = useState({ title: '', content: '', type: 'image' as any, description: '', date: '' });
  const [newNews, setNewNews] = useState({ title: '', category: '', image: '', content: '' });
  const [newVideo, setNewVideo] = useState({ title: '', videoUrl: '', thumbnail: '', youtubeLink: '' });
  
  // Payments
  const [newBank, setNewBank] = useState({ bankName: 'Bank BCA', accountNumber: '', accountHolder: '', qrisImage: '' });

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

  // Auto scroll chat
  useEffect(() => {
    if (chatBottomRef.current) chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChatUser, chatImage]);

  // --- CALCULATION LOGIC ---
  const platformInflow = transactions.filter(t => t.userId === user.id && t.type === 'INCOME' && t.category === 'Service Fee').reduce((acc, t) => acc + t.amount, 0);
  const totalTaxCollected = bookings.filter(b => b.status === 'CONFIRMED').reduce((acc, b) => acc + b.taxAmount, 0);
  const totalDisbursedToOwners = transactions.filter(t => t.userId !== user.id && t.type === 'INCOME' && t.category === 'Pencairan Sewa').reduce((acc, t) => acc + t.amount, 0);
  const adminExpenses = transactions.filter(t => t.userId === user.id && t.type === 'EXPENSE');
  const totalExpense = adminExpenses.reduce((acc, t) => acc + t.amount, 0);
  const taxExpenses = adminExpenses.filter(t => t.source === 'TAX_CASH').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = platformInflow - adminExpenses.filter(t => t.source === 'CASH_NET').reduce((acc, t) => acc + t.amount, 0);
  const remainingTaxCash = totalTaxCollected - taxExpenses;

  const financeChartData = [
    { name: 'Masuk (Fee)', amount: platformInflow, fill: '#16a34a' },
    { name: 'Disetor Owner', amount: totalDisbursedToOwners, fill: '#8b5cf6' },
    { name: 'Keluar (Ops)', amount: totalExpense, fill: '#dc2626' },
    { name: 'Laba Bersih', amount: netProfit, fill: '#2563eb' }
  ];

  const activeTenants = useMemo(() => {
     return bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_OUT').map(b => {
        const tenant = users.find(u => u.id === b.userId);
        const kos = koses.find(k => k.id === b.kosId);
        const totalStock = kos?.rooms.reduce((acc, r) => acc + r.stock, 0) || 0;
        const isDisbursed = transactions.some(t => t.referenceId === b.id && t.category === 'Pencairan Sewa');
        return {
           bookingId: b.id, tenantName: tenant?.fullName || 'Unknown', kosName: kos?.name || 'Unknown',
           checkIn: b.checkIn, checkOut: b.checkOut, stockRemaining: totalStock,
           totalTransferred: isDisbursed ? (b.basePrice - b.platformFee) : 0, status: b.status, isDisbursed
        };
     });
  }, [bookings, users, koses, transactions]);

  // Data helpers for User Edit
  const getUserKoses = (userId: string) => koses.filter(k => k.ownerId === userId);
  const getUserBooking = (userId: string) => bookings.find(b => b.userId === userId && b.status === 'CONFIRMED' && !b.isCheckedOut);

  // --- ACTIONS HANDLERS ---

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
          alert('Data pengguna berhasil disimpan secara lengkap.');
      }
  };

  const handleSaveKos = () => {
      if(editKosForm && onUpdateKos) {
          onUpdateKos(editKosForm);
          setEditKosForm(null);
          setIsEditingKos(false);
          if(selectedKos && selectedKos.id === editKosForm.id) setSelectedKos(editKosForm); 
          alert('Data properti dan pemilik berhasil disimpan.');
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
      alert("Iklan berhasil ditambahkan ke halaman utama.");
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
          <NavItem id="settings" label="Pengaturan Global" icon={Settings} />
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab === 'settings' ? 'CMS & Pengaturan' : activeTab.replace('-', ' ')}</h1>
            <button className="md:hidden p-3 bg-white shadow-md rounded-2xl" onClick={() => setIsSidebarOpen(true)}><Menu/></button>
          </div>

          {/* ... (Existing Tabs: Stats, Finance, Users, Koses, Payments, Chat - No Changes Needed except Users tab uses modal) ... */}
          {activeTab === 'stats' && (
             <div className="space-y-12 animate-in fade-in">
                 {/* Top Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center gap-6">
                        <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl"><Users size={32}/></div>
                        <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Pengguna</p><h3 className="text-4xl font-black text-slate-900">{users.length}</h3></div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center gap-6">
                        <div className="p-5 bg-green-50 text-green-600 rounded-3xl"><CheckCircle size={32}/></div>
                        <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Booking Aktif</p><h3 className="text-4xl font-black text-slate-900">{bookings.filter(b => b.status === 'CONFIRMED').length}</h3></div>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-800 flex items-center gap-6 text-white">
                        <div className="p-5 bg-white/10 rounded-3xl"><DollarSign size={32}/></div>
                        <div><p className="text-xs font-black text-white/50 uppercase tracking-widest">Total Pendapatan</p><h3 className="text-4xl font-black">Rp {(platformInflow).toLocaleString()}</h3></div>
                    </div>
                 </div>

                 {/* Graphic Area Chart */}
                 <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 h-[400px]">
                    <h4 className="font-black text-xl mb-6">Grafik Okupansi & Booking</h4>
                    <ResponsiveContainer width="100%" height="85%">
                        <AreaChart data={activeTenants.slice(0, 7)}> 
                            <defs>
                                <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="kosName" hide />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                            <Tooltip contentStyle={{borderRadius:'1rem', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                            <Area type="monotone" dataKey="totalTransferred" stroke="#2563eb" fillOpacity={1} fill="url(#colorRent)" />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>

                 {/* Tenant Table */}
                 <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b bg-slate-50/50"><h4 className="font-black text-xl">Daftar Penyewa Aktif & Setoran</h4></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Penyewa</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Nama Kos</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Jadwal Cekin/Out</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Sisa Stok Kos</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Setoran Owner</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {activeTenants.map(t => (
                                    <tr key={t.bookingId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-900">{t.tenantName}</td>
                                        <td className="px-8 py-5 text-sm text-slate-600">{t.kosName}</td>
                                        <td className="px-8 py-5 text-xs font-mono text-slate-500">{t.checkIn} <br/> s/d {t.checkOut}</td>
                                        <td className="px-8 py-5 text-center font-black text-slate-900">{t.stockRemaining}</td>
                                        <td className="px-8 py-5 text-right">
                                            {t.isDisbursed ? (
                                                <span className="text-green-600 font-black text-xs">Rp {t.totalTransferred.toLocaleString()} (Paid)</span>
                                            ) : (
                                                <span className="text-orange-400 font-bold text-xs">Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
             </div>
          )}

          {/* ... (Finance Tab omitted for brevity, logic same as before) ... */}
          {activeTab === 'finance' && (
              <div className="space-y-12 animate-in fade-in">
                  {/* Finance Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Total Kas Masuk (Fee)</p>
                          <h3 className="text-2xl font-black text-slate-900">Rp {platformInflow.toLocaleString()}</h3>
                      </div>
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Total Pengeluaran</p>
                          <h3 className="text-2xl font-black text-slate-900">Rp {totalExpense.toLocaleString()}</h3>
                      </div>
                      <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100">
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Laba Bersih</p>
                          <h3 className="text-2xl font-black text-slate-900">Rp {netProfit.toLocaleString()}</h3>
                      </div>
                      <div className="bg-purple-600 p-6 rounded-[2.5rem] shadow-lg border border-purple-500 text-white">
                          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Disetor ke Owner</p>
                          <h3 className="text-2xl font-black">Rp {totalDisbursedToOwners.toLocaleString()}</h3>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      {/* Chart */}
                      <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 h-[450px]">
                          <h4 className="font-black text-xl mb-6">Arus Kas & Distribusi</h4>
                          <ResponsiveContainer width="100%" height="85%">
                              <BarChart data={financeChartData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                                  <Tooltip cursor={{fill:'transparent'}} contentStyle={{borderRadius:'1rem'}} />
                                  <Bar dataKey="amount" radius={[10,10,10,10]} barSize={50} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                      
                      {/* Input Expense */}
                      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                          <h4 className="font-black text-xl mb-6">Input Pengeluaran</h4>
                          <div className="space-y-4">
                              <input placeholder="Keterangan..." value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
                              <input type="number" placeholder="Nominal (Rp)" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
                              
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sumber Dana</label>
                                  <select value={newExpense.source} onChange={e => setNewExpense({...newExpense, source: e.target.value as any})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold">
                                      <option value="CASH_NET">Kas Bersih (Profit)</option>
                                      <option value="PERSONAL">Dana Pribadi</option>
                                      <option value="TAX_CASH">Kas Pajak</option>
                                  </select>
                              </div>
                              
                              {newExpense.source === 'TAX_CASH' && (
                                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-600 text-xs font-bold">
                                      Saldo Kas Pajak: Rp {remainingTaxCash.toLocaleString()}
                                  </div>
                              )}

                              <button onClick={handleAddExpense} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl mt-2 shadow-xl hover:bg-red-600 transition-all">CATAT PENGELUARAN</button>
                          </div>
                      </div>
                  </div>

                  {/* Transaction Table */}
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                      <h4 className="font-black text-xl mb-6">Buku Besar Anggaran</h4>
                      <div className="overflow-x-auto max-h-[400px]">
                          <table className="w-full text-left">
                              <thead className="sticky top-0 bg-white">
                                  <tr>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Tanggal</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Keterangan</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Kategori</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Sumber Dana</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Nominal</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                  {transactions.slice().reverse().map(t => (
                                      <tr key={t.id}>
                                          <td className="px-6 py-4 text-xs font-bold text-slate-500">{t.date}</td>
                                          <td className="px-6 py-4 font-bold text-slate-800">{t.description}</td>
                                          <td className="px-6 py-4 text-xs font-bold text-slate-500 bg-slate-50 rounded-lg inline-block mt-2">{t.category}</td>
                                          <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                              {t.source === 'CASH_NET' ? 'Profit' : t.source === 'TAX_CASH' ? 'Kas Pajak' : t.source === 'PERSONAL' ? 'Pribadi' : '-'}
                                          </td>
                                          <td className={`px-6 py-4 text-right font-black ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                                              {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString()}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}

          {/* --- TAB: USERS --- */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
              <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                 <h4 className="font-black text-slate-800">Master Data User & Pemilik</h4>
                 <div className="bg-blue-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{users.length} AKUN TERDAFTAR</div>
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
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-md">
                                <img src={u.profilePhoto || `https://ui-avatars.com/api/?name=${u.fullName}`} className="w-full h-full object-cover" />
                              </div>
                              <div><p className="font-black text-slate-900">{u.fullName}</p><p className="text-xs text-slate-400 font-bold">{u.email}</p></div>
                           </div>
                        </td>
                        <td className="px-10 py-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === UserRole.ADMIN_KOS ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{u.role}</span></td>
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

          {/* ... (Koses, Payments, Chat Tabs same as before) ... */}
          {/* --- TAB: KOSES (VERIFICATION) --- */}
          {activeTab === 'koses' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in">
                 {koses.map(kos => {
                    const totalRooms = kos.rooms.reduce((a,b) => a + b.stock, 0);
                    const occupied = bookings.filter(b => b.kosId === kos.id && b.status === 'CONFIRMED' && !b.isCheckedOut).length;
                    const ready = totalRooms - occupied;

                    return (
                        <div key={kos.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 group">
                            <div className="h-48 relative">
                                <img src={kos.ownerPhoto} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase">{kos.isVerified ? <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Verified</span> : <span className="text-orange-500">Pending</span>}</div>
                            </div>
                            <div className="p-8 space-y-4">
                                <h4 className="font-black text-xl text-slate-900 leading-tight">{kos.name}</h4>
                                <p className="text-xs text-slate-500 font-bold flex items-center gap-1"><MapPin size={12}/> {kos.district}, {kos.province}</p>
                                
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-green-50 p-3 rounded-xl text-center">
                                        <p className="text-[10px] font-black text-green-600 uppercase">Ready</p>
                                        <p className="font-black text-lg text-slate-800">{ready}</p>
                                    </div>
                                    <div className="flex-1 bg-slate-50 p-3 rounded-xl text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Terisi</p>
                                        <p className="font-black text-lg text-slate-800">{occupied}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => { setEditKosForm(kos); setIsEditingKos(true); }} className="w-full py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase hover:bg-blue-600 transition-colors shadow-lg">EDIT & VERIFIKASI LENGKAP</button>
                                </div>
                            </div>
                        </div>
                    );
                 })}
             </div>
          )}

          {/* --- TAB: PAYMENTS --- */}
          {activeTab === 'payments' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in">
                 {/* ... (Existing payment content) ... */}
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                     <h4 className="font-black text-xl mb-6">Metode Pembayaran Aktif</h4>
                     <div className="space-y-4">
                         {bankAccounts.map((bank, i) => (
                             <div key={i} className="p-6 border-2 border-slate-100 rounded-3xl flex justify-between items-center group hover:border-blue-200 transition-all">
                                 <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><CreditCard size={20}/></div>
                                     <div>
                                         <p className="font-black text-slate-900">{bank.bankName}</p>
                                         <p className="text-xs text-slate-400 font-bold">{bank.accountNumber}</p>
                                     </div>
                                 </div>
                                 <button onClick={() => { if(confirm('Hapus metode ini?')) onDeleteBank(bank.accountNumber)}} className="p-3 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                             </div>
                         ))}
                     </div>
                 </div>
                 
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                     <h4 className="font-black text-xl mb-6">Tambah Rekening / QRIS</h4>
                     <div className="space-y-4">
                         <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Bank / E-Wallet</label>
                             <select value={newBank.bankName} onChange={e => setNewBank({...newBank, bankName: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold">
                                 {INDONESIA_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                             </select>
                         </div>
                         <input placeholder="Nomor Rekening" value={newBank.accountNumber} onChange={e => setNewBank({...newBank, accountNumber: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
                         <input placeholder="Atas Nama" value={newBank.accountHolder} onChange={e => setNewBank({...newBank, accountHolder: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
                         
                         <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:bg-slate-50 cursor-pointer" onClick={() => qrisFileRef.current?.click()}>
                             {newBank.qrisImage ? <p className="text-green-600 font-black text-xs">QRIS Terupload!</p> : <div className="text-slate-400"><QrCode className="mx-auto mb-2"/><p className="text-[10px] font-black uppercase">Upload QRIS (Opsional)</p></div>}
                             <input type="file" ref={qrisFileRef} hidden onChange={e => handleFileUpload(e, 'qrisImage')} />
                         </div>

                         <button onClick={handleAddBank} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700">TAMBAH METODE</button>
                     </div>
                 </div>
             </div>
          )}

          {/* --- TAB: CHAT --- */}
          {activeTab === 'chat' && (
             <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl border flex flex-col h-[700px] overflow-hidden animate-in fade-in">
                 {/* ... (Existing Chat UI) ... */}
                 <div className="p-6 border-b bg-slate-50 flex items-center gap-4 overflow-x-auto">
                     {Array.from(new Set(messages.filter(m => m.receiverId === user.id).map(m => m.senderId))).map(senderId => {
                         const sender = users.find(u => u.id === senderId);
                         return (
                             <button key={senderId} onClick={() => setSelectedChatUser(senderId)} className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all shrink-0 ${selectedChatUser === senderId ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                                 <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden"><img src={sender?.profilePhoto || `https://ui-avatars.com/api/?name=${sender?.fullName}`} className="w-full h-full object-cover"/></div>
                                 <span className="font-bold text-xs">{sender?.fullName}</span>
                             </button>
                         );
                     })}
                 </div>
                 
                 <div className="flex-1 bg-slate-100 p-8 space-y-4 overflow-y-auto">
                     {!selectedChatUser && <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Pilih pesan untuk memulai</div>}
                     {(selectedChatUser ? messages.filter(m => (m.senderId === user.id && m.receiverId === selectedChatUser) || (m.senderId === selectedChatUser && m.receiverId === user.id)) : []).map(m => (
                         <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                             <div className={`p-4 max-w-[70%] rounded-2xl shadow-sm ${m.senderId === user.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>
                                 {m.image && <img src={m.image} className="rounded-lg mb-2 w-full" />}
                                 {m.isVoice ? (
                                     <div className="flex items-center gap-2 font-bold"><PlayCircle/> Voice Message</div>
                                 ) : (
                                     <p className="text-sm font-medium">{m.text}</p>
                                 )}
                                 <p className="text-[10px] opacity-60 mt-1 text-right">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                             </div>
                         </div>
                     ))}
                     <div ref={chatBottomRef} />
                 </div>

                 <div className="p-6 bg-white border-t">
                     {chatImage && <div className="mb-2 relative w-20 h-20 rounded-lg overflow-hidden border"><img src={chatImage} className="w-full h-full object-cover"/><button onClick={() => setChatImage(null)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10}/></button></div>}
                     <form className="flex gap-4 items-center" onSubmit={(e) => { e.preventDefault(); if(chatInput || chatImage) { onSendMessage({ senderId: user.id, receiverId: selectedChatUser!, text: chatInput, image: chatImage || undefined }); setChatInput(''); setChatImage(null); } }}>
                         <button type="button" onClick={() => chatFileRef.current?.click()} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"><Paperclip size={20}/></button>
                         <input type="file" ref={chatFileRef} hidden accept="image/*" onChange={e => handleFileUpload(e, 'chatImage')} />
                         
                         <input className="flex-1 bg-slate-50 border-none outline-none p-4 rounded-2xl font-bold text-slate-700" placeholder="Ketik pesan..." value={chatInput} onChange={e => setChatInput(e.target.value)} disabled={!selectedChatUser} />
                         
                         <button type="button" onClick={() => { setIsRecording(!isRecording); if(!isRecording) setTimeout(() => { onSendMessage({senderId:user.id, receiverId:selectedChatUser!, text:'', isVoice: true}); setIsRecording(false); }, 2000); }} className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-red-500'}`}><Mic size={20}/></button>
                         
                         <button type="submit" disabled={!selectedChatUser} className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"><Send size={20}/></button>
                     </form>
                 </div>
             </div>
          )}

          {/* --- TAB: GLOBAL SETTINGS (Modern CMS) --- */}
          {activeTab === 'settings' && (
             <div className="space-y-12 animate-in fade-in">
                 {/* Hero & Company Info */}
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                     <h4 className="font-black text-xl mb-6">Konten Halaman Utama (Landing Page)</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-4">
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Judul Hero</label><input value={companyInfo.heroTitle || ''} onChange={e => onUpdateCompany({...companyInfo, heroTitle: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sub-Judul</label><textarea value={companyInfo.heroSubtitle || ''} onChange={e => onUpdateCompany({...companyInfo, heroSubtitle: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold h-24" /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Perusahaan</label><input value={companyInfo.name} onChange={e => onUpdateCompany({...companyInfo, name: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                         </div>
                         <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Gambar Hero Background</label>
                             <div onClick={() => heroFileRef.current?.click()} className="h-60 border-4 border-dashed border-slate-200 rounded-[2rem] overflow-hidden relative cursor-pointer hover:bg-slate-50 group">
                                 {companyInfo.heroImage ? <img src={companyInfo.heroImage} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-300"><ImageIcon size={40}/></div>}
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold">GANTI GAMBAR</div>
                                 <input type="file" ref={heroFileRef} hidden onChange={e => handleFileUpload(e, 'heroImage')} />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Gambar Promo Samping 1</label>
                                    <div onClick={() => heroSide1Ref.current?.click()} className="h-32 border-4 border-dashed border-slate-200 rounded-[1.5rem] overflow-hidden relative cursor-pointer hover:bg-slate-50 group mt-2">
                                        {companyInfo.heroSideImage1 ? <img src={companyInfo.heroSideImage1} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-300"><ImageIcon size={24}/></div>}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs">GANTI</div>
                                        <input type="file" ref={heroSide1Ref} hidden onChange={e => handleFileUpload(e, 'heroSideImage1')} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Gambar Promo Samping 2</label>
                                    <div onClick={() => heroSide2Ref.current?.click()} className="h-32 border-4 border-dashed border-slate-200 rounded-[1.5rem] overflow-hidden relative cursor-pointer hover:bg-slate-50 group mt-2">
                                        {companyInfo.heroSideImage2 ? <img src={companyInfo.heroSideImage2} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-300"><ImageIcon size={24}/></div>}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs">GANTI</div>
                                        <input type="file" ref={heroSide2Ref} hidden onChange={e => handleFileUpload(e, 'heroSideImage2')} />
                                    </div>
                                </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Social Media & Footer Settings */}
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                     <h4 className="font-black text-xl mb-6">Identitas & Sosial Media</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-4">
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Alamat Kantor</label><input value={companyInfo.address} onChange={e => onUpdateCompany({...companyInfo, address: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Resmi</label><input value={companyInfo.email} onChange={e => onUpdateCompany({...companyInfo, email: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">No. Telepon / CS</label><input value={companyInfo.phone} onChange={e => onUpdateCompany({...companyInfo, phone: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                         </div>
                         <div className="space-y-4">
                             <div className="space-y-2 relative">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><Instagram size={12}/> Instagram</label>
                                <input value={companyInfo.instagram || ''} onChange={e => onUpdateCompany({...companyInfo, instagram: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="@travelkozt" />
                             </div>
                             <div className="space-y-2 relative">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><Facebook size={12}/> Facebook</label>
                                <input value={companyInfo.facebook || ''} onChange={e => onUpdateCompany({...companyInfo, facebook: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Travel Kozt Indonesia" />
                             </div>
                             <div className="space-y-2 relative">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><Twitter size={12}/> Twitter / X</label>
                                <input value={companyInfo.twitter || ''} onChange={e => onUpdateCompany({...companyInfo, twitter: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="@travelkozt" />
                             </div>
                         </div>
                     </div>
                     <div className="mt-8">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Deskripsi Footer (Tentang Kami)</label>
                        <textarea value={companyInfo.about} onChange={e => onUpdateCompany({...companyInfo, about: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold h-24 mt-2" placeholder="Deskripsi singkat perusahaan di footer..." />
                     </div>
                 </div>

                 {/* Modern CMS Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {/* Ads Card */}
                     <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-[2.5rem] shadow-xl border border-blue-100 space-y-6">
                         <div className="flex items-center gap-3 text-blue-600 mb-2"><MonitorPlay size={28}/><h4 className="font-black text-xl text-slate-900">Kelola Iklan</h4></div>
                         <div className="space-y-3">
                             <input value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} placeholder="Judul Iklan Promo" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm shadow-sm" />
                             <textarea value={newAd.description} onChange={e => setNewAd({...newAd, description: e.target.value})} placeholder="Tentang Iklan..." className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm shadow-sm h-20" />
                             <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl"><Calendar size={16} className="ml-2 text-slate-400"/><input type="date" value={newAd.date} onChange={e => setNewAd({...newAd, date: e.target.value})} className="w-full text-xs font-bold outline-none" /></div>
                             <div className="flex gap-2">
                                <button onClick={() => adFileRef.current?.click()} className="flex-1 py-3 bg-blue-100 text-blue-600 rounded-xl font-black text-[10px] uppercase hover:bg-blue-200">Upload Media</button>
                                <input type="file" ref={adFileRef} hidden onChange={e => handleFileUpload(e, 'adContent')} />
                             </div>
                             <button onClick={handleAddAd} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-blue-700">Terbitkan Iklan</button>
                         </div>
                         <div className="pt-4 border-t border-blue-100 space-y-2 h-40 overflow-y-auto custom-scrollbar">
                             {ads.map(ad => (<div key={ad.id} className="flex justify-between items-center text-xs font-bold text-slate-600 bg-white p-2 rounded-lg border border-slate-100"><span>{ad.title}</span><button onClick={() => onDeleteAd(ad.id)} className="text-red-400"><Trash2 size={12}/></button></div>))}
                         </div>
                     </div>

                     {/* News Card */}
                     <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-[2.5rem] shadow-xl border border-green-100 space-y-6">
                         <div className="flex items-center gap-3 text-green-600 mb-2"><Newspaper size={28}/><h4 className="font-black text-xl text-slate-900">Berita & Artikel</h4></div>
                         <div className="space-y-3">
                             <input value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} placeholder="Judul Berita" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm shadow-sm" />
                             <textarea value={newNews.content} onChange={e => setNewNews({...newNews, content: e.target.value})} placeholder="Isi Berita Singkat..." className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm shadow-sm h-28" />
                             <div className="flex gap-2">
                                <button onClick={() => newsFileRef.current?.click()} className="flex-1 py-3 bg-green-100 text-green-600 rounded-xl font-black text-[10px] uppercase hover:bg-green-200">Upload Foto</button>
                                <input type="file" ref={newsFileRef} hidden onChange={e => handleFileUpload(e, 'newsImage')} />
                             </div>
                             <button onClick={() => { onAddNews({...newNews, id:`n-${Date.now()}`, date: new Date().toLocaleDateString()}); setNewNews({title:'',category:'',image:'',content:''}) }} className="w-full py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-green-700">Posting Berita</button>
                         </div>
                         <div className="pt-4 border-t border-green-100 space-y-2 h-40 overflow-y-auto custom-scrollbar">
                             {news.map(n => (<div key={n.id} className="flex justify-between items-center text-xs font-bold text-slate-600 bg-white p-2 rounded-lg border border-slate-100"><span>{n.title}</span><button onClick={() => onDeleteNews(n.id)} className="text-red-400"><Trash2 size={12}/></button></div>))}
                         </div>
                     </div>

                     {/* Video Card */}
                     <div className="bg-gradient-to-br from-red-50 to-white p-8 rounded-[2.5rem] shadow-xl border border-red-100 space-y-6">
                         <div className="flex items-center gap-3 text-red-600 mb-2"><PlayCircle size={28}/><h4 className="font-black text-xl text-slate-900">Video Shorts</h4></div>
                         <div className="space-y-3">
                             <input value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} placeholder="Judul Video" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm shadow-sm" />
                             <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl"><Youtube size={16} className="ml-2 text-red-500"/><input type="text" value={newVideo.youtubeLink} onChange={e => setNewVideo({...newVideo, youtubeLink: e.target.value})} placeholder="Link Youtube Short..." className="w-full text-xs font-bold outline-none" /></div>
                             <p className="text-[10px] text-center font-bold text-slate-400 uppercase">- ATAU UPLOAD FILE -</p>
                             <div className="flex gap-2">
                                <button onClick={() => videoThumbRef.current?.click()} className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-black text-[10px] uppercase hover:bg-red-200">Upload Video/Thumb</button>
                                <input type="file" ref={videoThumbRef} hidden onChange={e => handleFileUpload(e, 'videoThumb')} />
                             </div>
                             <button onClick={handleAddVideo} className="w-full py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-red-700">Sync & Upload</button>
                         </div>
                         <div className="pt-4 border-t border-red-100 space-y-2 h-40 overflow-y-auto custom-scrollbar">
                             {videos.map(v => (<div key={v.id} className="flex justify-between items-center text-xs font-bold text-slate-600 bg-white p-2 rounded-lg border border-slate-100"><span>{v.title}</span><button onClick={() => onDeleteVideo(v.id)} className="text-red-400"><Trash2 size={12}/></button></div>))}
                         </div>
                     </div>
                 </div>
             </div>
          )}
        </div>
      </main>
      
      {/* ... (Existing Modals: Property) ... */}
      {isEditingKos && editKosForm && (
          <div className="fixed inset-0 z-[120] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 md:p-12 overflow-y-auto">
             {/* ... (Unchanged content for Kos Modal) ... */}
             <div className="bg-white rounded-[3rem] p-10 max-w-5xl w-full space-y-8 shadow-2xl animate-in zoom-in my-auto">
                <div className="flex justify-between items-center border-b pb-6">
                   <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3"><Building className="text-blue-600"/> Edit Data Properti Lengkap</h3>
                   <button onClick={() => setIsEditingKos(false)}><X size={28} className="text-slate-400 hover:text-red-500"/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Owner Data Section */}
                    <div className="md:col-span-1 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-6">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-md">
                                <img src={editKosForm.ownerPhoto || `https://ui-avatars.com/api/?name=${editKosForm.ownerName}`} className="w-full h-full object-cover"/>
                            </div>
                            <h4 className="font-black text-lg text-slate-800">{editKosForm.ownerName}</h4>
                            <p className="text-xs font-bold text-slate-400">Pemilik Properti</p>
                        </div>
                        <div className="space-y-3">
                            <div><label className="text-[10px] font-black uppercase text-slate-400">No. Rekening</label><input value={editKosForm.bankAccount} onChange={e => setEditKosForm({...editKosForm, bankAccount: e.target.value})} className="w-full p-3 bg-white border rounded-xl font-bold text-sm" /></div>
                            <div><label className="text-[10px] font-black uppercase text-slate-400">NIK KTP</label><input value={editKosForm.ktpNumber} onChange={e => setEditKosForm({...editKosForm, ktpNumber: e.target.value})} className="w-full p-3 bg-white border rounded-xl font-bold text-sm" /></div>
                            <div className="h-32 bg-white rounded-xl border overflow-hidden relative group">
                                <img src={editKosForm.ktpPhoto || 'https://via.placeholder.com/300x200?text=KTP'} className="w-full h-full object-cover"/>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs uppercase">Foto KTP</div>
                            </div>
                        </div>
                    </div>

                    {/* Property Data Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Nama Kos</label><input value={editKosForm.name} onChange={e => setEditKosForm({...editKosForm, name: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Kategori</label><select value={editKosForm.category} onChange={e => setEditKosForm({...editKosForm, category: e.target.value as KosCategory})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"><option value={KosCategory.MALE}>Pria</option><option value={KosCategory.FEMALE}>Perempuan</option><option value={KosCategory.MIXED}>Campur</option></select></div>
                        </div>
                        <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Alamat Lengkap</label><textarea value={editKosForm.address} onChange={e => setEditKosForm({...editKosForm, address: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold h-24" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Latitude (Maps)</label><input value={editKosForm.lat} onChange={e => setEditKosForm({...editKosForm, lat: parseFloat(e.target.value) || 0})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Longitude (Maps)</label><input value={editKosForm.lng} onChange={e => setEditKosForm({...editKosForm, lng: parseFloat(e.target.value) || 0})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex justify-between items-center">
                            <div><p className="font-black text-green-700">Status Verifikasi</p><p className="text-xs text-green-600">Apakah data properti ini valid?</p></div>
                            <button onClick={() => setEditKosForm({...editKosForm, isVerified: !editKosForm.isVerified})} className={`px-6 py-2 rounded-full font-black text-xs uppercase ${editKosForm.isVerified ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{editKosForm.isVerified ? 'Verified' : 'Unverified'}</button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                    <button onClick={() => setIsEditingKos(false)} className="flex-1 py-4 border rounded-2xl font-bold text-slate-500 hover:bg-slate-50">Batal</button>
                    <button onClick={handleSaveKos} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700">Simpan Perubahan Lengkap</button>
                </div>
             </div>
          </div>
      )}

      {isEditingUser && editUserForm && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 md:p-12 overflow-y-auto">
            <div className="bg-white rounded-[3rem] p-10 max-w-5xl w-full space-y-8 shadow-2xl animate-in zoom-in my-auto">
                <div className="flex justify-between items-center border-b pb-6">
                   <h3 className="text-3xl font-black text-slate-900">Edit Data Pengguna Lengkap</h3>
                   <button onClick={() => setIsEditingUser(false)}><X size={28} className="text-slate-400 hover:text-red-500"/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-1 space-y-6">
                        <div className="text-center space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Foto Profil</label>
                            <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto overflow-hidden border-4 border-white shadow-lg relative group cursor-pointer" onClick={() => userProfileFileRef.current?.click()}>
                                <img src={editUserForm.profilePhoto || `https://ui-avatars.com/api/?name=${editUserForm.fullName}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Upload size={20}/></div>
                            </div>
                            <input type="file" ref={userProfileFileRef} hidden onChange={e => handleFileUpload(e, 'editUserProfile')} />
                        </div>
                        <div className="text-center space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Foto KTP</label>
                            <div className="h-40 bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 relative group cursor-pointer" onClick={() => userKtpFileRef.current?.click()}>
                                {editUserForm.ktpPhoto ? <img src={editUserForm.ktpPhoto} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-slate-300"><ImageIcon size={32}/></div>}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Upload size={20}/></div>
                            </div>
                            <input type="file" ref={userKtpFileRef} hidden onChange={e => handleFileUpload(e, 'editUserKtp')} />
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        {/* Credentials */}
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
                            <h4 className="font-black text-slate-800 flex items-center gap-2"><Lock size={16}/> Akun Login</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-black uppercase text-slate-400">Username</label><input value={editUserForm.username} onChange={e => setEditUserForm({...editUserForm, username: e.target.value})} className="w-full p-3 bg-white border rounded-xl font-bold" /></div>
                                <div><label className="text-[10px] font-black uppercase text-slate-400">Password</label><input type="text" value={editUserForm.password || ''} onChange={e => setEditUserForm({...editUserForm, password: e.target.value})} className="w-full p-3 bg-white border rounded-xl font-bold" placeholder="Ubah Password" /></div>
                            </div>
                        </div>

                        {/* Personal Data */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2"><label className="text-xs font-bold uppercase text-slate-400">Nama Lengkap</label><input value={editUserForm.fullName} onChange={e => setEditUserForm({...editUserForm, fullName: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Email</label><input value={editUserForm.email} onChange={e => setEditUserForm({...editUserForm, email: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">No. HP / WA</label><input value={editUserForm.phone} onChange={e => setEditUserForm({...editUserForm, phone: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                            {editUserForm.role === UserRole.USER && (
                                <div className="space-y-2 col-span-2"><label className="text-xs font-bold uppercase text-slate-400">Alamat Lengkap</label><textarea value={editUserForm.address} onChange={e => setEditUserForm({...editUserForm, address: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold h-20" /></div>
                            )}
                        </div>

                        {/* Role Based Specific Data */}
                        {editUserForm.role === UserRole.ADMIN_KOS && (
                            <div className="p-6 bg-purple-50 border border-purple-100 rounded-[2rem] space-y-4">
                                <h4 className="font-black text-purple-800 flex items-center gap-2"><Building size={16}/> Data Properti (Owner)</h4>
                                {getUserKoses(editUserForm.id).length > 0 ? getUserKoses(editUserForm.id).map(k => (
                                    <div key={k.id} className="bg-white p-4 rounded-xl shadow-sm space-y-2">
                                        <p className="font-black text-sm">{k.name}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {k.rooms.map(r => (
                                                <span key={r.id} className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full">{r.type}: {r.stock} Kamar</span>
                                            ))}
                                        </div>
                                    </div>
                                )) : <p className="text-xs text-slate-400 italic">Belum ada properti terdaftar.</p>}
                            </div>
                        )}

                        {editUserForm.role === UserRole.USER && (
                            <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] space-y-4">
                                <h4 className="font-black text-blue-800 flex items-center gap-2"><Home size={16}/> Status Penyewaan Kamar</h4>
                                {getUserBooking(editUserForm.id) ? (
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">SEDANG MENYEWA</span>
                                            <p className="text-xs font-bold text-slate-400">#BOOK-{getUserBooking(editUserForm.id)?.id}</p>
                                        </div>
                                        <p className="font-black text-sm text-slate-800">{koses.find(k => k.id === getUserBooking(editUserForm.id)?.kosId)?.name}</p>
                                        <p className="text-xs font-bold text-slate-500 mt-1">Tipe: {getUserBooking(editUserForm.id)?.roomId}</p>
                                        <div className="mt-2 text-[10px] font-black uppercase text-slate-400 bg-slate-50 p-2 rounded-lg flex justify-between">
                                            <span>Cekin: {getUserBooking(editUserForm.id)?.checkIn}</span>
                                            <span>Cekout: {getUserBooking(editUserForm.id)?.checkOut}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 p-4 rounded-xl text-center">
                                        <p className="text-slate-400 font-bold text-xs">TIDAK ADA SEWA AKTIF / TIDAK KOSAN</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                            <div><p className="font-black text-slate-800">Status Akun</p><p className="text-xs text-slate-500">Verifikasi akun baru ini?</p></div>
                            <select value={editUserForm.isVerified ? 'true' : 'false'} onChange={e => setEditUserForm({...editUserForm, isVerified: e.target.value === 'true'})} className="p-2 bg-white border border-slate-300 rounded-lg font-bold text-sm outline-none">
                                <option value="true">Verified Member</option>
                                <option value="false">Pending Verification</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                    <button onClick={() => setIsEditingUser(false)} className="flex-1 py-4 border rounded-2xl font-bold text-slate-500 hover:bg-slate-50">Batal</button>
                    <button onClick={handleSaveUser} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700">Simpan Data Lengkap</button>
                </div>
            </div>
        </div>
      )}
      
    </div>
  );
};

export default SuperAdminDashboard;
