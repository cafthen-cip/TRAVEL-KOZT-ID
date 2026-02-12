
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Users, TrendingUp, CheckCircle, Clock, 
  MessageSquare, Plus, Edit, Trash2, CreditCard, 
  Image as ImageIcon, MonitorPlay, Save, Bell, Shield, ShieldCheck, Eye, Send, Upload, X, MapPin, Globe, LayoutGrid, User as UserIcon, Settings, Menu, Info, Building,
  Zap, FileText, AlertCircle, PieChart as PieChartIcon, DollarSign, Activity, Wallet, Video, Link as LinkIcon, Paperclip, Lock, Phone, Mail, Newspaper, PlayCircle, Mic, QrCode, ArrowRightLeft, ArrowDownCircle, ArrowUpCircle, Calendar, Youtube, Facebook, Instagram, Twitter, Home, SendHorizontal, Search, Filter
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
  onDeleteTransaction: (id: string) => void;
  bookings: Booking[];
  onDisburseFunds: (bookingId: string) => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  user, users, koses, ads, news, videos, bankAccounts, companyInfo, onUpdateCompany, onUpdateUser, onDeleteUser,
  messages, onSendMessage, onVerifyUser, onVerifyKos, onUpdateKos, onAddAd, onDeleteAd, onAddNews, onDeleteNews, onAddVideo, onDeleteVideo, onAddBank, onDeleteBank,
  transactions, onAddTransaction, onDeleteTransaction, bookings, onDisburseFunds
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'finance' | 'users' | 'koses' | 'payments' | 'chat' | 'settings'>('stats');
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
  const getUserBooking = (userId: string) => bookings.find(b => b.userId === userId && b.status === 'CONFIRMED' && !b.isCheckedOut);

  // --- ACTIONS HANDLERS ---

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
          <NavItem id="settings" label="Pengaturan Global" icon={Settings} />
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab === 'settings' ? 'CMS & Pengaturan' : activeTab.replace('-', ' ')}</h1>
            <button className="md:hidden p-3 bg-white shadow-md rounded-2xl" onClick={() => setIsSidebarOpen(true)}><Menu/></button>
          </div>

          {/* ... (Overview logic) ... */}
          {activeTab === 'stats' && (
             <div className="space-y-12 animate-in fade-in">
                 {/* ... Stats UI ... */}
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

                 {/* Graphic Area Chart */}
                 <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 h-[400px]">
                    <h4 className="font-black text-xl mb-6">Grafik Okupansi & Booking</h4>
                    {activeTenants.length > 0 ? (
                      <ResponsiveContainer width="100%" height="85%">
                          <AreaChart data={activeTenants.slice(0, 10)}> 
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
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase">Belum ada data visual</div>
                    )}
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
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {activeTenants.length === 0 && <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-bold">Belum ada booking aktif</td></tr>}
                                {activeTenants.map(t => (
                                    <tr key={t.bookingId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-900">{t.tenantName}</td>
                                        <td className="px-8 py-5 text-sm text-slate-600">{t.kosName}</td>
                                        <td className="px-8 py-5 text-xs font-mono text-slate-500">{t.checkIn} <br/> s/d {t.checkOut}</td>
                                        <td className="px-8 py-5 text-center font-black text-slate-900">
                                            {t.status}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {t.isDisbursed ? (
                                                <span className="text-green-600 font-black text-xs flex items-center justify-end gap-1"><CheckCircle size={14}/> SUDAH DICAIRKAN</span>
                                            ) : (
                                                <button onClick={() => { if(t.originalBooking) setSelectedDisburseBooking(t.originalBooking); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 ml-auto"><SendHorizontal size={14}/> KIRIM DANA</button>
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

          {activeTab === 'finance' && (
              <div className="space-y-12 animate-in fade-in">
                  {/* ... Finance UI ... */}
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
                                      <option value="CASH_NET">Kas Operasional (Profit)</option>
                                      <option value="TAX_CASH">Kas Pajak</option>
                                      <option value="PERSONAL">Dana Pribadi Founder</option>
                                  </select>
                              </div>
                              
                              <button onClick={handleAddExpense} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl mt-2 shadow-xl hover:bg-red-600 transition-all">CATAT PENGELUARAN</button>
                          </div>
                      </div>
                  </div>

                  {/* Transaction Table */}
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                      <h4 className="font-black text-xl mb-6">Buku Besar Anggaran (Ledger)</h4>
                      <div className="overflow-x-auto max-h-[400px]">
                          <table className="w-full text-left">
                              <thead className="sticky top-0 bg-white">
                                  <tr>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Tanggal</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Keterangan</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Kategori</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Sumber Dana</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Nominal</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center">Aksi</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                  {transactions.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-slate-400">Belum ada transaksi</td></tr>}
                                  {transactions.slice().reverse().map(t => (
                                      <tr key={t.id}>
                                          <td className="px-6 py-4 text-xs font-bold text-slate-500">{t.date}</td>
                                          <td className="px-6 py-4 font-bold text-slate-800">{t.description}</td>
                                          <td className="px-6 py-4 text-xs font-bold text-slate-500"><span className="bg-slate-100 px-2 py-1 rounded">{t.category}</span></td>
                                          <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                              {t.source === 'CASH_NET' ? 'Kas Ops' : t.source === 'TAX_CASH' ? 'Kas Pajak' : t.source === 'PERSONAL' ? 'Pribadi' : '-'}
                                          </td>
                                          <td className={`px-6 py-4 text-right font-black ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                                              {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString()}
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                              {t.id.startsWith('exp-') && (
                                                  <button onClick={() => onDeleteTransaction(t.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Hapus Input Manual">
                                                      <Trash2 size={16}/>
                                                  </button>
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

          {/* ... (Other Tabs: Users, Koses, Payments, Chat, Settings - unchanged) ... */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
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
             <div className="space-y-8 animate-in fade-in">
                 {/* ... Koses Tab Content ... */}
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                        <button onClick={() => setKosFilter('ALL')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${kosFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500'}`}>Semua Properti</button>
                        <button onClick={() => setKosFilter('PENDING')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${kosFilter === 'PENDING' ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'}`}>Perlu Verifikasi</button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input type="text" placeholder="Cari Nama Kos / Pemilik..." value={searchKos} onChange={(e) => setSearchKos(e.target.value)} className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold w-64 shadow-sm outline-none" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {filteredKoses.length === 0 && <div className="col-span-3 text-center py-20 text-slate-400 font-bold">Data properti tidak ditemukan.</div>}
                     {filteredKoses.map(kos => {
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
             </div>
          )}

          {activeTab === 'payments' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in">
                 {/* ... Payments UI ... */}
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                     <h4 className="font-black text-xl mb-6">Metode Pembayaran Aktif</h4>
                     <div className="space-y-4">
                         {bankAccounts.length === 0 && <p className="text-slate-400 font-bold text-center py-4">Belum ada metode pembayaran.</p>}
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

          {activeTab === 'chat' && (
             <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl border flex flex-col h-[700px] overflow-hidden animate-in fade-in">
                 {/* ... Chat UI ... */}
                 <div className="p-6 border-b bg-slate-50 flex items-center gap-4 overflow-x-auto">
                     {conversationPartners.length === 0 && <p className="text-xs text-slate-400 font-bold px-4">Belum ada pesan masuk.</p>}
                     {conversationPartners.map(partnerId => {
                         const partner = users.find(u => u.id === partnerId);
                         return (
                             <button key={partnerId} onClick={() => setSelectedChatUser(partnerId)} className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all shrink-0 ${selectedChatUser === partnerId ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                                 <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden"><img src={partner?.profilePhoto || `https://ui-avatars.com/api/?name=${partner?.fullName}`} className="w-full h-full object-cover"/></div>
                                 <span className="font-bold text-xs">{partner?.fullName || 'Unknown User'}</span>
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

          {activeTab === 'settings' && (
             <div className="space-y-12 animate-in fade-in">
                 {/* ... Settings UI ... */}
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                     <h4 className="font-black text-xl mb-6">Konten Halaman Utama (Landing Page)</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-4">
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Judul Hero</label><input value={companyInfo.heroTitle || ''} onChange={e => onUpdateCompany({...companyInfo, heroTitle: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sub-Judul</label><textarea value={companyInfo.heroSubtitle || ''} onChange={e => onUpdateCompany({...companyInfo, heroSubtitle: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold h-24" /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Perusahaan</label><input value={companyInfo.name || ''} onChange={e => onUpdateCompany({...companyInfo, name: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
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

                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                     <h4 className="font-black text-xl mb-6">Identitas & Sosial Media</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-4">
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Alamat Kantor</label><input value={companyInfo.address || ''} onChange={e => onUpdateCompany({...companyInfo, address: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Resmi</label><input value={companyInfo.email || ''} onChange={e => onUpdateCompany({...companyInfo, email: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                             <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">No. Telepon / CS</label><input value={companyInfo.phone || ''} onChange={e => onUpdateCompany({...companyInfo, phone: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
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
                        <textarea value={companyInfo.about || ''} onChange={e => onUpdateCompany({...companyInfo, about: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold h-24 mt-2" placeholder="Deskripsi singkat perusahaan di footer..." />
                     </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {/* Ads, News, Video cards (omitted for brevity as they are same as before) */}
                     {/* ... */}
                 </div>
             </div>
          )}
        </div>
      </main>
      
      {/* Invoice Disbursement Modal */}
      {selectedDisburseBooking && (
        <div className="fixed inset-0 z-[130] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden animate-in zoom-in duration-300 shadow-2xl relative">
              <div className="bg-slate-900 p-8 text-white">
                 <h3 className="text-xl font-black flex items-center gap-2"><FileText/> Faktur Pencairan Dana</h3>
                 <p className="text-xs text-slate-400 mt-1">Konfirmasi pengiriman dana ke pemilik kos.</p>
              </div>
              <div className="p-8 space-y-6">
                 <div className="flex justify-between items-center border-b border-dashed pb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Dana Penyewa</span>
                    <span className="font-black text-lg text-slate-900">Rp {(selectedDisburseBooking.basePrice + selectedDisburseBooking.taxAmount).toLocaleString()}</span>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-red-500">Potongan Pajak (11%)</span>
                        <span className="font-bold text-red-500">- Rp {selectedDisburseBooking.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-red-500">Platform Fee (3.5%)</span>
                        <span className="font-bold text-red-500">- Rp {selectedDisburseBooking.platformFee.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex justify-between items-center">
                    <span className="text-xs font-black text-green-800 uppercase tracking-widest">Total Transfer</span>
                    <span className="text-xl font-black text-green-600">Rp {(selectedDisburseBooking.basePrice - selectedDisburseBooking.platformFee).toLocaleString()}</span>
                 </div>

                 <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Dengan menekan tombol di bawah, sistem akan otomatis mencatat mutasi dana dari Rekening Bersama ke Rekening Pemilik Kos.
                 </p>

                 <div className="flex gap-4">
                    <button onClick={() => setSelectedDisburseBooking(null)} className="flex-1 py-4 border-2 rounded-2xl font-bold text-slate-500 hover:bg-slate-50">Batal</button>
                    <button onClick={handleConfirmDisburse} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 shadow-lg">Kirim Dana</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {isEditingKos && editKosForm && (
          <div className="fixed inset-0 z-[120] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 md:p-12 overflow-y-auto">
             <div className="bg-white rounded-[3rem] p-10 max-w-5xl w-full space-y-8 shadow-2xl animate-in zoom-in my-auto">
                <div className="flex justify-between items-center border-b pb-6">
                   <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3"><Building className="text-blue-600"/> Edit Data Properti Lengkap</h3>
                   <button onClick={() => setIsEditingKos(false)}><X size={28} className="text-slate-400 hover:text-red-500"/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-1 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-6">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-md">
                                <img src={editKosForm.ownerPhoto || `https://ui-avatars.com/api/?name=${editKosForm.ownerName}`} className="w-full h-full object-cover"/>
                            </div>
                            <h4 className="font-black text-lg text-slate-800">{editKosForm.ownerName}</h4>
                            <p className="text-xs font-bold text-slate-400">Pemilik Properti</p>
                        </div>
                        <div className="space-y-3">
                            <div><label className="text-[10px] font-black uppercase text-slate-400">No. Rekening</label><input value={editKosForm.bankAccount || ''} onChange={e => setEditKosForm({...editKosForm, bankAccount: e.target.value})} className="w-full p-3 bg-white border rounded-xl font-bold text-sm" /></div>
                            <div><label className="text-[10px] font-black uppercase text-slate-400">NIK KTP</label><input value={editKosForm.ktpNumber || ''} onChange={e => setEditKosForm({...editKosForm, ktpNumber: e.target.value})} className="w-full p-3 bg-white border rounded-xl font-bold text-sm" /></div>
                            <div className="h-32 bg-white rounded-xl border overflow-hidden relative group">
                                <img src={editKosForm.ktpPhoto || 'https://via.placeholder.com/300x200?text=KTP'} className="w-full h-full object-cover"/>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs uppercase">Foto KTP</div>
                            </div>
                        </div>
                    </div>

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
            <div className="bg-white rounded-[3rem] p-10 max-w-4xl w-full space-y-8 shadow-2xl animate-in zoom-in my-auto">
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
                    </div>
                    <div className="md:col-span-2 space-y-6">
                       <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
                            <h4 className="font-black text-slate-800 flex items-center gap-2"><Lock size={16}/> Akun Login</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-black uppercase text-slate-400">Username</label><input value={editUserForm.username} onChange={e => setEditUserForm({...editUserForm, username: e.target.value})} className="w-full p-3 bg-white border rounded-xl font-bold" /></div>
                                <div><label className="text-[10px] font-black uppercase text-slate-400">Password</label><input type="text" value={editUserForm.password || ''} onChange={e => setEditUserForm({...editUserForm, password: e.target.value})} className="w-full p-3 bg-white border rounded-xl font-bold" placeholder="Ubah Password" /></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2"><label className="text-xs font-bold uppercase text-slate-400">Nama Lengkap</label><input value={editUserForm.fullName} onChange={e => setEditUserForm({...editUserForm, fullName: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Email</label><input value={editUserForm.email} onChange={e => setEditUserForm({...editUserForm, email: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">No. HP / WA</label><input value={editUserForm.phone || ''} onChange={e => setEditUserForm({...editUserForm, phone: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                            
                            {(editUserForm.role === UserRole.USER || editUserForm.role === UserRole.ADMIN_KOS) && (
                                <div className="space-y-2 col-span-2"><label className="text-xs font-bold uppercase text-slate-400">Alamat Lengkap</label><textarea value={editUserForm.address || ''} onChange={e => setEditUserForm({...editUserForm, address: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold h-20" /></div>
                            )}

                            {editUserForm.role === UserRole.ADMIN_KOS && (
                                <>
                                    <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Nama Bank</label><input value={editUserForm.bankName || ''} onChange={e => setEditUserForm({...editUserForm, bankName: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="BCA / Mandiri" /></div>
                                    <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">No. Rekening</label><input value={editUserForm.bankAccountNumber || ''} onChange={e => setEditUserForm({...editUserForm, bankAccountNumber: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /></div>
                                    
                                    <div className="col-span-2 mt-2">
                                        <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-200">
                                            <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest"><CreditCard size={16}/> Identitas & KTP Pemilik</h4>
                                            <div className="flex gap-6 items-start">
                                                <div className="flex-1 space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400">NIK KTP</label>
                                                    <input value={editUserForm.ktp || ''} onChange={e => setEditUserForm({...editUserForm, ktp: e.target.value})} className="w-full p-3 bg-white border rounded-xl font-bold text-sm" placeholder="16 Digit NIK" />
                                                </div>
                                                <div className="w-32 shrink-0">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Foto KTP</label>
                                                    <div onClick={() => userKtpFileRef.current?.click()} className="h-24 bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 overflow-hidden relative group shadow-sm transition-all">
                                                        {editUserForm.ktpPhoto ? <img src={editUserForm.ktpPhoto} className="w-full h-full object-cover" /> : <div className="text-slate-300 flex flex-col items-center"><ImageIcon size={20}/><span className="text-[8px] font-bold mt-1">UPLOAD</span></div>}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-[10px] transition-all">GANTI</div>
                                                        <input type="file" ref={userKtpFileRef} hidden onChange={e => handleFileUpload(e, 'editUserKtp')} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                            <div><p className="font-black text-slate-800">Status Akun</p><p className="text-xs text-slate-500">Verifikasi akun baru ini?</p></div>
                            <select value={editUserForm.isVerified ? 'true' : 'false'} onChange={e => setEditUserForm({...editUserForm, isVerified: e.target.value === 'true'})} className="p-2 bg-white border border-slate-300 rounded-lg font-bold text-sm outline-none">
                                <option value="true">Verified Member</option>
                                <option value="false">Pending Verification</option>
                            </select>
                        </div>
                    </div>

                    {editUserForm.role === UserRole.ADMIN_KOS && (
                        <div className="md:col-span-3 space-y-6 mt-4 border-t pt-6">
                            <h4 className="font-black text-xl text-slate-900 flex items-center gap-2">
                                <Building className="text-blue-600"/> Portofolio Properti
                            </h4>
                            <div className="grid grid-cols-1 gap-6">
                                {getUserKoses(editUserForm.id).length > 0 ? getUserKoses(editUserForm.id).map(kos => (
                                    <div key={kos.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h5 className="font-black text-lg text-slate-800">{kos.name}</h5>
                                                <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-1">
                                                    <MapPin size={12}/> {kos.address}, {kos.district}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${kos.isVerified ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                {kos.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>

                                        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-100 font-black text-slate-500 uppercase">
                                                    <tr>
                                                        <th className="p-3">Tipe Kamar</th>
                                                        <th className="p-3">Harga</th>
                                                        <th className="p-3">Stok</th>
                                                        <th className="p-3">Fasilitas</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                                                    {kos.rooms.map(room => (
                                                        <tr key={room.id}>
                                                            <td className="p-3 font-bold text-blue-600">{room.type}</td>
                                                            <td className="p-3">Rp {room.price.toLocaleString()}</td>
                                                            <td className="p-3">{room.stock} Unit</td>
                                                            <td className="p-3 text-slate-400 truncate max-w-xs">{room.facilities.slice(0,3).join(', ')}{room.facilities.length > 3 ? '...' : ''}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )) : <p className="text-slate-400 font-bold text-center py-4 bg-slate-50 rounded-2xl border border-dashed">Belum ada properti yang terdaftar.</p>}
                            </div>
                        </div>
                    )}
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
