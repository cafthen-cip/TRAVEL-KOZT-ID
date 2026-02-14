
import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, Clock, 
  MapPin, ShieldCheck, Edit, Upload, FileText, X, ImageIcon, Calendar, Printer, Shield, CheckCircle
} from 'lucide-react';
import { User, Booking, Kos, BankAccount } from '../types';

interface UserDashboardProps {
  user: User;
  bookings: Booking[];
  koses: Kos[];
  onUpdateProfile: (user: User) => void;
  onUploadPayment: (bookingId: string, proof: string) => void;
  bankAccounts: BankAccount[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, bookings, koses, onUpdateProfile, onUploadPayment, bankAccounts }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ ...user });
  const profileInputRef = useRef<HTMLInputElement>(null);
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const paymentProofRef = useRef<HTMLInputElement>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState<Booking | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePhoto' | 'ktpPhoto' | 'paymentProof') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (field === 'paymentProof' && selectedBookingId) {
          onUploadPayment(selectedBookingId, base64);
          setSelectedBookingId(null);
          alert('Bukti pembayaran berhasil diupload! Menunggu konfirmasi pemilik kos.');
        } else {
          setProfileForm(prev => ({ ...prev, [field]: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    onUpdateProfile(profileForm);
    setEditMode(false);
    alert('Profil berhasil diperbarui!');
  };

  const myBookings = bookings.filter(b => b.userId === user.id);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-80 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <div className="w-28 h-28 rounded-full border-4 border-blue-50 mx-auto mb-6 overflow-hidden shadow-lg relative group">
              <img src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.fullName}`} className="w-full h-full object-cover" alt="Profile" />
              <button onClick={() => profileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"><Upload size={20}/></button>
            </div>
            <input type="file" ref={profileInputRef} hidden accept="image/*" onChange={e => handleFileUpload(e, 'profilePhoto')} />
            <h2 className="font-black text-xl text-slate-800">{user.fullName}</h2>
            <p className="text-sm text-slate-400 font-bold mb-4">{user.email}</p>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isVerified ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
              <ShieldCheck size={12} /> {user.isVerified ? 'VERIFIED' : 'PENDING'}
            </div>
          </div>
          <nav className="bg-white rounded-[2rem] shadow-xl border p-2">
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-bold rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><UserIcon size={20} /> Profil Saya</button>
            <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-bold rounded-2xl transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><Clock size={20} /> Riwayat Pesanan</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-xl border space-y-12">
               <div className="flex justify-between items-center pb-6 border-b">
                 <h3 className="text-3xl font-black text-slate-900">Kelola Biodata</h3>
                 {!editMode && <button onClick={() => setEditMode(true)} className="px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-blue-100 transition-all"><Edit size={16}/> EDIT DATA</button>}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Lengkap Sesuai KTP</label>{editMode ? <input type="text" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /> : <p className="font-extrabold text-lg text-slate-800">{user.fullName}</p>}</div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nomor WhatsApp Aktif</label>{editMode ? <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /> : <p className="font-extrabold text-lg text-slate-800">{user.phone || '-'}</p>}</div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">NIK 16 Digit</label>{editMode ? <input type="text" value={profileForm.ktp} onChange={e => setProfileForm({...profileForm, ktp: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" /> : <p className="font-extrabold text-lg text-slate-800">{user.ktp || '-'}</p>}</div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Alamat Tinggal</label>{editMode ? <textarea value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold h-24" /> : <p className="font-bold text-slate-800 leading-relaxed">{user.address || '-'}</p>}</div>
                  </div>
                  <div className="space-y-6">
                    <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Scan Dokumen KTP</label>
                      <div onClick={() => editMode && ktpInputRef.current?.click()} className={`relative h-56 rounded-[2.5rem] border-4 border-dashed bg-slate-50 flex items-center justify-center overflow-hidden group transition-all ${editMode ? 'cursor-pointer hover:border-blue-300' : 'border-slate-50'}`}>
                        {profileForm.ktpPhoto ? <img src={profileForm.ktpPhoto} className="w-full h-full object-cover" alt="KTP" /> : <div className="text-center text-slate-300"><ImageIcon size={40} className="mx-auto mb-2" /><p className="text-[10px] font-black">UPLOAD SCAN KTP</p></div>}
                        {editMode && <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Upload className="text-white"/></div>}
                        <input type="file" ref={ktpInputRef} hidden accept="image/*" onChange={e => handleFileUpload(e, 'ktpPhoto')} />
                      </div>
                    </div>
                    {editMode && <div className="flex gap-4 pt-4"><button onClick={handleUpdateProfile} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition-all">SIMPAN PERUBAHAN</button><button onClick={() => { setEditMode(false); setProfileForm(user); }} className="px-8 font-bold text-slate-400">BATAL</button></div>}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <h3 className="text-3xl font-black text-slate-900 mb-8">Riwayat Transaksi & Sewa</h3>
               {myBookings.length === 0 && (
                 <div className="p-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center gap-6">
                   <Clock className="text-slate-100" size={80}/>
                   <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-sm">Belum ada riwayat pemesanan</p>
                 </div>
               )}
               {myBookings.map(booking => {
                 const kos = koses.find(k => k.id === booking.kosId);
                 return (
                   <div key={booking.id} className="bg-white p-8 rounded-[3rem] shadow-xl border flex flex-col md:flex-row gap-8 items-center group relative overflow-hidden transition-all hover:shadow-2xl">
                      <div className="w-full md:w-48 h-36 rounded-[2rem] overflow-hidden shadow-lg border-2 border-white"><img src={kos?.ownerPhoto || 'https://picsum.photos/400/300'} className="w-full h-full object-cover" alt="Kos" /></div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-black text-slate-800">{kos?.name}</h4>
                          <span className="px-4 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{booking.roomId}</span>
                        </div>
                        <p className="text-slate-400 font-bold flex items-center gap-2 text-sm"><MapPin size={16} className="text-blue-600" /> {kos?.province} • {kos?.district}</p>
                        <div className="flex flex-wrap gap-4 mt-4">
                           <div className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-black text-slate-600 flex items-center gap-2"><Calendar size={14} className="text-blue-600"/> Cekin: {booking.checkIn}</div>
                           <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' : booking.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                             {booking.status}
                           </div>
                        </div>
                      </div>
                      <div className="shrink-0 w-full md:w-auto">
                        {!booking.paymentProof && booking.status === 'PENDING' && (
                          <button onClick={() => { setSelectedBookingId(booking.id); paymentProofRef.current?.click(); }} className="w-full px-8 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all"><Upload size={18}/> UNGGAH BUKTI BAYAR</button>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <button onClick={() => setShowReceipt(booking)} className="w-full px-8 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 transition-all transform active:scale-95"><FileText size={18}/> LIHAT KWITANSI DIGITAL</button>
                        )}
                      </div>
                   </div>
                 );
               })}
               <input type="file" ref={paymentProofRef} hidden accept="image/*" onChange={e => handleFileUpload(e, 'paymentProof')} />
            </div>
          )}
        </main>
      </div>

      {/* Modern Invoice / Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 print:p-0 print:bg-white print:backdrop-blur-none">
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-500 print:shadow-none print:rounded-none my-auto">
             <div className="p-8 border-b flex justify-between items-center bg-slate-50/50 print:hidden">
               <h3 className="font-black text-xl text-slate-800 flex items-center gap-3"><FileText className="text-blue-600"/> Kwitansi Resmi Pembayaran</h3>
               <button onClick={() => setShowReceipt(null)} className="p-3 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
             </div>
             
             <div id="receipt-area" className="p-12 space-y-12 bg-white">
                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10">
                   <div>
                      <h2 className="text-4xl font-black tracking-tighter text-blue-600 italic">TRAVEL KOZT</h2>
                      <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest italic">Digital Transaction Invoice</p>
                      <div className="mt-6 text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                        PT TRAVEL KOZT INDONESIA<br/>
                        Sudirman Central Business District<br/>
                        Jakarta Selatan, 12190
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-slate-900 text-2xl uppercase">KWITANSI</p>
                      <p className="text-xs font-mono font-black text-slate-400 mt-1">#INV-{showReceipt.id.toUpperCase()}</p>
                      <div className="mt-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TANGGAL TERBIT</p>
                        <p className="font-bold text-slate-900">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">DIBAYARKAN OLEH (TENANT)</p>
                      <div className="space-y-1">
                         <p className="font-black text-slate-900 text-xl">{user.fullName}</p>
                         <p className="text-sm font-bold text-slate-500">{user.email}</p>
                         <p className="text-sm font-bold text-slate-500">{user.phone}</p>
                      </div>
                   </div>
                   <div className="space-y-4 text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">DETAIL UNIT (PROPERTY)</p>
                      <div className="space-y-1">
                         <p className="font-black text-slate-900 text-xl">{koses.find(k => k.id === showReceipt.kosId)?.name}</p>
                         <p className="text-sm font-bold text-slate-500">Tipe Kamar: {showReceipt.roomId}</p>
                         <p className="text-sm font-bold text-slate-500">Jadwal Cekin: {showReceipt.checkIn}</p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 space-y-6 shadow-inner">
                   <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                      <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Status Pembayaran</p>
                      <div className="flex items-center gap-2 text-green-600 font-black uppercase text-xs tracking-widest bg-green-100 px-4 py-1.5 rounded-full"><CheckCircle size={16}/> LUNAS / TERKONFIRMASI</div>
                   </div>
                   <div className="flex justify-between items-center">
                      <p className="text-3xl font-black text-slate-900">Total Biaya</p>
                      <p className="text-4xl font-black text-blue-600 tracking-tighter">Rp {koses.find(k => k.id === showReceipt.kosId)?.rooms.find(r => r.type === showReceipt.roomId)?.price.toLocaleString()}</p>
                   </div>
                </div>

                <div className="pt-10 flex justify-between items-end border-t border-dashed border-slate-300">
                   <div className="flex items-center gap-4">
                      <Shield size={40} className="text-blue-600 opacity-20"/>
                      <div className="text-[10px] font-black text-slate-400 uppercase leading-relaxed tracking-widest">
                        Dokumen ini sah & diterbitkan otomatis<br/>
                        oleh sistem verifikasi Travel Kozt Master.
                      </div>
                   </div>
                   <div className="w-28 h-28 bg-white p-2 border-2 border-slate-100 rounded-3xl flex items-center justify-center opacity-40 shadow-sm">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TK-VERIFY-${showReceipt.id}`} className="w-full h-full" alt="QR Verify" />
                   </div>
                </div>
             </div>

             <div className="p-10 bg-slate-50 border-t flex gap-5 print:hidden">
                <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-blue-200 hover:bg-blue-700 flex items-center justify-center gap-4 active:scale-95 transition-all text-xl"><Printer size={28}/> CETAK / SIMPAN PDF</button>
                <button onClick={() => setShowReceipt(null)} className="px-10 border-4 border-slate-200 text-slate-400 font-black py-6 rounded-[2.5rem] hover:bg-white transition-all text-xl">TUTUP</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
