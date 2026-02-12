
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Shield, Mail, Lock, LogIn, UserPlus, CheckSquare, FileText, X } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  users: User[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, users }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [agreed, setAgreed] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister) {
      if (role === UserRole.ADMIN_KOS && !agreed) {
        alert("Anda wajib menyetujui Perjanjian Mitra untuk mendaftar sebagai Pemilik Kos.");
        return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        role: role,
        fullName: fullName || username,
        email: `${username}@travelkozt.com`,
        isVerified: false,
        ktp: '', phone: '', address: '', ktpPhoto: '', profilePhoto: ''
      };
      onRegister(newUser);
      navigate(role === UserRole.ADMIN_KOS ? '/dashboard/admin-kos' : '/dashboard/user');
      return;
    }

    // Auth logic
    const foundUser = users.find(u => u.username === username);
    if (username === 'admcip' && password === 'Cip.123') {
      onLogin(users.find(u => u.username === 'admcip')!);
      navigate('/dashboard/super-admin');
    } else if (foundUser) {
      onLogin(foundUser);
      navigate(foundUser.role === UserRole.ADMIN_KOS ? '/dashboard/admin-kos' : '/dashboard/user');
    } else {
      alert('Username atau password salah');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 futuristic-gradient">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row relative">
        <div className="md:w-1/2 p-12 bg-blue-600 text-white flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-6">{isRegister ? 'Gabung Sekarang' : 'Selamat Datang di TRAVEL KOZT'}</h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            {isRegister 
              ? 'Daftarkan diri Anda sebagai pemilik atau penyewa kos dan nikmati kemudahan bertransaksi.' 
              : 'Masuk untuk mengelola kos Anda atau mencari hunian terbaik.'}
          </p>
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield size={24} />
            </div>
            <span className="text-sm font-medium">Platform Aman & Terpercaya</span>
          </div>
        </div>

        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-8">{isRegister ? 'Buat Akun Baru' : 'Masuk ke Akun'}</h3>
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Saya Adalah</label>
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                <button 
                  type="button"
                  onClick={() => setRole(UserRole.USER)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === UserRole.USER ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  USER
                </button>
                <button 
                  type="button"
                  onClick={() => { setRole(UserRole.ADMIN_KOS); setAgreed(false); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === UserRole.ADMIN_KOS ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  ADMIN KOS
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Username</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Password {username === 'admcip' && '(Cip.123)'}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {isRegister && role === UserRole.ADMIN_KOS && (
              <div className="flex items-start gap-3">
                <div 
                  className={`w-5 h-5 rounded border cursor-pointer mt-0.5 flex items-center justify-center ${agreed ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}
                  onClick={() => setAgreed(!agreed)}
                >
                  {agreed && <CheckSquare size={14} className="text-white" />}
                </div>
                <div className="text-xs text-slate-500 leading-tight">
                  Saya menyetujui <span className="text-blue-600 font-bold cursor-pointer hover:underline" onClick={() => setShowAgreementModal(true)}>Perjanjian Kerjasama Mitra & Syarat Ketentuan</span> yang berlaku di Travel Kozt.
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-200">
              {isRegister ? <UserPlus size={20} /> : <LogIn size={20} />}
              {isRegister ? 'Daftar Sekarang' : 'Masuk Sekarang'}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'} 
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 text-blue-600 font-bold cursor-pointer hover:underline bg-transparent border-none"
            >
              {isRegister ? 'Masuk di sini' : 'Daftar di sini'}
            </button>
          </p>
        </div>
      </div>

      {/* Agreement Modal */}
      {showAgreementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900"><FileText className="text-blue-600"/> Perjanjian Kerjasama Mitra Kos</h3>
              <button onClick={() => setShowAgreementModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 overflow-y-auto text-sm text-slate-600 space-y-6 leading-relaxed">
              <div className="text-center font-bold text-slate-900 mb-4">
                PERJANJIAN KEMITRAAN ELEKTRONIK<br/>
                ANTARA<br/>
                PT. CAFTHEN INDO PROJECT (Pemilik Platform)<br/>
                DAN<br/>
                PEMILIK PROPERTI KOS (Mitra)
              </div>
              
              <p>Dengan mendaftar sebagai Admin Kos di aplikasi Travel Kozt, Anda (selanjutnya disebut "Mitra") menyetujui seluruh syarat dan ketentuan yang ditetapkan oleh PT. CAFTHEN INDO PROJECT (selanjutnya disebut "Platform") sebagai berikut:</p>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">1. Hak dan Tanggung Jawab Mitra</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Mitra wajib memberikan data properti yang benar, akurat, dan terbaru.</li>
                  <li>Mitra bertanggung jawab penuh atas kenyamanan, kebersihan, dan keamanan fasilitas kos yang disewakan kepada konsumen.</li>
                  <li>Mitra dilarang membatalkan pesanan secara sepihak tanpa alasan yang jelas setelah status "Confirmed".</li>
                  <li>Mitra wajib mematuhi hukum dan peraturan daerah setempat terkait penyewaan properti.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">2. Biaya Layanan & Potongan</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Platform mengenakan <strong>Biaya Layanan sebesar 3,5%</strong> dari nilai transaksi bersih.</li>
                  <li>Perhitungan Biaya Layanan dilakukan setelah pemotongan Pajak (PPN/PB1) sebesar 11% (jika harga kos berstatus Pajak Include).</li>
                  <li>Rumus: <em>Pendapatan Mitra = Harga Sewa - Biaya Layanan (3,5% dari Harga Sebelum Pajak)</em>.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">3. Pencairan Dana (Disbursement)</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Dana sewa akan ditahan sementara oleh Platform (Rekening Bersama) hingga konsumen berhasil Check-in.</li>
                  <li>Pencairan dana ke rekening Mitra dilakukan dalam rentang waktu <strong>1x24 jam hingga maksimal 3x24 jam</strong> hari kerja setelah status pesanan terkonfirmasi selesai.</li>
                  <li>Biaya transfer antar bank (jika ada) ditanggung oleh Mitra.</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 font-medium text-xs">
                Dengan menekan tombol "Daftar Sekarang", Anda menyatakan telah membaca, memahami, dan menyetujui seluruh isi perjanjian elektronik ini secara sadar dan tanpa paksaan.
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end">
              <button onClick={() => { setAgreed(true); setShowAgreementModal(false); }} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">SAYA SETUJU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
