
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, Home as HomeIcon, Loader2
} from 'lucide-react';
import { UserRole, User, Kos, Booking, Advertisement, BankAccount, ChatMessage, CompanyInfo, Transaction, RoomType, NewsItem, ShortVideo, Comment } from './types';
import { INITIAL_ADS, BANK_LIST, INITIAL_USERS, INITIAL_KOSES, INITIAL_COMPANY, INITIAL_NEWS, INITIAL_VIDEOS } from './constants';
import { supabase } from './lib/supabaseClient';
import LandingPage from './pages/LandingPage';
import SearchResults from './pages/SearchResults';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminKosDashboard from './pages/AdminKosDashboard';
import UserDashboard from './pages/UserDashboard';
import LoginPage from './pages/LoginPage';
import KosDetail from './pages/KosDetail';
import CommentsPage from './pages/CommentsPage';

const Navbar: React.FC<{ user: User | null, logout: () => void, companyName: string }> = ({ user, logout }) => {
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

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [koses, setKoses] = useState<Kos[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [shortVideos, setShortVideos] = useState<ShortVideo[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(INITIAL_COMPANY);

  // --- INITIAL DATA LOADING FROM SUPABASE ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Parallel fetching for performance
        const [
          { data: usersData },
          { data: kosesData },
          { data: adsData },
          { data: newsData },
          { data: videosData },
          { data: banksData },
          { data: bookingsData },
          { data: transactionsData },
          { data: messagesData },
          { data: commentsData },
          { data: companyData }
        ] = await Promise.all([
          supabase.from('users').select('*'),
          // Fetch koses AND their related rooms
          supabase.from('koses').select('*, rooms(*)'),
          supabase.from('advertisements').select('*'),
          supabase.from('news').select('*'),
          supabase.from('videos').select('*'),
          supabase.from('bank_accounts').select('*'),
          supabase.from('bookings').select('*'),
          supabase.from('transactions').select('*'),
          supabase.from('chat_messages').select('*'),
          supabase.from('comments').select('*'),
          supabase.from('company_info').select('*').single()
        ]);

        if (usersData && usersData.length > 0) setUsers(usersData); else setUsers(INITIAL_USERS);
        
        // Transform Supabase response to match app types if necessary (koses with rooms)
        if (kosesData && kosesData.length > 0) {
            setKoses(kosesData as Kos[]);
        } else {
            setKoses(INITIAL_KOSES);
        }

        if (adsData && adsData.length > 0) setAds(adsData); else setAds(INITIAL_ADS);
        if (newsData && newsData.length > 0) setNews(newsData); else setNews(INITIAL_NEWS);
        if (videosData && videosData.length > 0) setShortVideos(videosData); else setShortVideos(INITIAL_VIDEOS);
        if (banksData && banksData.length > 0) setBankAccounts(banksData); else setBankAccounts(BANK_LIST);
        if (bookingsData) setBookings(bookingsData);
        if (transactionsData) setTransactions(transactionsData);
        if (messagesData) setMessages(messagesData);
        if (commentsData) setComments(commentsData);
        if (companyData) setCompanyInfo(companyData);

        // Check LocalStorage for session
        const savedUser = localStorage.getItem('tk_session_user');
        if (savedUser) {
           const parsedUser = JSON.parse(savedUser);
           const freshUser = (usersData || INITIAL_USERS).find((u: User) => u.id === parsedUser.id);
           if (freshUser) setCurrentUser(freshUser);
        }

      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
        // Fallback to initial data if DB fails or is empty
        setUsers(INITIAL_USERS);
        setKoses(INITIAL_KOSES);
        setAds(INITIAL_ADS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const login = (userData: User) => {
    setCurrentUser(userData);
    localStorage.setItem('tk_session_user', JSON.stringify(userData));
  };
  
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tk_session_user');
  };

  // --- CRUD ACTIONS (DATABASE SYNC) ---

  const register = async (userData: User) => {
    const { error } = await supabase.from('users').insert(userData);
    if (!error) {
       setUsers(prev => [...prev, userData]);
       login(userData);
    } else {
       console.error("Register error:", error);
       alert("Gagal mendaftar. Silakan coba lagi.");
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    const { error } = await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (currentUser?.id === updatedUser.id) {
         setCurrentUser(updatedUser);
         localStorage.setItem('tk_session_user', JSON.stringify(updatedUser));
      }
    } else {
        console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await supabase.from('users').delete().eq('id', userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser?.id === userId) logout();
  };

  const verifyUser = async (userId: string) => {
    await supabase.from('users').update({ isVerified: true }).eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
  };

  const verifyKos = async (kosId: string) => {
    await supabase.from('koses').update({ isVerified: true }).eq('id', kosId);
    setKoses(prev => prev.map(k => k.id === kosId ? { ...k, isVerified: true } : k));
  };

  const addAd = async (ad: Advertisement) => {
    await supabase.from('advertisements').insert(ad);
    setAds(prev => [...prev, ad]);
  };
  const deleteAd = async (adId: string) => {
    await supabase.from('advertisements').delete().eq('id', adId);
    setAds(prev => prev.filter(a => a.id !== adId));
  };
  
  const addNews = async (item: NewsItem) => {
    await supabase.from('news').insert(item);
    setNews(prev => [item, ...prev]);
  };
  const deleteNews = async (id: string) => {
    await supabase.from('news').delete().eq('id', id);
    setNews(prev => prev.filter(n => n.id !== id));
  };

  const addVideo = async (video: ShortVideo) => {
    await supabase.from('videos').insert(video);
    setShortVideos(prev => [video, ...prev]);
  };
  const deleteVideo = async (id: string) => {
    await supabase.from('videos').delete().eq('id', id);
    setShortVideos(prev => prev.filter(v => v.id !== id));
  };

  const addBank = async (bank: BankAccount) => {
    await supabase.from('bank_accounts').insert(bank);
    setBankAccounts(prev => [...prev, bank]);
  };
  const deleteBank = async (accNum: string) => {
    await supabase.from('bank_accounts').delete().eq('accountNumber', accNum);
    setBankAccounts(prev => prev.filter(b => b.accountNumber !== accNum));
  };

  const addKos = async (kos: Kos) => {
    // 1. Separate Kos data and Rooms data
    const { rooms, ...kosData } = kos;
    
    // 2. Insert Kos first
    const { error: kosError } = await supabase.from('koses').insert(kosData);
    
    if (kosError) {
        console.error("Error adding kos:", kosError);
        return;
    }

    // 3. Insert Rooms (add kosId to each room)
    if (rooms && rooms.length > 0) {
        const roomsPayload = rooms.map(r => ({ ...r, kosId: kos.id }));
        const { error: roomError } = await supabase.from('rooms').insert(roomsPayload);
        if (roomError) console.error("Error adding rooms:", roomError);
    }
    
    // 4. Update Local State
    setKoses(prev => [...prev, kos]);
  };
  
  const updateKos = async (updatedKos: Kos) => {
    const { rooms, ...kosData } = updatedKos;
    
    // Update Kos details
    await supabase.from('koses').update(kosData).eq('id', updatedKos.id);
    
    // Simplistic approach for rooms: Delete all existing rooms for this Kos and re-insert
    // This handles updates, additions, and deletions of rooms in one go
    await supabase.from('rooms').delete().eq('kosId', updatedKos.id);
    
    if (rooms && rooms.length > 0) {
         const roomsPayload = rooms.map(r => ({ ...r, kosId: updatedKos.id }));
         await supabase.from('rooms').insert(roomsPayload);
    }

    setKoses(prev => prev.map(k => k.id === updatedKos.id ? updatedKos : k));
  };
  
  const updateBookingStatus = async (bookingId: string, status: 'CONFIRMED' | 'REJECTED') => {
    await supabase.from('bookings').update({ status }).eq('id', bookingId);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const handleDisburseFunds = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    const kos = koses.find(k => k.id === booking?.kosId);
    
    if (booking && kos && !booking.isDisbursed) {
        await supabase.from('bookings').update({ isDisbursed: true }).eq('id', bookingId);
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

        // Batch insert transactions
        await supabase.from('transactions').insert([ownerTransaction, feeTransaction, taxTransaction]);
        setTransactions(prev => [...prev, ownerTransaction, feeTransaction, taxTransaction]);
    }
  };

  const handleManualCheckout = async (bookingId: string, reason: 'OWNER_FAULT' | 'TENANT_FAULT') => {
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

    const updates: Partial<Booking> = { 
        status: 'CHECKED_OUT', 
        isCheckedOut: true,
        checkoutReason: reason,
        refundAmount: refundAmount
    };
    await supabase.from('bookings').update(updates).eq('id', bookingId);

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } as Booking : b));
  };

  const handleEditBookingRoom = async (bookingId: string, newRoomId: string, newRoomType: RoomType) => {
    await supabase.from('bookings').update({ selectedRoomUuid: newRoomId, roomId: newRoomType }).eq('id', bookingId);
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, selectedRoomUuid: newRoomId, roomId: newRoomType };
      }
      return b;
    }));
  };

  const uploadPaymentProof = async (bookingId: string, proof: string) => {
    await supabase.from('bookings').update({ paymentProof: proof }).eq('id', bookingId);
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, paymentProof: proof } : b));
  };

  const createBooking = async (booking: Booking) => {
    await supabase.from('bookings').insert(booking);
    setBookings(prev => [...prev, booking]);
  };

  const addTransaction = async (t: Transaction) => {
    await supabase.from('transactions').insert(t);
    setTransactions(prev => [...prev, t]);
  };
  
  const deleteTransaction = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const sendMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    };
    await supabase.from('chat_messages').insert(newMsg);
    setMessages(prev => [...prev, newMsg]);
  };

  // --- COMMENTS LOGIC ---
  const addComment = async (text: string) => {
    const newComment: Comment = {
      id: Date.now(),
      comment: text,
      created_at: new Date().toISOString()
    };
    await supabase.from('comments').insert(newComment);
    setComments(prev => [newComment, ...prev]);
  };

  const deleteComment = async (id: number) => {
    await supabase.from('comments').delete().eq('id', id);
    setComments(prev => prev.filter(c => c.id !== id));
  };
  
  const handleUpdateCompany = async (info: CompanyInfo) => {
      // Assuming single row with ID 1 or update all
      await supabase.from('company_info').upsert(info);
      setCompanyInfo(info);
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4"/>
                  <p className="text-slate-500 font-bold">Menghubungkan ke Database...</p>
              </div>
          </div>
      );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col pt-0 bg-slate-50 font-sans">
        <Navbar user={currentUser} logout={logout} companyName={companyInfo.name} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage ads={ads} koses={koses} companyInfo={companyInfo} news={news} videos={shortVideos} />} />
            <Route path="/search" element={<SearchResults koses={koses} />} />
            <Route path="/comments" element={<CommentsPage comments={comments} onAddComment={addComment} />} />
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
                onUpdateCompany={handleUpdateCompany}
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
                comments={comments}
                onDeleteComment={deleteComment}
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
                onUpdateUser={handleUpdateUser}
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
