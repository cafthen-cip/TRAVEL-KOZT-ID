
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Comment } from '../types';

const CommentsPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comments');
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: newComment })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      } else {
        alert('Gagal mengirim komentar');
      }
    } catch (error) {
      console.error('Error posting comment', error);
      alert('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-6 md:px-12 pb-20">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-blue-600 transition-colors">
          <ArrowLeft size={20}/> Kembali ke Beranda
        </Link>
        
        <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <MessageSquare className="text-blue-600" /> Komentar Netizen
        </h1>

        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 mb-10">
            <form onSubmit={handleSubmit} className="flex gap-4">
            <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar anda di sini..."
                className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-blue-200 transition-all text-slate-800"
                disabled={loading}
            />
            <button 
                type="submit" 
                disabled={loading || !newComment}
                className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Send />}
            </button>
            </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-800 mb-4 px-2">Komentar Terbaru</h3>
          {refreshing ? (
            <div className="text-center py-10">
                <Loader2 className="animate-spin mx-auto text-blue-600 mb-2"/>
                <p className="text-slate-400 font-bold">Memuat komentar...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-[2rem] border border-slate-100 border-dashed">
                <p className="text-slate-400 font-bold">Belum ada komentar. Jadilah yang pertama!</p>
            </div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 animate-in slide-in-from-bottom-2 duration-500 hover:shadow-md transition-shadow">
                <p className="font-bold text-slate-800 text-lg leading-relaxed">{c.comment}</p>
                <p className="text-xs text-slate-400 font-bold mt-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    {new Date(c.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsPage;
