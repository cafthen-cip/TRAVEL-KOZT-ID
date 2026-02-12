
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, ShieldCheck, CheckCircle2, 
  ChevronLeft, ChevronRight, Calendar, CreditCard,
  MessageSquare, Info, Zap, Home, LayoutGrid, Users, Shield, Navigation, AlertTriangle, Map as MapIcon
} from 'lucide-react';
import { BankAccount, Booking, User, Kos, RoomType, PriceType } from '../types';

interface KosDetailProps {
  bankAccounts: BankAccount[];
  currentUser: User | null;
  onBooking: (booking: Booking) => void;
  koses: Kos[];
}

const KosDetail: React.FC<KosDetailProps> = ({ bankAccounts, currentUser, onBooking, koses }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [checkIn, setCheckIn] = useState('');

  const kos = koses.find(k => k.id === id);

  useEffect(() => {
    if (kos && kos.rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(kos.rooms[0].id);
    }
  }, [kos, selectedRoomId]);

  const selectedRoom = useMemo(() => {
    return kos?.rooms.find(r => r.id === selectedRoomId) || kos?.rooms[0];
  }, [kos, selectedRoomId]);

  const photos = useMemo(() => {
    const basePhotos = [kos?.ownerPhoto || `https://picsum.photos/1200/800?seed=${id}`];
    if (selectedRoom && selectedRoom.photos.length > 0) {
      return [...selectedRoom.photos, ...basePhotos];
    }
    return basePhotos;
  }, [kos, selectedRoom, id]);

  // Automatic Slideshow Effect
  useEffect(() => {
    if (photos.length <= 1) return;

    const interval = setInterval(() => {
      setActivePhoto((prev) => (prev + 1) % photos.length);
    }, 3000); // Ganti gambar setiap 3 detik

    return () => clearInterval(interval);
  }, [photos.length]);

  const basePrice = selectedRoom ? selectedRoom.price : 0;
  const taxAmount = basePrice * 0.11;
  const totalPrice = basePrice + taxAmount;
  
  const calculateCheckOutDate = (startDate: string, pType: PriceType) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    if (pType === PriceType.DAILY) date.setDate(date.getDate() + 1);
    else if (pType === PriceType.WEEKLY) date.setDate(date.getDate() + 7);
    else if (pType === PriceType.MONTHLY) date.setMonth(date.getMonth() + 1);
    else if (pType === PriceType.YEARLY) date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleOpenBooking = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!checkIn) {
      alert('Silakan pilih tanggal cekin');
      return;
    }
    if (selectedRoom && selectedRoom.stock <= 0) {
      alert('Maaf, tipe kamar ini sedang penuh.');
      return;
    }
    setShowAgreementModal(true);
  };

  const handleConfirmAgreement = () => {
    setShowAgreementModal(false);
    setShowBookingModal(true);
  };

  const handleFinalizeBooking = () => {
    const platformFee = basePrice * 0.035;
    
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser!.id,
      kosId: id || 'k-unknown',
      roomId: selectedRoom?.type || RoomType.STANDARD, 
      selectedRoomUuid: selectedRoom?.id,
      checkIn: checkIn,
      checkOut: calculateCheckOutDate(checkIn, selectedRoom?.priceType || PriceType.MONTHLY), 
      status: 'PENDING',
      paymentMethod: bankAccounts[0].bankName,
      basePrice: basePrice,
      taxAmount: taxAmount,
      platformFee: platformFee,
      totalPrice: totalPrice 
    };

    onBooking(newBooking);
    alert('Booking berhasil diajukan! Silakan tunggu verifikasi admin di Dashboard Anda.');
    setShowBookingModal(false);
    navigate('/dashboard/user');
  };

  const openMapsTracking = () => {
    if (kos?.lat && kos?.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${kos.lat},${kos.lng}`, '_blank');
    } else {
      alert('Koordinat lokasi belum diatur oleh pemilik kos.');
    }
  };

  if (!kos) return <div className="p-20 text-center font-bold">Kos tidak ditemukan.</div>;

  return (
    <div className="pb-20 font-sans">
      <section className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden bg-slate-900 group">
        <img src={photos[activePhoto % photos.length]} className="w-full h-full object-cover transition-all duration-700 ease-in-out" alt={kos.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        
        {/* Navigation Arrows (Optional, appears on hover) */}
        {photos.length > 1 && (
          <>
            <button 
              onClick={() => setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length)} 
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setActivePhoto((prev) => (prev + 1) % photos.length)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="absolute bottom-10 right-10 flex gap-2">
          {photos.map((_, i) => (
            <button key={i} onClick={() => setActivePhoto(i)} className={`h-2 rounded-full transition-all ${activePhoto === i ? 'bg-blue-600 w-8' : 'bg-white/40 w-2'}`} />
          ))}
        </div>
        <div className="absolute bottom-8 left-6 md:left-12 text-white max-w-2xl">
           <div className="flex gap-2 mb-4">
             <span className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{kos.category}</span>
             {kos.isVerified && <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={12} /> Terverifikasi Super Admin</span>}
           </div>
           <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">{kos.name}</h1>
           <p className="flex items-center gap-2 text-slate-300 text-lg font-medium"><MapPin size={20} className="text-blue-400" /> {kos.address}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-center justify-between p-8 bg-white rounded-[2.5rem] shadow-lg border border-slate-100">
             <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-3xl overflow-hidden bg-slate-100 flex items-center justify-center font-black text-slate-400 ring-4 ring-white shadow-md">{kos.ownerName.charAt(0)}</div>
               <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pemilik Kos</p><h4 className="text-xl font-black text-slate-900">{kos.ownerName}</h4></div>
             </div>
             <div className="flex gap-2">
                <button onClick={openMapsTracking} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"><Navigation size={16}/> Rute Lokasi</button>
             </div>
          </div>

          <section>
            <h3 className="text-2xl font-black mb-6 text-slate-900">Pilih Tipe & Durasi Sewa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {kos.rooms.map(r => (
                <button 
                  key={r.id} 
                  onClick={() => { setSelectedRoomId(r.id); setActivePhoto(0); }}
                  className={`p-6 rounded-[2rem] border-2 transition-all text-left group ${selectedRoomId === r.id ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 hover:border-blue-200'}`}
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{r.type}</p>
                  <p className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">Rp {r.price.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mb-4 font-bold">{r.priceType}</p>
                  <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {r.stock > 0 ? `${r.stock} Unit` : 'Habis'}
                  </div>
                  {selectedRoomId === r.id && <div className="mt-2 text-[10px] text-blue-600 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Dipilih</div>}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-6 text-slate-900">Fasilitas Unit {selectedRoom?.type}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedRoom?.facilities.map(f => (
                <div key={f} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><CheckCircle2 size={16}/></div>
                  <span className="text-xs font-bold text-slate-700">{f}</span>
                </div>
              ))}
              {(!selectedRoom || selectedRoom.facilities.length === 0) && <p className="text-slate-400 italic font-bold">Belum ada fasilitas terdaftar.</p>}
            </div>
          </section>

          {/* New Map Section */}
          <section>
            <h3 className="text-2xl font-black mb-6 text-slate-900 flex items-center gap-3"><MapIcon className="text-blue-600" /> Lokasi & Navigasi</h3>
            <div className="w-full h-80 rounded-[3rem] overflow-hidden shadow-lg border border-slate-200 bg-slate-100 relative">
               {kos.lat && kos.lng ? (
                 <iframe 
                   title="Kos Location"
                   width="100%" 
                   height="100%" 
                   frameBorder="0" 
                   style={{ border: 0 }}
                   src={`https://maps.google.com/maps?q=${kos.lat},${kos.lng}&z=15&output=embed`}
                   allowFullScreen
                 />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                   <MapPin size={48} className="mb-2 opacity-20" />
                   <p className="font-bold">Titik koordinat belum ditentukan oleh pemilik.</p>
                 </div>
               )}
            </div>
            <div className="mt-4 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><Navigation size={20}/></div>
                  <p className="text-sm font-bold text-slate-700">{kos.address}</p>
               </div>
               <button onClick={openMapsTracking} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">BUKA GOOGLE MAPS</button>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-black mb-6 text-slate-900">Tentang Kos Ini</h3>
            <p className="text-slate-500 leading-relaxed text-lg font-medium">{kos.description || 'Hunian eksklusif bergaya modern minimalis yang terletak di pusat kota.'}</p>
          </section>
        </div>

        <aside className="relative">
          <div className="sticky top-24 bg-white p-8 rounded-[3rem] shadow-2xl shadow-blue-100 border border-slate-100 space-y-8">
            <div className="flex justify-between items-center pb-6 border-b border-slate-50">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tipe Dipilih</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{selectedRoom?.type}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-blue-600">Rp {basePrice.toLocaleString()}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedRoom?.priceType}</p>
              </div>
            </div>
            
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold text-slate-500">
                 <span>Harga Sewa</span>
                 <span>Rp {basePrice.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-xs font-bold text-slate-500">
                 <span>Pajak (11%)</span>
                 <span>Rp {taxAmount.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-100 pt-2 mt-2">
                 <span>Total Bayar</span>
                 <span>Rp {totalPrice.toLocaleString()}</span>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Mulai Tanggal</label>
                 <div className="relative">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none text-xs font-bold uppercase" />
                 </div>
               </div>
            </div>

            <button 
              onClick={handleOpenBooking} 
              disabled={selectedRoom && selectedRoom.stock <= 0}
              className={`w-full text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-xl transform active:scale-95 ${selectedRoom && selectedRoom.stock > 0 ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              <Zap size={20} /> {selectedRoom && selectedRoom.stock > 0 ? 'AJUKAN SEWA SEKARANG' : 'STOK HABIS'}
            </button>
            
            <div className="flex items-center gap-4 p-5 bg-yellow-50 rounded-[2rem] border border-yellow-100">
               <Shield className="text-yellow-600 shrink-0" size={24} />
               <p className="text-[10px] text-yellow-800 font-bold leading-tight">Keamanan Transaksi Terjamin. TRAVEL KOZT melindungi pembayaran Anda hingga cekin berhasil.</p>
            </div>
          </div>
        </aside>
      </div>

      {showAgreementModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full text-center space-y-6 animate-in zoom-in duration-300 shadow-2xl border-4 border-yellow-400">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-500 mb-2">
                 <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Perhatian Penting!</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Dengan melanjutkan proses Check-in dan Pembayaran, Anda menyatakan setuju bahwa <span className="font-black text-slate-900">seluruh dana yang dibayarkan bersifat final dan tidak dapat dikembalikan (Non-Refundable)</span>. Kebijakan ini berlaku mutlak sesuai dengan standar layanan Travel Kozt.
              </p>
              <div className="flex gap-4 pt-4">
                 <button onClick={() => setShowAgreementModal(false)} className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50">Batal</button>
                 <button onClick={handleConfirmAgreement} className="flex-1 py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black hover:bg-yellow-500 shadow-lg shadow-yellow-200">Saya Setuju, Lanjutkan</button>
              </div>
           </div>
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center"><h3 className="text-2xl font-black">Konfirmasi Pesanan</h3><button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft size={24} /></button></div>
            <div className="p-10 space-y-8">
              <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600"><Home size={32} /></div>
                <div><h4 className="font-black text-lg text-slate-900">{selectedRoom?.type} Room</h4><p className="text-sm font-bold text-slate-500">{kos.name}</p></div>
              </div>
              <div className="space-y-4 border-b border-slate-100 pb-6">
                 <div className="flex justify-between items-center"><span className="text-slate-500 font-bold text-xs uppercase">Harga Unit</span><span className="font-black text-slate-900">Rp {basePrice.toLocaleString()}</span></div>
                 <div className="flex justify-between items-center"><span className="text-slate-500 font-bold text-xs uppercase">Pajak (Exclude 11%)</span><span className="font-black text-slate-900">Rp {taxAmount.toLocaleString()}</span></div>
                 <div className="flex justify-between items-center text-blue-600 pt-2"><span className="font-black text-sm uppercase">Total Pembayaran</span><span className="font-black text-2xl">Rp {totalPrice.toLocaleString()}</span></div>
              </div>
              <div><h4 className="font-black mb-4 flex items-center gap-2 text-slate-900"><CreditCard size={20} className="text-blue-600" /> Metode Pembayaran</h4>
                <div className="space-y-3">
                  {bankAccounts.map((bank, i) => (
                    <label key={i} className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-blue-500 transition-all group">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="bank" className="accent-blue-600 w-4 h-4" defaultChecked={i === 0} />
                        <div>
                          <p className="font-black text-sm text-slate-800">{bank.bankName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">A.N. {bank.accountHolder}</p>
                        </div>
                      </div>
                      <p className="text-xs font-mono font-black text-slate-800 bg-slate-100 px-2 py-1 rounded">{bank.accountNumber}</p>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <button onClick={handleFinalizeBooking} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 transition-all shadow-xl active:scale-95">Bayar & Ajukan Sewa</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KosDetail;
