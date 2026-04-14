import React, { useState, useEffect } from 'react';
import { FiFolder, FiArrowRight, FiClock, FiPlus, FiTrash2 } from 'react-icons/fi';
import Card from '../../components/card'; 
import Dialog from '../../components/dialog'; 
import axios from 'axios';

const ArchivePage = () => {
  const [archiveYears, setArchiveYears] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTa, setNewTa] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [statusDialog, setStatusDialog] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchArchives = async () => {
    try {
      const response = await axios.get(`${API_URL}api/archive-years`);
      if (response.data.success) {
        setArchiveYears(response.data.data);
      }
    } catch (error) {
      showStatus('error', 'Koneksi Gagal', 'Gagal memuat database.');
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, title, message) => {
    setStatusDialog({ isOpen: true, type, title, message });
    if (type === 'success') {
      setTimeout(() => setStatusDialog(prev => ({ ...prev, isOpen: false })), 2000);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newTa) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}api/archive-years`, { ta: newTa });
      if (response.data.success) {
        setIsDialogOpen(false);
        setNewTa('');
        showStatus('success', 'Berhasil', `Tahun akademik baru telah dibuat.`);
        fetchArchives();
      }
    } catch (error) {
      showStatus('error', 'Gagal', error.response?.data?.message || 'Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // FUNGSI DELETE
  const handleDelete = async (e, id, ta) => {
    e.stopPropagation(); // Mencegah trigger klik pada Card (jika ada)
    
    if (window.confirm(`Apakah Anda yakin ingin menghapus arsip ${ta}?`)) {
      try {
        const response = await axios.delete(`${API_URL}api/archive-years/${id}`);
        if (response.data.success) {
          showStatus('success', 'Dihapus', `Arsip ${ta} berhasil dihapus.`);
          fetchArchives();
        }
      } catch (error) {
        showStatus('error', 'Gagal Hapus', 'Data gagal dihapus dari server.');
      }
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const getTheme = (index) => {
    const themes = [
      { bg: "bg-emerald-600", light: "text-emerald-600", hover: "hover:bg-emerald-700" },
      { bg: "bg-blue-600", light: "text-blue-600", hover: "hover:bg-blue-700" },
      { bg: "bg-orange-500", light: "text-orange-500", hover: "hover:bg-orange-600" },
      { bg: "bg-violet-600", light: "text-violet-600", hover: "hover:bg-violet-700" },
    ];
    return themes[index % themes.length];
  };

  return (
    <div className="space-y-8 select-none">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Arsip <span className="text-emerald-600">Dokumen</span>
        </h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Directory Library</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-10 text-center font-black text-slate-300 animate-pulse tracking-widest uppercase">Loading Database...</div>
        ) : (
          archiveYears.map((item, index) => {
            const theme = getTheme(index);
            return (
              <Card key={item.id} variant="none" className="group flex flex-col min-h-[260px] bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                
                {/* TOMBOL HAPUS (POJOK KANAN ATAS) */}
                <button 
                  onClick={(e) => handleDelete(e, item.id, item.ta)}
                  className="absolute top-5 right-5 p-2 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all duration-300 z-20 opacity-0 group-hover:opacity-100"
                >
                  <FiTrash2 size={18} />
                </button>

                <div className="p-7 flex-1">
                  <div className={`p-3 w-fit rounded-2xl bg-slate-50 ${theme.light}`}>
                    <FiFolder size={26} />
                  </div>
                  <div className="mt-5">
                    <h3 className="text-2xl font-black text-slate-800">TA {item.ta}</h3>
                  </div>
                </div>

                <div className={`p-5 ${theme.bg} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/5 opacity-50" />
                  <div className="relative z-10 flex items-center justify-between text-white">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase opacity-60">Update Terakhir</span>
                      <div className="flex items-center gap-2 mt-1">
                        <FiClock size={11} className="opacity-70" />
                        <span className="text-[11px] font-bold tracking-tight">{new Date().toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                      <FiArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}

        {/* Card Tambah */}
        <Card 
          variant="none" 
          onClick={() => setIsDialogOpen(true)}
          className="p-7 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/10 min-h-[260px] group hover:bg-white hover:border-emerald-500 transition-all duration-500 rounded-[2rem] cursor-pointer"
        >
          <div className="relative w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300">
            <FiPlus size={28} />
          </div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-emerald-600 transition-colors">Tambah Arsip</p>
        </Card>
      </div>

      {/* DIALOG INPUT */}
      <Dialog isOpen={isDialogOpen} onClose={() => !isSubmitting && setIsDialogOpen(false)} title="Tambah Arsip" size="md">
        <form onSubmit={handleCreateFolder} className="w-full mt-2">
          <input 
            autoFocus
            type="text" 
            placeholder="Contoh: 2026/2027"
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 text-center"
            value={newTa}
            onChange={(e) => setNewTa(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button type="button" onClick={() => setIsDialogOpen(false)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200">Batal</button>
            <button type="submit" disabled={isSubmitting} className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 disabled:opacity-50">{isSubmitting ? 'Proses...' : 'Buat Folder'}</button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG STATUS */}
      <Dialog isOpen={statusDialog.isOpen} onClose={() => setStatusDialog(prev => ({ ...prev, isOpen: false }))} type={statusDialog.type} title={statusDialog.title}>
        {statusDialog.message}
      </Dialog>
    </div>
  );
};

export default ArchivePage;