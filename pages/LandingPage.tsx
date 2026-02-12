
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, Shield, Star, Info, ChevronLeft, ChevronRight, Play, Zap, Newspaper, Video, ArrowRight, Instagram, Facebook, Twitter, Mail, Phone, Globe, PlayCircle, ShieldCheck, X } from 'lucide-react';
import { Advertisement, Kos, CompanyInfo, NewsItem, ShortVideo } from '../types';
import { PROVINCES } from '../constants';
import { Link, useNavigate } from 'react-router-dom';

interface LandingPageProps {
  ads: Advertisement[];
  koses: Kos[];
  companyInfo: CompanyInfo;
  news: NewsItem[];
  videos: ShortVideo[];
}

const FeaturedKosCard: React.FC<{ kos: Kos }> = ({ kos }) => {
  const [currentImg, setCurrentImg] = useState(0);
  
  const allPhotos = useMemo(() => {
    const photos = [kos.ownerPhoto || `https://picsum.photos/600/400?seed=${kos.id}`];
    if (kos.rooms) {
      kos.rooms.forEach(r => {
        if (r.photos && r.photos.length > 0) photos.push(...r.photos);
      });
    }
    return photos;
  }, [kos]);

  return (
    <Link to={`/kos/${kos.id}`} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 flex flex-col relative h-[420px]">
      <div className="relative h-64 overflow-hidden">
        <img src={allPhotos[currentImg]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={kos.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-white/90 backdrop-blur text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-white">{kos.category}</span>
        </div>
        <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <Star size={12} fill="currentColor" /> 4.9
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1 relative">
        <div className="absolute -top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
           <ArrowRight size={20}/>
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-1 line-clamp-1">{kos.name}</h3>
        <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mb-4 uppercase tracking-wide">
          <MapPin size={14} className="text-blue-500 shrink-0" /> {kos.district}, {kos.province}
        </p>
        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mulai Dari</p>
            <p className="text-2xl font-black text-slate-900 leading-none">Rp {kos.rooms?.[0]?.price.toLocaleString() || '-'}<span className="text-xs font-medium text-slate-400">/bln</span></p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const VideoCard: React.FC<{ video: ShortVideo, onClick: () => void }> = ({ video, onClick }) => (
  <div onClick={onClick} className="relative w-full aspect-[9/16] rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl border-4 border-white transform transition-all hover:scale-105 hover:rotate-1 hover:z-10">
    <img 
      src={video.thumbnail || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=60"} 
      className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-500" 
      alt={video.title}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
       <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white mb-4 group-hover:bg-blue-600 group-hover:scale-110 transition-all">
          <Play size={16} fill="currentColor"/>
       </div>
       <h4 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-1">{video.title}</h4>
       <p className="text-white/60 text-xs font-medium flex items-center gap-1"><Zap size={12}/> {video.views} Views</p>
    </div>
  </div>
);

const NewsCard: React.FC<{ item: NewsItem, onClick: () => void }> = ({ item, onClick }) => (
  <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all group flex flex-col h-full">
    <div className="h-48 overflow-hidden relative">
      <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
      <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-md">
        {item.category}
      </div>
    </div>
    <div className="p-8 flex flex-col flex-1">
      <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300"></div> {item.date}</p>
      <h3 className="text-xl font-black text-slate-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">{item.content}</p>
      <button onClick={onClick} className="mt-auto text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all hover:underline">Baca Selengkapnya <ArrowRight size={14}/></button>
    </div>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ ads, koses, companyInfo, news, videos }) => {
  const [searchProvince, setSearchProvince] = useState('');
  const [currentAd, setCurrentAd] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ShortVideo | null>(null);
  const navigate = useNavigate();
  const videoScrollRef = useRef<HTMLDivElement>(null);
  
  const bestByProvince = useMemo(() => {
     const groups: {[key: string]: Kos} = {};
     koses.filter(k => k.isVerified).forEach(k => {
        if (!groups[k.province]) {
           groups[k.province] = k; 
        }
     });
     return Object.values(groups).slice(0, 5); 
  }, [koses]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [ads]);

  const handleSearch = () => {
    navigate(`/search?province=${searchProvince}`);
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return '';
    // Simple YouTube ID extraction
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return url; // Return as is if not YouTube (e.g. MP4)
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {companyInfo.heroVideo ? (
             <video src={companyInfo.heroVideo} autoPlay muted loop className="w-full h-full object-cover scale-105" />
          ) : (
             <img 
               src={companyInfo.heroImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2070"} 
               className="w-full h-full object-cover" 
               alt="Hero Background" 
             />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-white"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-20">
           <div className="space-y-8 animate-in slide-in-from-left duration-1000">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-white text-xs font-bold uppercase tracking-widest shadow-lg">
                 <Star size={12} className="text-yellow-400 fill-yellow-400"/> #1 Platform Kos Indonesia
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
                 {companyInfo.heroTitle || 'TRAVEL KOZT'}<br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Living Elevated.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-200 font-medium leading-relaxed max-w-xl">
                {companyInfo.heroSubtitle || 'Temukan standar baru hunian kos dengan kenyamanan hotel berbintang dan keamanan terjamin.'}
              </p>
              
              {/* Modern Search Bar */}
              <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl max-w-lg flex items-center gap-2 pr-2">
                 <div className="pl-6 pr-2 flex items-center gap-3 border-r border-slate-100 flex-1">
                    <MapPin className="text-blue-600" size={20} />
                    <select 
                        value={searchProvince}
                        onChange={(e) => setSearchProvince(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-slate-900 font-bold text-sm appearance-none cursor-pointer"
                    >
                        <option value="">Pilih Lokasi Tujuan...</option>
                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 <button 
                    onClick={handleSearch}
                    className="bg-slate-900 hover:bg-blue-600 text-white h-12 w-12 md:w-auto md:px-8 rounded-[2rem] font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                 >
                    <Search size={18} /> <span className="hidden md:inline">Cari</span>
                 </button>
              </div>
           </div>

           {/* Hero Cards Animation */}
           <div className="hidden lg:grid grid-cols-2 gap-4 animate-in slide-in-from-right duration-1000 delay-200">
              <div className="space-y-4 mt-12">
                 <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white"><ShieldCheck size={20}/></div>
                       <div><p className="text-white font-black text-sm">Verified Owner</p><p className="text-[10px] text-white/70">Keamanan Terjamin</p></div>
                    </div>
                 </div>
                 <div className="h-64 bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl relative group cursor-pointer">
                    <img src={companyInfo.heroSideImage1 || "https://images.unsplash.com/photo-1596276122653-65ddf3be52e6?auto=format&fit=crop&q=80&w=600"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Promo 1"/>
                    <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-xl text-xs font-black">Rp 1.5jt/bln</div>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="h-64 bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl relative group cursor-pointer">
                     <img src={companyInfo.heroSideImage2 || "https://images.unsplash.com/photo-1502005229766-939cb934d60b?auto=format&fit=crop&q=80&w=600"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Promo 2"/>
                     <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full"><Star size={16} fill="white"/></div>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-3">
                       <div className="text-white text-center">
                          <p className="text-2xl font-black">50K+</p>
                          <p className="text-[8px] uppercase tracking-widest">Kamar</p>
                       </div>
                       <div className="w-px h-8 bg-white/20"></div>
                       <div className="text-white text-center">
                          <p className="text-2xl font-black">34</p>
                          <p className="text-[8px] uppercase tracking-widest">Provinsi</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Ads/Promo Section */}
      {ads.length > 0 && (
        <section className="py-10 px-6 md:px-12 -mt-20 relative z-20">
          <div className="max-w-7xl mx-auto">
            <div className="relative h-[250px] md:h-[350px] rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white bg-slate-900">
              {ads.map((ad, idx) => (
                <div 
                  key={ad.id} 
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${idx === currentAd ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20 pointer-events-none'}`}
                >
                  {ad.type === 'image' ? (
                    <img src={ad.content} className="w-full h-full object-cover opacity-60" alt={ad.title} />
                  ) : ad.type === 'video' ? (
                    <video src={ad.content} autoPlay muted loop className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="w-full h-full futuristic-gradient flex items-center justify-center p-20 opacity-90"></div>
                  )}
                  <div className="absolute inset-0 flex items-center px-10 md:px-20">
                     <div className="max-w-2xl space-y-4">
                        <span className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg inline-block mb-2">HOT PROMO</span>
                        <h3 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">{ad.title}</h3>
                        {ad.description && <p className="text-lg text-slate-300 font-medium">{ad.description}</p>}
                     </div>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-6 right-8 flex gap-2">
                 {ads.map((_, i) => (
                   <button key={i} onClick={() => setCurrentAd(i)} className={`h-1.5 rounded-full transition-all ${currentAd === i ? 'bg-white w-8' : 'bg-white/30 w-4'}`}></button>
                 ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Best by Province Section */}
      <section className="py-20 px-6 md:px-12 bg-slate-50">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Terbaik di Provinsimu</h2>
                  <p className="text-slate-500 font-medium max-w-lg">Rekomendasi kos dengan rating tertinggi dan fasilitas terlengkap di berbagai provinsi.</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-4 bg-white border border-slate-200 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"><ChevronLeft/></button>
                    <button className="p-4 bg-white border border-slate-200 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"><ChevronRight/></button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {bestByProvince.map(kos => <FeaturedKosCard key={kos.id} kos={kos} />)}
               {bestByProvince.length === 0 && <div className="col-span-4 text-center py-20 text-slate-400 font-bold">Data belum tersedia</div>}
            </div>
         </div>
      </section>

      {/* Video Shorts Section (Interactive) */}
      <section className="py-24 px-6 md:px-12 bg-slate-900 overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 space-y-4">
               <span className="text-blue-400 font-black text-xs uppercase tracking-[0.3em]">VIRTUAL TOUR</span>
               <h2 className="text-4xl md:text-5xl font-black text-white">Jelajah Tanpa Batas</h2>
               <p className="text-slate-400 max-w-xl mx-auto text-lg">Rasakan pengalaman tur properti secara nyata melalui video singkat interaktif.</p>
            </div>

            <div className="flex gap-8 overflow-x-auto pb-12 snap-x px-4 justify-center" ref={videoScrollRef}>
               {videos.map(video => (
                  <div key={video.id} className="snap-center shrink-0 w-[280px]">
                     <VideoCard video={video} onClick={() => setSelectedVideo(video)} />
                  </div>
               ))}
               {videos.length === 0 && <p className="text-white/50">Belum ada video tur.</p>}
            </div>
         </div>
      </section>

      {/* News & Blog Section */}
      <section className="py-24 px-6 md:px-12">
         <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
               <h2 className="text-4xl font-black text-slate-900">Kabar Travel Kozt</h2>
               <Link to="#" className="text-blue-600 font-black text-sm uppercase tracking-widest hover:underline">Lihat Semua</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {news.map(item => <NewsCard key={item.id} item={item} onClick={() => setSelectedNews(item)} />)}
               {news.length === 0 && <p className="text-slate-400 col-span-3 text-center">Belum ada berita terbaru.</p>}
            </div>
         </div>
      </section>

      {/* Stats / Trust Section */}
      <section className="py-20 px-6 border-t border-slate-100 bg-slate-50/50">
         <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
               <h3 className="text-4xl md:text-5xl font-black text-blue-600">1.2JT+</h3>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pengguna Aktif</p>
            </div>
            <div className="space-y-2">
               <h3 className="text-4xl md:text-5xl font-black text-slate-800">50K+</h3>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Properti Terdaftar</p>
            </div>
            <div className="space-y-2">
               <h3 className="text-4xl md:text-5xl font-black text-slate-800">34</h3>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cakupan Provinsi</p>
            </div>
            <div className="space-y-2">
               <h3 className="text-4xl md:text-5xl font-black text-slate-800">4.8</h3>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Rating Aplikasi</p>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12">
         <div className="max-w-7xl mx-auto bg-blue-600 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-10"></div>
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
               <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Siap Menemukan Hunian Impianmu?</h2>
               <p className="text-blue-100 text-xl font-medium">Bergabunglah dengan jutaan pengguna lain yang telah menemukan kenyamanan hidup bersama Travel Kozt.</p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link to="/search" className="bg-white text-blue-600 px-10 py-5 rounded-3xl font-black text-lg shadow-xl hover:scale-105 transition-transform">Cari Kos Sekarang</Link>
                  <Link to="/login" className="bg-blue-800 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-xl hover:bg-blue-900 transition-colors">Daftarkan Properti</Link>
               </div>
            </div>
         </div>
      </section>

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6 md:p-20">
           <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-full overflow-y-auto shadow-2xl animate-in zoom-in">
              <div className="relative h-64 md:h-80 w-full">
                 <img src={selectedNews.image} className="w-full h-full object-cover" alt={selectedNews.title} />
                 <button onClick={() => setSelectedNews(null)} className="absolute top-6 right-6 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-all"><X size={24}/></button>
                 <div className="absolute bottom-6 left-6 md:left-10 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">{selectedNews.category}</div>
              </div>
              <div className="p-10 md:p-14 space-y-6">
                 <div className="flex items-center gap-4 text-sm text-slate-400 font-bold mb-2">
                    <span>{selectedNews.date}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>Admin Travel Kozt</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">{selectedNews.title}</h2>
                 <div className="prose prose-lg text-slate-600 leading-relaxed font-medium">
                    {selectedNews.content}
                 </div>
                 <div className="pt-8 border-t border-slate-100 flex justify-end">
                    <button onClick={() => setSelectedNews(null)} className="px-8 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Tutup Berita</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Video Modal (Sync/Play) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6">
           <div className="relative w-full max-w-sm h-[80vh] md:max-w-4xl md:h-[80vh] bg-black rounded-[2rem] overflow-hidden shadow-2xl flex items-center justify-center border border-white/10">
              <button onClick={() => setSelectedVideo(null)} className="absolute top-6 right-6 p-4 text-white hover:text-red-500 z-50 transition-colors"><X size={32}/></button>
              
              {selectedVideo.youtubeLink ? (
                 <iframe 
                   src={getVideoEmbedUrl(selectedVideo.youtubeLink)} 
                   className="w-full h-full"
                   title={selectedVideo.title}
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 />
              ) : (
                 <video src={selectedVideo.videoUrl} controls autoPlay className="w-full h-full object-contain" />
              )}
           </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-6 md:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
              <div className="col-span-1 md:col-span-2 space-y-6">
                 <h4 className="text-3xl font-black tracking-tighter">TRAVEL <span className="text-blue-500">KOZT</span></h4>
                 <p className="text-slate-400 max-w-sm leading-relaxed">Platform hunian kos modern dengan standar keamanan dan kenyamanan tertinggi di Indonesia. Solusi pencarian tempat tinggal #1.</p>
                 <div className="flex gap-4">
                    <button className="p-3 bg-white/10 rounded-full hover:bg-blue-600 transition-colors"><Instagram size={20}/></button>
                    <button className="p-3 bg-white/10 rounded-full hover:bg-blue-600 transition-colors"><Facebook size={20}/></button>
                    <button className="p-3 bg-white/10 rounded-full hover:bg-blue-600 transition-colors"><Twitter size={20}/></button>
                 </div>
              </div>
              <div>
                 <h5 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-8">Perusahaan</h5>
                 <ul className="space-y-4 text-slate-300 font-medium">
                    <li><Link to="#" className="hover:text-blue-400 transition-colors">Tentang Kami</Link></li>
                    <li><Link to="#" className="hover:text-blue-400 transition-colors">Karir</Link></li>
                    <li><Link to="#" className="hover:text-blue-400 transition-colors">Blog & Berita</Link></li>
                    <li><Link to="#" className="hover:text-blue-400 transition-colors">Kebijakan Privasi</Link></li>
                 </ul>
              </div>
              <div>
                 <h5 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-8">Hubungi Kami</h5>
                 <ul className="space-y-4 text-slate-300 font-medium">
                    <li className="flex items-center gap-3"><Mail size={16}/> info@travelkozt.id</li>
                    <li className="flex items-center gap-3"><Phone size={16}/> 021-555-1234</li>
                    <li className="flex items-center gap-3"><MapPin size={16}/> Jakarta Selatan, ID</li>
                 </ul>
              </div>
           </div>
           <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-slate-500">
              <p>© 2025 PT Travel Kozt Indonesia. All Rights Reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                 <Link to="#">Syarat & Ketentuan</Link>
                 <Link to="#">Bantuan</Link>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
