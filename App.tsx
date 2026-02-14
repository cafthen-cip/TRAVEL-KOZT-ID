import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  User, Kos, Advertisement, NewsItem, ShortVideo, 
  CompanyInfo, Booking, BankAccount, ChatMessage, 
  Transaction, Comment, UserRole, RoomType
} from './types';
import { 
  INITIAL_USERS, INITIAL_KOSES, INITIAL_ADS, 
  INITIAL_NEWS, INITIAL_VIDEOS, INITIAL_COMPANY, BANK_LIST 
} from './constants';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminKosDashboard from './pages/AdminKosDashboard';
import UserDashboard from './pages/UserDashboard';
import SearchResults from './pages/SearchResults';
import KosDetail from './pages/KosDetail';
import CommentsPage from './pages/CommentsPage';

const App: React.FC = () => {
  // State Initialization
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [koses, setKoses] = useState<Kos[]>(INITIAL_KOSES);
  const [ads, setAds] = useState<Advertisement[]>(INITIAL_ADS);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [videos, setVideos] = useState<ShortVideo[]>(INITIAL_VIDEOS);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(INITIAL_COMPANY);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(BANK_LIST);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Auth Handlers
  const handleLogin = (user: User) => setCurrentUser(user);
  const handleRegister = (newUser: User) => setUsers([...users, newUser]);
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
  };
  const handleDeleteUser = (userId: string) => setUsers(users.filter(u => u.id !== userId));

  // Data Handlers
  const handleAddKos = (newKos: Kos) => setKoses([...koses, newKos]);
  const handleUpdateKos = (updatedKos: Kos) => setKoses(koses.map(k => k.id === updatedKos.id ? updatedKos : k));
  const handleVerifyKos = (kosId: string) => {
    setKoses(koses.map(k => k.id === kosId ? { ...k, isVerified: true } : k));
  };

  const handleBooking = (newBooking: Booking) => setBookings([...bookings, newBooking]);
  const updateBookingStatus = (bookingId: string, status: 'CONFIRMED' | 'REJECTED') => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
  };
  const handleUploadPayment = (bookingId: string, proof: string) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, paymentProof: proof } : b));
  };
  const handleManualCheckout = (bookingId: string, reason: string) => {
     setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'CHECKED_OUT', checkoutReason: reason, isCheckedOut: true } : b));
  };
  const handleEditBookingRoom = (bookingId: string, newRoomId: string, newRoomType: RoomType) => {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, roomId: newRoomType, selectedRoomUuid: newRoomId } : b));
  };
  const handleDisburseFunds = (bookingId: string) => {
     setBookings(bookings.map(b => b.id === bookingId ? { ...b, isDisbursed: true } : b));
  };

  const handleSendMessage = (msg: { senderId: string, receiverId: string, text: string, image?: string, isVoice?: boolean }) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      text: msg.text,
      image: msg.image,
      isVoice: msg.isVoice
    };
    setMessages([...messages, newMsg]);
  };

  const handleAddTransaction = (t: Transaction) => setTransactions([...transactions, t]);
  const handleDeleteTransaction = (id: string) => setTransactions(transactions.filter(t => t.id !== id));

  // Super Admin Helpers
  const handleUpdateCompany = (info: CompanyInfo) => setCompanyInfo(info);
  const handleAddAd = (ad: Advertisement) => setAds([...ads, ad]);
  const handleDeleteAd = (id: string) => setAds(ads.filter(a => a.id !== id));
  const handleAddNews = (item: NewsItem) => setNews([...news, item]);
  const handleDeleteNews = (id: string) => setNews(news.filter(n => n.id !== id));
  const handleAddVideo = (video: ShortVideo) => setVideos([...videos, video]);
  const handleDeleteVideo = (id: string) => setVideos(videos.filter(v => v.id !== id));
  const handleAddBank = (bank: BankAccount) => setBankAccounts([...bankAccounts, bank]);
  const handleDeleteBank = (accNum: string) => setBankAccounts(bankAccounts.filter(b => b.accountNumber !== accNum));
  
  const handleAddComment = (text: string) => {
    const newComment: Comment = {
      id: Date.now(),
      comment: text,
      created_at: new Date().toISOString()
    };
    setComments([newComment, ...comments]);
  };
  const handleDeleteComment = (id: number) => setComments(comments.filter(c => c.id !== id));

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage ads={ads} koses={koses} companyInfo={companyInfo} news={news} videos={videos} />} />
        <Route path="/search" element={<SearchResults koses={koses} />} />
        <Route path="/kos/:id" element={<KosDetail koses={koses} currentUser={currentUser} onBooking={handleBooking} bankAccounts={bankAccounts} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} onRegister={handleRegister} users={users} />} />
        <Route path="/comments" element={<CommentsPage comments={comments} onAddComment={handleAddComment} />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard/super-admin" element={
          currentUser?.role === UserRole.SUPER_ADMIN ? 
          <SuperAdminDashboard 
            user={currentUser} users={users} koses={koses} ads={ads} news={news} videos={videos}
            bankAccounts={bankAccounts} companyInfo={companyInfo} messages={messages} transactions={transactions} bookings={bookings} comments={comments}
            onUpdateCompany={handleUpdateCompany} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser}
            onVerifyUser={(id) => handleUpdateUser({...users.find(u=>u.id===id)!, isVerified: true})}
            onVerifyKos={handleVerifyKos} onUpdateKos={handleUpdateKos}
            onAddAd={handleAddAd} onDeleteAd={handleDeleteAd}
            onAddNews={handleAddNews} onDeleteNews={handleDeleteNews}
            onAddVideo={handleAddVideo} onDeleteVideo={handleDeleteVideo}
            onAddBank={handleAddBank} onDeleteBank={handleDeleteBank}
            onSendMessage={handleSendMessage}
            onAddTransaction={handleAddTransaction} onDeleteTransaction={handleDeleteTransaction}
            onDisburseFunds={handleDisburseFunds} onDeleteComment={handleDeleteComment}
          /> : <Navigate to="/login" />
        } />

        <Route path="/dashboard/admin-kos" element={
          currentUser?.role === UserRole.ADMIN_KOS ? 
          <AdminKosDashboard 
            user={currentUser} bookings={bookings} users={users} koses={koses} messages={messages} transactions={transactions}
            onUpdateStatus={updateBookingStatus} onManualCheckout={(id, reason) => handleManualCheckout(id, reason)} onEditBookingRoom={handleEditBookingRoom}
            onAddKos={handleAddKos} onUpdateKos={handleUpdateKos} onSendMessage={handleSendMessage}
            onAddTransaction={handleAddTransaction} onUpdateUser={handleUpdateUser}
          /> : <Navigate to="/login" />
        } />

        <Route path="/dashboard/user" element={
          currentUser?.role === UserRole.USER ? 
          <UserDashboard 
            user={currentUser} bookings={bookings} koses={koses} bankAccounts={bankAccounts}
            onUpdateProfile={handleUpdateUser} onUploadPayment={handleUploadPayment}
          /> : <Navigate to="/login" />
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;