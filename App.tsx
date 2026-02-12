
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, Home as HomeIcon, Menu, X, MessageSquare
} from 'lucide-react';
import { UserRole, User, Kos, Booking, Advertisement, BankAccount, ChatMessage, CompanyInfo, Transaction, RoomType, NewsItem, ShortVideo } from './types';
import { INITIAL_ADS, BANK_LIST, INITIAL_USERS, INITIAL_KOSES, INITIAL_COMPANY, INITIAL_NEWS, INITIAL_VIDEOS } from './constants';
import LandingPage from './pages/LandingPage';
import SearchResults from './pages/SearchResults';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminKosDashboard from './pages/AdminKosDashboard';
import UserDashboard from './pages/UserDashboard';
import LoginPage from './pages/LoginPage';
import KosDetail from './pages/KosDetail';
import CommentsPage from './pages/CommentsPage';

const Navbar: React.FC<{ user: User | null, logout: () => void, companyName: string }> = ({ user, logout, companyName }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 md:px-12 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/20' : 'bg-transparent'}`}>
      <Link to="/" className="flex items-center gap-3 group">
        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
          <HomeIcon className="text-white w-6 h-6" />
        </div>
        <span className={`text-2xl font-black tracking-tighter transition-colors ${scrolled ? 'text-slate-900' : 'text-white drop-shadow-md'}`}>
          TRAVEL<span className="text-blue-500">KOZT</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <Link to="/" className={`text-sm font-bold hover:text-blue-500 transition-colors ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>Beranda</Link>
        <Link to="/search" className={`text-sm font-bold hover:text-blue-500 transition-colors ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>Jelajah Kos</Link>
        <Link to="/comments" className={`text-sm font-bold hover:text-blue-500 transition-colors ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>Ulasan</Link>
        <Link to="#" className={`text-sm font-bold hover:text-blue-500 transition-colors ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>Tentang Kami</Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <Link to={user.role === UserRole.SUPER_ADMIN ? '/dashboard/super-admin' : user.role === UserRole.ADMIN_KOS ? '/dashboard/admin-kos' : '/dashboard/user'} 
                  className={`flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-full border transition-all shadow-xl ${scrolled ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-white hover:bg-slate-100'}`}>
              <LayoutDashboard size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <button onClick={logout} className={`p-3 rounded-full transition-all ${scrolled ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-white/80 hover:text-red-300 hover:bg-white/10'}`}>
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-full text-sm font-black hover:shadow-xl hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 active:scale-95 border-2 border-transparent">
            MASUK
          </Link>
        )}
      </div>
    </nav>
  );
};

