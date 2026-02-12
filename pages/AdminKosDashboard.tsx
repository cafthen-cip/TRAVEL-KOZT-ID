
import React, { useState, useRef, useMemo } from 'react';
import { 
  Home, Plus, MapPin, LayoutGrid, CheckCircle, 
  XCircle, Clock, Save, Image as ImageIcon, CheckSquare, 
  User as UserIcon, CreditCard, Info, Trash2, Edit, Upload, X, MessageSquare, Send, Eye, Globe, TrendingUp, DollarSign, Link as LinkIcon, PieChart as PieChartIcon, LogOut, ArrowRightLeft, Calendar, Activity
} from 'lucide-react';
import { User, Kos, Booking, KosCategory, RoomType, PriceType, Room, ChatMessage, Transaction } from '../types';
import { FACILITIES, PROVINCES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

interface AdminKosDashboardProps {
  user: User;
  bookings: Booking[];
  users: User[];
  koses: Kos[];
  messages: ChatMessage[];
  onSendMessage: (msg: { senderId: string, receiverId: string, text: string }) => void;
  onUpdateStatus: (bookingId: string, status: 'CONFIRMED' | 'REJECTED') => void;
  onManualCheckout: (bookingId: string) => void;
  onEditBookingRoom: (bookingId: string, newRoomId: string, newRoomType: RoomType) => void;
  onAddKos: (kos: Kos) => void;
  onUpdateKos: (kos: Kos) => void;
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
}

const AdminKosDashboard: React.FC<AdminKosDashboardProps> = ({ 
  user, bookings, users, koses, messages, onSendMessage, onUpdateStatus, onManualCheckout, onEditBookingRoom, onAddKos, onUpdateKos, transactions, onAddTransaction
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'add' | 'bookings' | 'finance' | 'chat'>('listings');
  const [selectedKosToManage, setSelectedKosToManage] = useState<Kos | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [viewProof, setViewProof] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mapLinkInput, setMapLinkInput] = useState('');
  
  // Edit Booking State
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedNewRoomId, setSelectedNewRoomId] = useState<string>('');

  // Finance State
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Operasional' });

  const ktpInputRef = useRef<HTMLInputElement>(null);
  const mainKosPhotoRef = useRef<HTMLInputElement>(null);
  const roomPhotoRef = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [formData, setFormData] = useState({
    name: '', 
    category: KosCategory.MIXED, 
    province: '',
    district: '',
    village: '',
    address: '', 
    description: '', 
    lat: '', 
    lng: '', 
    bankAccount: '', 
    ktpNumber: '', 
    ktpPhoto: '', 
    ownerPhoto: '',
  });

  const [roomData, setRoomData] = useState<Room[]>([
    { id: 'r-1', type: RoomType.STANDARD, facilities: [], price: 0, priceType: PriceType.MONTHLY, photos: [], stock: 0 }
  ]);

  // Derived Data
  const myKoses = koses.filter(k => k.ownerId === user.id || k.ownerName === user.fullName);
  const myBookings = bookings.filter(b => koses.find(k => k.id === b.kosId)?.ownerId === user.id);
  const filteredMessages = messages.filter(m => (m.senderId === user.id || m.receiverId === user.id));
  const myTransactions = transactions.filter(t => t.userId === user.id);

  // --- Logic for Smart Maps Link (Robust Regex) ---
  const handleMapLinkParse = (link: string) => {
    setMapLinkInput(link);
    const atPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const qPattern = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    
    let match = link.match(atPattern);
    if (!match) match = link.match(qPattern);
    
    if (match) {
        setFormData(prev => ({
            ...prev,
            lat: match![1],
            lng: match![2]
        }));
    }
  };

  // --- Logic for Edit Kos (Pre-fill) ---
  const handleEditKos = (kos: Kos) => {
    setIsEditing(true);
    setEditingId(kos.id);
    setFormData({
        name: kos.name,
        category: kos.category,
        province: kos.province,
        district: kos.district,
        village: kos.village,
        address: kos.address,
        description: kos.description,
        lat: kos.lat.toString(),
        lng: kos.lng.toString(),
        bankAccount: kos.bankAccount,
        ktpNumber: kos.ktpNumber,
        ktpPhoto: kos.ktpPhoto,
        ownerPhoto: kos.ownerPhoto
    });
    setRoomData(kos.rooms);
    setActiveTab('add'); 
    window.scrollTo(0,0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, roomIndex?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (roomIndex !== undefined) {
          const updatedRooms = [...roomData];
          updatedRooms[roomIndex].photos = [...updatedRooms[roomIndex].photos, base64];
          setRoomData(updatedRooms);
        } else {
          setFormData(prev => ({ ...prev, [field]: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateRoomField = (index: number, field: keyof Room, value: any) => {
    const updatedRooms = [...roomData];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    setRoomData(updatedRooms);
  };

  const handleToggleFacility = (roomIndex: number, facility: string) => {
    const updatedRooms = [...roomData];
    const currentFacilities = updatedRooms[roomIndex].facilities;
    if (currentFacilities.includes(facility)) {
      updatedRooms[roomIndex].facilities = currentFacilities.filter(f => f !== facility);
    } else {
      updatedRooms[roomIndex].facilities = [...currentFacilities, facility];
    }
    setRoomData(updatedRooms);
  };

  const removeRoomPhoto = (roomIndex: number, photoIndex: number) => {
    const updatedRooms = [...roomData];
    updatedRooms[roomIndex].photos = updatedRooms[roomIndex].photos.filter((_, i) => i !== photoIndex);
    setRoomData(updatedRooms);
  };

  const addRoomType = () => {
    setRoomData([...roomData, { id: `r-${Date.now()}`, type: RoomType.STANDARD, facilities: [], price: 0, priceType: PriceType.MONTHLY, photos: [], stock: 0 }]);
  };

  const removeRoomType = (index: number) => {
    if (roomData.length > 1) {
      setRoomData(roomData.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.province) {
      alert("Mohon lengkapi data Nama Kos, Provinsi, dan Alamat.");
      return;
    }

    const kosPayload: Kos = {
      id: isEditing && editingId ? editingId : `k-${Date.now()}`, 
      name: formData.name, 
      category: formData.category, 
      province: formData.province,
      district: formData.district,
      village: formData.village,
      address: formData.address, 
      description: formData.description,
      ownerName: user.fullName, 
      ownerId: user.id,
      bankAccount: formData.bankAccount, 
      ktpNumber: formData.ktpNumber, 
      lat: parseFloat(formData.lat) || 0, 
      lng: parseFloat(formData.lng) || 0,
      isVerified: isEditing ? true : false, 
      rooms: roomData, 
      ktpPhoto: formData.ktpPhoto, 
      ownerPhoto: formData.ownerPhoto,
    };

    if (isEditing) {
        onUpdateKos(kosPayload);
        alert('Data properti berhasil diperbarui!');
    } else {
        onAddKos(kosPayload);
        alert('Kos berhasil didaftarkan! Menunggu verifikasi super admin.');
    }

    setFormData({ 
      name: '', category: KosCategory.MIXED, province: '', district: '', village: '',
      address: '', description: '', lat: '', lng: '', bankAccount: '', ktpNumber: '', ktpPhoto: '', ownerPhoto: '' 
    });
    setRoomData([{ id: 'r-1', type: RoomType.STANDARD, facilities: [], price: 0, priceType: PriceType.MONTHLY, photos: [], stock: 0 }]);
    setMapLinkInput('');
    setIsEditing(false);
    setEditingId(null);
    setActiveTab('listings');
  };

  // --- Logic for Expenses ---
  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;
    onAddTransaction({
        id: `exp-${Date.now()}`,
        userId: user.id,
        type: 'EXPENSE',
        amount: parseInt(newExpense.amount),
        description: newExpense.description,
        category: newExpense.category,
        date: new Date().toISOString().split('T')[0]
    });
    setNewExpense({ description: '', amount: '', category: 'Operasional' });
    alert('Pengeluaran berhasil dicatat.');
  };

  // --- Logic for Room Change (Same Day Edit) ---
  const openEditBooking = (booking: Booking) => {
    const today = new Date().toISOString().split('T')[0];
    if (booking.checkIn !== today) {
        alert("Perubahan kamar hanya dapat dilakukan pada hari tanggal Check-in.");
        return;
    }
    setEditingBooking(booking);
  };

  const saveRoomChange = () => {
    if (!editingBooking || !selectedNewRoomId) return;
    const kos = myKoses.find(k => k.id === editingBooking.kosId);
    const newRoom = kos?.rooms.find(r => r.id === selectedNewRoomId);
    
    if (newRoom) {
        onEditBookingRoom(editingBooking.id, newRoom.id, newRoom.type);
        alert("Tipe kamar berhasil diubah. Mohon sesuaikan selisih harga secara manual jika ada.");
        setEditingBooking(null);
        setSelectedNewRoomId('');
    }
  };

  // --- Charts Data ---
  const totalStock = myKoses.reduce((acc, k) => acc + k.rooms.reduce((rAcc, r) => rAcc + r.stock, 0), 0); 
  const activeBookingsCount = myBookings.filter(b => b.status === 'CONFIRMED' && !b.isCheckedOut).length; 
  
  const occupancyData = [
    { name: 'Terisi', value: activeBookingsCount, color: '#16a34a' },
    { name: 'Kosong', value: totalStock, color: '#e2e8f0' }
  ];

  const incomeTotal = myTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const expenseTotal = myTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const financeData = [
      { name: 'Pemasukan', amount: incomeTotal, fill: '#8b5cf6' },
      { name: 'Pengeluaran', amount: expenseTotal, fill: '#ef4444' }
  ];

  // Group check-ins by month
  const checkInMap = new Map<string, number>();
  myBookings.filter(b => b.status === 'CONFIRMED').forEach(b => {
      const month = b.checkIn ? new Date(b.checkIn).toLocaleString('id-ID', { month: 'short', year: '2-digit' }) : 'Unknown'; 
      checkInMap.set(month, (checkInMap.get(month) || 0) + 1);
  });
  const checkInData = Array.from(checkInMap.entries()).map(([date, count]) => ({ date, count })).reverse(); 

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-8 flex flex-col shrink-0">
        <div className="mb-12 flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-purple-200">TK</div>
          <div><h2 className="font-extrabold text-slate-900 leading-tight">Owner Workspace</h2><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{user.fullName}</p></div>
        </div>
        <nav className="space-y-3 flex-1">
          <button onClick={() => {setActiveTab('listings'); setSelectedKosToManage(null);}} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'listings' ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'text-slate-500 hover:bg-slate-100'}`}><LayoutGrid size={20} /> Properti Saya</button>
          <button onClick={() => { setActiveTab('add'); setIsEditing(false); setFormData({name: '', category: KosCategory.MIXED, province: '', district: '', village: '', address: '', description: '', lat: '', lng: '', bankAccount: '', ktpNumber: '', ktpPhoto: '', ownerPhoto: ''}); setRoomData([{ id: 'r-1', type: RoomType.STANDARD, facilities: [], price: 0, priceType: PriceType.MONTHLY, photos: [], stock: 0 }]); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'add' ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'text-slate-500 hover:bg-slate-100'}`}><Plus size={20} /> Tambah / Edit Kos</button>
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'text-slate-500 hover:bg-slate-100'}`}><CheckCircle size={20} /> Verifikasi & Cekin</button>
          <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'finance' ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'text-slate-500 hover:bg-slate-100'}`}><DollarSign size={20} /> Laporan Keuangan</button>
          <button onClick={() => setActiveTab('chat')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'text-slate-500 hover:bg-slate-100'}`}><MessageSquare size={20} /> Hubungi Admin</button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeTab === 'finance' ? (
          <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg relative overflow-hidden">
                   <div className="absolute right-0 top-0 p-8 opacity-5"><DollarSign size={100}/></div>
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><TrendingUp size={24}/></div>
                      <span className="text-[10px] font-black uppercase text-slate-400">Total Pemasukan</span>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900">Rp {incomeTotal.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg relative overflow-hidden">
                   <div className="absolute right-0 top-0 p-8 opacity-5"><CreditCard size={100}/></div>
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><CreditCard size={24}/></div>
                      <span className="text-[10px] font-black uppercase text-slate-400">Total Pengeluaran</span>
                   </div>
                   <h3 className="text-3xl font-black text-slate-900">Rp {expenseTotal.toLocaleString()}</h3>
                </div>
                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                   <div className="absolute right-0 top-0 p-8 opacity-10"><Activity size={100}/></div>
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white/20 rounded-2xl"><DollarSign size={24}/></div>
                      <span className="text-[10px] font-black uppercase text-white/60">Profit Bersih</span>
                   </div>
                   <h3 className="text-3xl font-black">Rp {(incomeTotal - expenseTotal).toLocaleString()}</h3>
                </div>
             </div>
             
             {/* Charts Section */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Laba Rugi Chart */}
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 h-[400px]">
                   <h4 className="font-black text-xl mb-6">Analisa Laba Rugi</h4>
                   <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={financeData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontWeight:'bold'}} />
                         <Tooltip cursor={{fill:'transparent'}} contentStyle={{borderRadius:'16px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}}/>
                         <Bar dataKey="amount" radius={[10,10,10,10]} barSize={60} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
                
                {/* Okupansi Pie Chart */}
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 h-[400px] flex flex-col items-center relative">
                   <h4 className="font-black text-xl mb-2 w-full text-left">Okupansi Kamar</h4>
                   <div className="flex-1 w-full flex justify-center items-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie data={occupancyData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                               {occupancyData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius:'16px', border:'none'}} />
                            <Legend verticalAlign="bottom" height={36}/>
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
                         <span className="text-4xl font-black text-slate-900">{activeBookingsCount}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Unit Terisi</span>
                      </div>
                   </div>
                </div>

                {/* Trafik Cekin Chart */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 h-[350px]">
                    <h4 className="font-black text-xl mb-6">Tren Konsumen Cekin (Bulanan)</h4>
                    <ResponsiveContainer width="100%" height="85%">
                        <AreaChart data={checkInData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontWeight:'bold'}} />
                            <YAxis axisLine={false} tickLine={false} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <Tooltip contentStyle={{borderRadius:'16px', border:'none'}} />
                            <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
             </div>

             {/* Expense Form & History */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                   <h4 className="font-black text-xl mb-6 flex items-center gap-2"><Plus size={24} className="text-red-500"/> Catat Pengeluaran</h4>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Keterangan</label>
                         <input type="text" placeholder="Cth: Bayar Listrik" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full p-5 bg-slate-50 border rounded-[1.5rem] font-bold outline-none focus:bg-white" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nominal (Rp)</label>
                         <input type="number" placeholder="0" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full p-5 bg-slate-50 border rounded-[1.5rem] font-bold outline-none focus:bg-white" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kategori</label>
                         <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full p-5 bg-slate-50 border rounded-[1.5rem] font-bold outline-none focus:bg-white">
                            <option value="Operasional">Operasional</option>
                            <option value="Perawatan">Perawatan</option>
                            <option value="Gaji">Gaji Karyawan</option>
                            <option value="Lainnya">Lainnya</option>
                         </select>
                      </div>
                      <button onClick={handleAddExpense} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-red-600 transition-all shadow-xl flex items-center justify-center gap-2"><Save size={20}/> SIMPAN PENGELUARAN</button>
                   </div>
                </div>

                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col h-[500px]">
                   <h4 className="font-black text-xl mb-6">Mutasi Rekening Kos</h4>
                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                      {myTransactions.length === 0 && <div className="text-center py-20 text-slate-300 font-bold uppercase">Belum ada transaksi</div>}
                      {myTransactions.slice().reverse().map(t => (
                         <div key={t.id} className="flex justify-between items-center p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all">
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${t.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'}`}>
                                 {t.type === 'INCOME' ? <TrendingUp size={20}/> : <CreditCard size={20}/>}
                               </div>
                               <div>
                                  <p className="font-black text-slate-800">{t.description}</p>
                                  <p className="text-xs font-bold text-slate-400">{t.category} • {t.date}</p>
                               </div>
                            </div>
                            <p className={`font-black text-lg ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                              {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString()}
                            </p>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="max-w-6xl mx-auto bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-12 border-b flex justify-between items-center bg-slate-50/50"><h3 className="font-black text-2xl text-slate-900">Manajemen Penghuni & Booking</h3></div>
            <div className="divide-y divide-slate-50">
              {myBookings.map((b) => (
                <div key={b.id} className="p-10 flex flex-col md:flex-row items-center justify-between gap-10 hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-8 border-white shadow-2xl flex items-center justify-center font-black text-4xl text-slate-300">{users.find(u => u.id === b.userId)?.fullName.charAt(0)}</div>
                    <div>
                      <div className="flex items-center gap-3 mb-2"><p className="font-black text-2xl text-slate-800">{users.find(u => u.id === b.userId)?.fullName}</p><span className="px-5 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{b.roomId}</span></div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> {b.checkIn} - {b.checkOut}</p>
                        {b.status === 'CONFIRMED' && !b.isCheckedOut && <p className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-1 rounded inline-block">SEDANG MENGINAP</p>}
                        {b.status === 'CHECKED_OUT' && <p className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded inline-block">SUDAH CHECK-OUT</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {b.status === 'CONFIRMED' && !b.isCheckedOut && (
                        <>
                            <button onClick={() => openEditBooking(b)} className="px-6 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-[1.5rem] text-[10px] font-black uppercase hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2"><ArrowRightLeft size={16}/> Ganti Kamar</button>
                            <button onClick={() => { if(confirm('Konfirmasi Checkout manual untuk penghuni ini?')) onManualCheckout(b.id) }} className="px-6 py-4 bg-red-50 text-red-600 rounded-[1.5rem] text-[10px] font-black uppercase hover:bg-red-100 transition-all flex items-center gap-2"><LogOut size={16}/> Check-Out Manual</button>
                        </>
                    )}
                    {b.status === 'PENDING' && b.paymentProof && (
                      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                        <button onClick={() => setViewProof(b.paymentProof!)} className="w-full md:w-auto px-8 py-5 bg-blue-50 text-blue-600 rounded-[1.5rem] text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-blue-100 hover:bg-blue-100 transition-all"><Eye size={20}/> LIHAT BUKTI</button>
                        <button onClick={() => onUpdateStatus(b.id, 'CONFIRMED')} className="w-full md:w-auto px-10 py-5 bg-green-500 text-white text-[10px] font-black uppercase rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-green-600 shadow-2xl shadow-green-200 transition-all"><CheckCircle size={20}/> TERIMA SEWA</button>
                      </div>
                    )}
                    {b.status === 'PENDING' && !b.paymentProof && <button onClick={() => onUpdateStatus(b.id, 'REJECTED')} className="p-5 bg-white border border-slate-200 text-red-500 rounded-[1.5rem] hover:bg-red-50 transition-all"><XCircle size={28}/></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : selectedKosToManage ? (
            <div className="max-w-4xl mx-auto animate-in slide-in-from-right-10 duration-500 pb-20">
                <button onClick={() => setSelectedKosToManage(null)} className="mb-8 text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-purple-600 transition-colors"> <X size={16}/> KEMBALI KE DAFTAR</button>
                <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-12">
                    <div className="flex justify-between items-start">
                        <h3 className="text-4xl font-black text-slate-900">{selectedKosToManage.name}</h3>
                        <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest ${selectedKosToManage.isVerified ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{selectedKosToManage.isVerified ? 'VERIFIED' : 'WAITING VERIFICATION'}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="h-80 rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-slate-50">
                            <img src={selectedKosToManage.ownerPhoto || 'https://picsum.photos/600/400'} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lokasi</p>
                                <p className="font-bold text-slate-800">{selectedKosToManage.address}</p>
                                <p className="text-xs text-blue-600 font-black">{selectedKosToManage.lat}, {selectedKosToManage.lng}</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {selectedKosToManage.rooms.map(r => (
                        <div key={r.id} className="bg-white border-2 border-slate-50 p-6 rounded-3xl shadow-sm">
                            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">{r.type}</p>
                            <p className="text-lg font-black text-slate-800">Rp {r.price.toLocaleString()} <span className="text-xs font-medium text-slate-400">/{r.priceType}</span></p>
                            <p className="text-xs text-slate-500 font-medium mt-2">Stok: {r.stock} Kamar</p>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : activeTab === 'add' ? (
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in duration-500">
              {/* Seksi Biodata Kos */}
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-purple-600"></div>
                <div className="flex items-center justify-between border-b pb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-purple-50 rounded-3xl text-purple-600 shadow-sm"><Home size={28}/></div>
                    <div><h3 className="font-black text-2xl text-slate-900">{isEditing ? 'Edit Data Properti' : 'Pendaftaran Unit Baru'}</h3><p className="text-sm text-slate-400 font-medium">Lengkapi data properti untuk dipasarkan.</p></div>
                  </div>
                  {isEditing && <button type="button" onClick={() => { setIsEditing(false); setActiveTab('listings'); }} className="px-6 py-3 border-2 border-red-100 text-red-500 rounded-2xl font-black text-xs hover:bg-red-50">BATAL EDIT</button>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kos / Properti</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none focus:border-purple-600 focus:bg-white transition-all shadow-sm" placeholder="Contoh: Kos Elite Melati" required /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Peruntukan Penghuni</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as KosCategory})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none cursor-pointer shadow-sm"><option value={KosCategory.MALE}>Khusus Pria</option><option value={KosCategory.FEMALE}>Khusus Perempuan</option><option value={KosCategory.MIXED}>Campur</option></select></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Provinsi</label><select value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none shadow-sm" required><option value="">Pilih Provinsi...</option>{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kecamatan</label><input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none shadow-sm" placeholder="Kecamatan" /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kelurahan</label><input type="text" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none shadow-sm" placeholder="Kelurahan" /></div>
                </div>

                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap</label><textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold h-28 outline-none focus:border-purple-600 focus:bg-white shadow-sm" placeholder="Detail alamat untuk navigasi..." required /></div>
                
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi & Peraturan Kos</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold h-32 outline-none focus:border-purple-600 focus:bg-white shadow-sm" placeholder="Jelaskan kelebihan kos anda..." /></div>

                {/* Smart Link Feature */}
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] space-y-4">
                   <div className="flex items-center gap-2"><LinkIcon size={18} className="text-blue-600"/><h4 className="font-black text-blue-800">Smart Map Locator</h4></div>
                   <p className="text-xs text-blue-600/70 font-medium">Tempel link Google Maps di sini untuk mengisi Latitude & Longitude secara otomatis.</p>
                   <input type="text" value={mapLinkInput} onChange={(e) => handleMapLinkParse(e.target.value)} placeholder="Paste Link Google Maps disini..." className="w-full p-4 bg-white border border-blue-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-300 outline-none transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Globe size={12}/> Latitude</label><input type="text" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none shadow-sm" placeholder="-6.2088" /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Globe size={12}/> Longitude</label><input type="text" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none shadow-sm" placeholder="106.8456" /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK KTP Pemilik</label><input type="text" value={formData.ktpNumber} onChange={e => setFormData({...formData, ktpNumber: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none shadow-sm" placeholder="16 Digit NIK" /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rekening Pembayaran</label><input type="text" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold outline-none shadow-sm" placeholder="BCA 000-000-0000" /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                   <div onClick={() => ktpInputRef.current?.click()} className="h-44 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-purple-200 transition-all overflow-hidden relative group">
                      {formData.ktpPhoto ? <img src={formData.ktpPhoto} className="w-full h-full object-cover" /> : <div className="text-center text-slate-300"><Upload className="mx-auto mb-3" size={32}/><p className="text-[10px] font-black tracking-widest uppercase">UPLOAD FOTO KTP PEMILIK</p></div>}
                      <input type="file" ref={ktpInputRef} hidden accept="image/*" onChange={e => handleFileUpload(e, 'ktpPhoto')} />
                   </div>
                   <div onClick={() => mainKosPhotoRef.current?.click()} className="h-44 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-purple-200 transition-all overflow-hidden relative group">
                      {formData.ownerPhoto ? <img src={formData.ownerPhoto} className="w-full h-full object-cover" /> : <div className="text-center text-slate-300"><ImageIcon className="mx-auto mb-3" size={32}/><p className="text-[10px] font-black tracking-widest uppercase">UPLOAD FOTO UTAMA KOS</p></div>}
                      <input type="file" ref={mainKosPhotoRef} hidden accept="image/*" onChange={e => handleFileUpload(e, 'ownerPhoto')} />
                   </div>
                </div>
              </div>

              {/* Seksi Detail Kamar */}
              <div className="space-y-10">
                <div className="flex items-center justify-between px-6">
                  <h3 className="font-black text-3xl text-slate-900 flex items-center gap-4"><LayoutGrid className="text-purple-600" size={32}/> Konfigurasi Kamar</h3>
                  <button type="button" onClick={addRoomType} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95"><Plus size={18}/> Tambah Tipe Baru</button>
                </div>
                
                {roomData.map((room, index) => (
                  <div key={room.id} className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 relative animate-in slide-in-from-bottom-10 duration-500">
                    <button type="button" onClick={() => removeRoomType(index)} className="absolute top-10 right-10 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={28}/></button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                      <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kamar</label><select value={room.type} onChange={e => updateRoomField(index, 'type', e.target.value as RoomType)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold shadow-sm outline-none focus:border-purple-600"><option value={RoomType.STANDARD}>Standard</option><option value={RoomType.SUPERIOR}>Superior</option><option value={RoomType.VIP}>VIP</option></select></div>
                      <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kapasitas Stok</label><input type="number" value={room.stock} onChange={e => updateRoomField(index, 'stock', parseInt(e.target.value) || 0)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold shadow-sm" placeholder="0 Unit" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga Sewa</label><input type="number" value={room.price} onChange={e => updateRoomField(index, 'price', parseInt(e.target.value) || 0)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold shadow-sm" placeholder="Rp 0" /></div>
                      <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Periode</label><select value={room.priceType} onChange={e => updateRoomField(index, 'priceType', e.target.value as PriceType)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold shadow-sm"><option value={PriceType.DAILY}>Harian</option><option value={PriceType.WEEKLY}>Mingguan</option><option value={PriceType.MONTHLY}>Bulanan</option><option value={PriceType.YEARLY}>Tahunan</option></select></div>
                    </div>

                    <div className="space-y-6 mb-10">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-2"><CheckSquare size={16} className="text-purple-600"/> Fasilitas Tersedia</label>
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                         {FACILITIES.map(f => (
                           <label key={f} className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" checked={room.facilities.includes(f)} onChange={() => handleToggleFacility(index, f)} className="w-5 h-5 accent-purple-600 rounded-xl transition-all" /><span className="text-[11px] font-bold text-slate-600 group-hover:text-purple-900 transition-colors">{f}</span></label>
                         ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Galeri Foto Unit</label>
                      <div className="flex flex-wrap gap-6">
                        {room.photos.map((p, pi) => (
                          <div key={pi} className="relative w-32 h-32 group/photo rounded-[1.5rem] overflow-hidden shadow-xl ring-4 ring-white"><img src={p} className="w-full h-full object-cover" /><button type="button" onClick={() => removeRoomPhoto(index, pi)} className="absolute inset-0 bg-red-600/70 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center text-white transition-opacity"><Trash2 size={24}/></button></div>
                        ))}
                        <button type="button" onClick={() => roomPhotoRef.current[index]?.click()} className="w-32 h-32 border-4 border-dashed border-slate-100 rounded-[1.5rem] flex flex-col items-center justify-center text-slate-200 hover:bg-slate-50 hover:border-purple-200 transition-all"><Plus size={40}/><span className="text-[10px] font-black uppercase tracking-widest mt-1">Add Foto</span><input type="file" ref={el => { roomPhotoRef.current[index] = el; }} hidden accept="image/*" onChange={e => handleFileUpload(e, 'roomPhotos', index)} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-7 rounded-[3.5rem] shadow-2xl shadow-purple-200 transition-all flex items-center justify-center gap-4 transform active:scale-95 text-xl tracking-tighter"><Save size={32}/> {isEditing ? 'SIMPAN PERUBAHAN' : 'PUBLIKASIKAN PROPERTI SAYA'}</button>
          </form>
        ) : activeTab === 'listings' ? (
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-500">
               {myKoses.map(kos => (
                 <div key={kos.id} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all group relative">
                    <div className="h-64 relative"><img src={kos.ownerPhoto} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/></div>
                    <div className="p-10 space-y-4">
                        <h4 className="font-black text-2xl text-slate-800">{kos.name}</h4>
                        <p className="text-xs text-slate-400 font-bold flex items-center gap-2"><MapPin size={16}/> {kos.address}</p>
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setSelectedKosToManage(kos)} className="flex-1 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase">KELOLA UNIT</button>
                            <button onClick={() => handleEditKos(kos)} className="p-4 bg-slate-50 text-slate-400 rounded-[1.5rem] hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit size={24}/></button>
                        </div>
                    </div>
                 </div>
               ))}
            </div>
        ) : (
            // Chat View
            <div className="max-w-4xl mx-auto bg-white rounded-[4rem] shadow-2xl border flex flex-col h-[700px] overflow-hidden">
                <div className="p-10 border-b bg-purple-600 text-white shadow-lg z-10"><h4 className="font-black text-2xl flex items-center gap-3"><MessageSquare/> Bantuan Super Admin</h4></div>
                <div className="flex-1 bg-slate-50 p-10 space-y-4 overflow-y-auto">
                    {filteredMessages.map(m => <div key={m.id} className={`p-4 rounded-2xl shadow-sm max-w-[80%] ${m.senderId === user.id ? 'bg-purple-600 text-white ml-auto' : 'bg-white text-slate-800 mr-auto'}`}>{m.text}</div>)}
                </div>
                <form className="p-10 bg-white border-t flex gap-4">
                    <input className="flex-1 border p-4 rounded-[2rem] bg-slate-50 outline-none font-bold" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ketik pesan bantuan..."/>
                    <button onClick={(e) => {e.preventDefault(); onSendMessage({senderId:user.id, receiverId:'sa-1', text:chatInput}); setChatInput('')}} className="bg-purple-600 text-white p-4 rounded-full shadow-xl hover:bg-purple-700 transition-all"><Send/></button>
                </form>
            </div>
        )}
      </main>

      {/* Edit Booking Room Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-[120] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in duration-300">
              <h3 className="text-2xl font-black text-slate-900">Ubah Tipe Kamar (Hari Check-in)</h3>
              <p className="text-sm text-slate-500 font-medium">Pilih kamar baru untuk penyewa ini. Pastikan selisih harga diselesaikan secara manual.</p>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                 {myKoses.find(k => k.id === editingBooking.kosId)?.rooms.map(r => (
                    <label key={r.id} className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer hover:bg-purple-50 transition-all ${selectedNewRoomId === r.id ? 'border-purple-600 bg-purple-50' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-3">
                            <input type="radio" name="newRoom" checked={selectedNewRoomId === r.id} onChange={() => setSelectedNewRoomId(r.id)} className="accent-purple-600 w-5 h-5" />
                            <div><p className="font-black text-sm">{r.type}</p><p className="text-[10px] font-bold text-slate-400">Stok Tersedia: {r.stock}</p></div>
                        </div>
                        <p className="font-black text-purple-600">Rp {r.price.toLocaleString()}</p>
                    </label>
                 ))}
              </div>

              <div className="flex gap-4 pt-4">
                 <button onClick={() => { setEditingBooking(null); setSelectedNewRoomId(''); }} className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50">Batal</button>
                 <button onClick={saveRoomChange} className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 shadow-lg shadow-purple-200">Simpan Perubahan</button>
              </div>
           </div>
        </div>
      )}

      {viewProof && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-12">
          <div className="relative max-w-2xl w-full">
            <button onClick={() => setViewProof(null)} className="absolute -top-20 right-0 text-white flex items-center gap-4 font-black text-xs uppercase tracking-[0.3em]"><X size={24}/> TUTUP</button>
            <img src={viewProof} className="w-full h-auto rounded-[4rem] shadow-2xl border-4 border-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKosDashboard;
