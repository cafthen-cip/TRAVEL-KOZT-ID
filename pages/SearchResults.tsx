
import React, { useState, useMemo } from 'react';
import { Search, MapPin, Filter, Star, Zap, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Kos } from '../types';

interface SearchResultsProps {
  koses: Kos[];
}

const KosCard: React.FC<{ kos: Kos }> = ({ kos }) => {
  const [currentImg, setCurrentImg] = useState(0);
  
  // Combine owner photo with any room photos available
  const allPhotos = useMemo(() => {
    const photos = [kos.ownerPhoto || `https://picsum.photos/600/600?seed=${kos.id}`];
    kos.rooms.forEach(r => {
      if (r.photos && r.photos.length > 0) photos.push(...r.photos);
    });
    return photos;
  }, [kos]);

  const nextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImg((prev) => (prev + 1) % allPhotos.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImg((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  return (
    <Link to={`/kos/${kos.id}`} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group border border-slate-100 flex flex-col">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={allPhotos[currentImg]} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          alt={kos.name} 
        />
        
        {/* Carousel Controls */}
        {allPhotos.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={prevImg} className="p-2 bg-white/80 backdrop-blur rounded-full text-slate-800 hover:bg-white shadow-lg"><ChevronLeft size={16}/></button>
            <button onClick={nextImg} className="p-2 bg-white/80 backdrop-blur rounded-full text-slate-800 hover:bg-white shadow-lg"><ChevronRight size={16}/></button>
          </div>
        )}

        {/* Dots */}
        {allPhotos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-full">
            {allPhotos.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImg ? 'bg-white w-4' : 'bg-white/40'}`} />
            ))}
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{kos.category}</span>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 p-4 glass rounded-3xl flex justify-between items-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold">4.9</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-600">Terverifikasi</span>
          </div>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{kos.name}</h3>
        <p className="text-sm text-slate-500 flex items-center gap-1 mb-6">
          <MapPin size={14} /> {kos.address}
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {kos.rooms[0]?.facilities.slice(0, 4).map(f => (
            <span key={f} className="px-2 py-1 bg-slate-50 text-[10px] font-semibold text-slate-400 rounded-lg">{f}</span>
          )) || <span className="text-xs text-slate-300">Belum ada fasilitas</span>}
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-6">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Mulai Dari</p>
            <p className="text-xl font-extrabold text-slate-900">Rp {kos.rooms[0]?.price.toLocaleString() || '0'}<span className="text-xs font-normal text-slate-400">/{kos.rooms[0]?.priceType || 'bln'}</span></p>
          </div>
          <div className="bg-blue-50 p-2 rounded-xl">
            <Zap className="text-blue-600" size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
};

const SearchResults: React.FC<SearchResultsProps> = ({ koses }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hasil Pencarian Kos</h1>
          <p className="text-slate-500">Menampilkan {koses.length} kos di wilayah <span className="text-blue-600 font-bold">Seluruh Indonesia</span></p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50">
             <Filter size={18} /> Filter Lanjutan
           </button>
           <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input type="text" placeholder="Cari area lain..." className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 w-64 shadow-sm" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {koses.map(kos => (
          <KosCard key={kos.id} kos={kos} />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