// --- HELPER HOOK FOR PERSISTENCE ---
function useStickyState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to localStorage key "${key}":`, e);
    }
  }, [key, value]);

  return [value, setValue];
}

const App: React.FC = () => {
  // Use sticky state to persist data across reloads (simulating a database)
  const [currentUser, setCurrentUser] = useStickyState<User | null>('tk_current_user', null);
  const [companyInfo, setCompanyInfo] = useStickyState<CompanyInfo>('tk_company', INITIAL_COMPANY);
  const [ads, setAds] = useStickyState<Advertisement[]>('tk_ads', INITIAL_ADS);
  const [news, setNews] = useStickyState<NewsItem[]>('tk_news', INITIAL_NEWS);
  const [shortVideos, setShortVideos] = useStickyState<ShortVideo[]>('tk_videos', INITIAL_VIDEOS);
  const [koses, setKoses] = useStickyState<Kos[]>('tk_koses', INITIAL_KOSES);
  const [bankAccounts, setBankAccounts] = useStickyState<BankAccount[]>('tk_banks', BANK_LIST);
  const [messages, setMessages] = useStickyState<ChatMessage[]>('tk_messages', []);
  const [users, setUsers] = useStickyState<User[]>('tk_users', INITIAL_USERS);
  const [bookings, setBookings] = useStickyState<Booking[]>('tk_bookings', []);
  const [transactions, setTransactions] = useStickyState<Transaction[]>('tk_transactions', []);

  // Ensure current user session is valid
  useEffect(() => {
    if (currentUser) {
      const freshUser = users.find(u => u.id === currentUser.id);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(freshUser);
      }
    }
  }, [users]);

  const login = (userData: User) => {
    setCurrentUser(userData);
  };
  
  const logout = () => {
    setCurrentUser(null);
  };

  const register = (userData: User) => {
    setUsers(prev => [...prev, userData]);
    login(userData);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    const ownedKosIds = koses.filter(k => k.ownerId === userId).map(k => k.id);
    setBookings(prev => prev.filter(b => b.userId !== userId && !ownedKosIds.includes(b.kosId)));
    setKoses(prev => prev.filter(k => k.ownerId !== userId));
    if (currentUser?.id === userId) logout();
  };

  const verifyUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
  };

  const verifyKos = (kosId: string) => {
    setKoses(prev => prev.map(k => k.id === kosId ? { ...k, isVerified: true } : k));
  };

  const addAd = (ad: Advertisement) => setAds(prev => [...prev, ad]);
  const deleteAd = (adId: string) => setAds(prev => prev.filter(a => a.id !== adId));
  
  const addNews = (item: NewsItem) => setNews(prev => [item, ...prev]);
  const deleteNews = (id: string) => setNews(prev => prev.filter(n => n.id !== id));

  const addVideo = (video: ShortVideo) => setShortVideos(prev => [video, ...prev]);
  const deleteVideo = (id: string) => setShortVideos(prev => prev.filter(v => v.id !== id));

  const addBank = (bank: BankAccount) => setBankAccounts(prev => [...prev, bank]);
  const deleteBank = (accNum: string) => setBankAccounts(prev => prev.filter(b => b.accountNumber !== accNum));

  const addKos = (kos: Kos) => setKoses(prev => [...prev, kos]);
  
  const updateKos = (updatedKos: Kos) => {
    setKoses(prev => prev.map(k => k.id === updatedKos.id ? updatedKos : k));
  };
  
  const updateBookingStatus = (bookingId: string, status: 'CONFIRMED' | 'REJECTED') => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const handleDisburseFunds = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    const kos = koses.find(k => k.id === booking?.kosId);
    
    if (booking && kos && !booking.isDisbursed) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, isDisbursed: true } : b));

        const netToOwner = booking.basePrice - booking.platformFee;
        const ownerTransaction: Transaction = {
            id: `tr-out-${Date.now()}`,
            userId: kos.ownerId,
            type: 'INCOME',
            amount: netToOwner,
            category: 'Pencairan Sewa',
            description: `Pencairan Sewa ${kos.name} - ${booking.roomId} (#${booking.id})`,
            date: new Date().toISOString().split('T')[0],
            referenceId: booking.id
        };

        const feeTransaction: Transaction = {
            id: `tr-fee-${Date.now()}`,
            userId: 'sa-1',
            type: 'INCOME',
            amount: booking.platformFee,
            category: 'Service Fee',
            description: `Fee Layanan (#${booking.id})`,
            date: new Date().toISOString().split('T')[0],
            source: 'CASH_NET',
            referenceId: booking.id
        };

        const taxTransaction: Transaction = {
            id: `tr-tax-${Date.now()}`,
            userId: 'sa-1',
            type: 'INCOME',
            amount: booking.taxAmount,
            category: 'Pajak (PPN/PB1)',
            description: `Pajak Transaksi (#${booking.id})`,
            date: new Date().toISOString().split('T')[0],
            source: 'TAX_CASH',
            referenceId: booking.id
        };

        setTransactions(prev => [...prev, ownerTransaction, feeTransaction, taxTransaction]);
    }
  };

  const handleManualCheckout = (bookingId: string, reason: 'OWNER_FAULT' | 'TENANT_FAULT') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    let refundAmount = 0;
    if (reason === 'OWNER_FAULT') {
        const deduction = booking.totalPrice * 0.035;
        refundAmount = booking.totalPrice - deduction;
    } else {
        const deduction = booking.totalPrice * 0.15;
        refundAmount = booking.totalPrice - deduction;
    }

    setBookings(prev => prev.map(b => b.id === bookingId ? { 
        ...b, 
        status: 'CHECKED_OUT', 
        isCheckedOut: true,
        checkoutReason: reason,
        refundAmount: refundAmount
    } : b));
  };

  const handleEditBookingRoom = (bookingId: string, newRoomId: string, newRoomType: RoomType) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, selectedRoomUuid: newRoomId, roomId: newRoomType };
      }
      return b;
    }));
  };

  const uploadPaymentProof = (bookingId: string, proof: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, paymentProof: proof } : b));
  };

  const createBooking = (booking: Booking) => setBookings(prev => [...prev, booking]);

  const addTransaction = (t: Transaction) => setTransactions(prev => [...prev, t]);
  
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));

  const sendMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMsg]);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col pt-0 bg-slate-50 font-sans">
        <Navbar user={currentUser} logout={logout} companyName={companyInfo.name} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage ads={ads} koses={koses} companyInfo={companyInfo} news={news} videos={shortVideos} />} />
            <Route path="/search" element={<SearchResults koses={koses} />} />
            <Route path="/comments" element={<CommentsPage />} />
            <Route path="/kos/:id" element={<KosDetail bankAccounts={bankAccounts} onBooking={createBooking} currentUser={currentUser} koses={koses} />} />
            <Route path="/login" element={<LoginPage onLogin={login} onRegister={register} users={users} />} />
            
            <Route path="/dashboard/super-admin" element={
              currentUser?.role === UserRole.SUPER_ADMIN ? 
              <SuperAdminDashboard 
                user={currentUser} 
                users={users}
                koses={koses}
                ads={ads}
                news={news}
                videos={shortVideos}
                bankAccounts={bankAccounts}
                companyInfo={companyInfo}
                onUpdateCompany={setCompanyInfo}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onVerifyUser={verifyUser}
                onVerifyKos={verifyKos}
                onAddAd={addAd}
                onDeleteAd={deleteAd}
                onAddNews={addNews}
                onDeleteNews={deleteNews}
                onAddVideo={addVideo}
                onDeleteVideo={deleteVideo}
                onAddBank={addBank}
                onDeleteBank={deleteBank}
                messages={messages}
                onSendMessage={sendMessage}
                transactions={transactions}
                onAddTransaction={addTransaction}
                onDeleteTransaction={deleteTransaction}
                bookings={bookings}
                onDisburseFunds={handleDisburseFunds}
              /> : <Navigate to="/login" />
            } />
            
            <Route path="/dashboard/admin-kos" element={
              currentUser?.role === UserRole.ADMIN_KOS ? 
              <AdminKosDashboard 
                user={currentUser} 
                bookings={bookings} 
                users={users}
                koses={koses}
                onUpdateStatus={updateBookingStatus} 
                onManualCheckout={handleManualCheckout}
                onEditBookingRoom={handleEditBookingRoom}
                onAddKos={addKos} 
                onUpdateKos={updateKos}
                messages={messages}
                onSendMessage={sendMessage}
                transactions={transactions}
                onAddTransaction={addTransaction}
              /> : <Navigate to="/login" />
            } />
            
            <Route path="/dashboard/user" element={
              currentUser?.role === UserRole.USER ? 
              <UserDashboard 
                user={currentUser} 
                bookings={bookings} 
                koses={koses}
                onUpdateProfile={handleUpdateUser}
                onUploadPayment={uploadPaymentProof}
                bankAccounts={bankAccounts}
              /> : <Navigate to="/login" />
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
