  import React, { useState, useEffect } from 'react';
  import { FiFolder, FiClock, FiPlus, FiTrash2 } from 'react-icons/fi';
  import Card from '../../components/card'; 
  import Dialog from '../../components/dialog'; 
  import axios from 'axios';
  import { useNavigate } from 'react-router-dom';

  const ArchivePage = () => {
    const [archiveYears, setArchiveYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTa, setNewTa] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State untuk Dialog Status (Success/Error)
    const [statusDialog, setStatusDialog] = useState({ isOpen: false, type: 'info', title: '', message: '' });
    
    // State untuk Dialog Konfirmasi Hapus
    const [deleteConfig, setDeleteConfig] = useState({ isOpen: false, id: null, ta: '' });

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    // --- AUTH LOGIC ---
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const isAdmin = userInfo?.role === 'admin';

    // --- LOGIKA TA AKTIF ---
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentTa = currentMonth > 7 
      ? `${currentYear}/${currentYear + 1}` 
      : `${currentYear - 1}/${currentYear}`;

  const fetchArchives = async () => {
      try {
        // GET biasanya tidak butuh credentials jika Mas mensetnya public di backend
        const response = await axios.get(`${API_URL}/archive-years`);
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

    // --- FUNGSI CREATE ---
    const handleCreateFolder = async (e) => {
      e.preventDefault();
      if (!newTa) return;
      setIsSubmitting(true);
      try {
        // TAMBAHKAN withCredentials: true
        const response = await axios.post(
          `${API_URL}/archive-years`, 
          { ta: newTa },
          { withCredentials: true } 
        );
        
        if (response.data.success) {
          setIsDialogOpen(false);
          setNewTa('');
          showStatus('success', 'Berhasil', `Direktori berhasil dibuat.`);
          fetchArchives();
        }
      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          showStatus('error', 'Akses Ditolak', 'Sesi berakhir atau Anda bukan Admin.');
        } else {
          showStatus('error', 'Gagal', error.response?.data?.message || 'Gagal menyimpan data.');
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    // --- FUNGSI DELETE ---
    const handleDelete = async (e, id, ta) => {
      // Tahap 1: Jika dipicu tombol Card (Buka Dialog)
      if (e) {
        e.stopPropagation();
        setDeleteConfig({ isOpen: true, id, ta });
        return;
      }

      // Tahap 2: Eksekusi Hapus (Dari dalam Modal)
      setIsSubmitting(true);
      try {
        // TAMBAHKAN withCredentials: true
        const response = await axios.delete(
          `${API_URL}/archive-years/${deleteConfig.id}`, 
          { withCredentials: true }
        );

        if (response.data.success) {
          setDeleteConfig({ isOpen: false, id: null, ta: '' });
          showStatus('success', 'Dihapus', `Arsip ${deleteConfig.ta} berhasil dihapus.`);
          fetchArchives();
        }
      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          showStatus('error', 'Akses Ditolak', 'Hanya Admin yang diizinkan.');
        } else {
          showStatus('error', 'Gagal Hapus', error.response?.data?.message || 'Data gagal dihapus.');
        }
        setDeleteConfig(prev => ({ ...prev, isOpen: false }));
      } finally {
        setIsSubmitting(false);
      }
    };  
    useEffect(() => {
      fetchArchives();
    }, []);

    const getTheme = (index) => {
      const themes = [
        { bg: "bg-emerald-600", light: "text-emerald-600" },
        { bg: "bg-blue-600", light: "text-blue-600" },
        { bg: "bg-orange-500", light: "text-orange-500" },
        { bg: "bg-violet-600", light: "text-violet-600" },
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
    {loading ? (
      <div className="col-span-full py-10 text-center font-black text-slate-300 animate-pulse tracking-widest uppercase">
        Loading Database...
      </div>
    ) : (
      archiveYears.map((item, index) => {
        const theme = getTheme(index);
        const isCurrentTa = item.ta === currentTa;

        return (
          <Card
    key={item.id}
    variant="none"
    onClick={() => {
      const slug = item.ta.replace(/\//g, '-');
      navigate(`/archive/${slug}`);
    }}
    className="group flex flex-col min-h-[200px] md:min-h-[260px] bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm shadow-slate-400/40 hover:shadow-xl hover:shadow-slate-300/30 transition-all duration-500 relative cursor-pointer"
  >
    <div className="p-4 md:p-7 flex-1 relative z-10">
      {/* HEADER CARD: IKON FOLDER & TOMBOL HAPUS SEJAJAR */}
      <div className="flex justify-between items-start">
        <div className={`p-2.5 md:p-3 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-slate-50 shadow-inner ${theme.light}`}>
          <FiFolder size={24} className="md:size-7" />
        </div>

        {isAdmin && (
    <button
      onClick={(e) => handleDelete(e, item.id, item.ta)}
      className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl 
                bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 
                transition-all duration-300 shadow-sm border border-slate-200 
                opacity-100 md:opacity-40 md:group-hover:opacity-100" // Perubahan di sini
    >
      <FiTrash2 size={18} className="md:size-5" />
    </button>
  )}
      </div>

      {/* INFO TEXT */}
      <div className="mt-4 md:mt-6">
        <h3 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight leading-tight">
          TA {item.ta}
        </h3>
        <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
          Daftar Arsip
        </p>
      </div>
    </div>

    <div className={`p-3 md:p-6 ${theme.bg} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-black/5 opacity-50" />
      <div className="relative z-10 flex items-center justify-between text-white">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-white/50">
    {/* Indikator Dot sesuai status */}
    <div className="relative flex items-center justify-center">
      {isCurrentTa && (
        <span className={`absolute inline-flex h-3 w-3 rounded-full ${theme.light.replace('text', 'bg')} opacity-20 animate-ping`}></span>
      )}
      <div className={`h-1.5 w-1.5 rounded-full ${isCurrentTa ? theme.light.replace('text', 'bg') : 'bg-slate-300'}`}></div>
    </div>
    
    <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrentTa ? theme.light : 'text-slate-400'}`}>
      {isCurrentTa ? 'Aktif' : 'Arsip'}
    </span>
  </div>
      </div>
    </div>
  </Card>
        );
      })
    )}

    {isAdmin && (
      <Card
        variant="none"
        onClick={() => setIsDialogOpen(true)}
        className="p-4 md:p-7 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/10 min-h-[200px] md:min-h-[260px] group hover:bg-white hover:border-emerald-500 transition-all duration-500 rounded-[1.5rem] md:rounded-[2rem] cursor-pointer"
      >
        <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300">
          <FiPlus className="text-xl md:text-2xl" />
        </div>
        <p className="mt-3 md:mt-4 text-[8px] md:text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-emerald-600 text-center">
          Tambah Baru
        </p>
      </Card>
    )}
  </div>

        {/* DIALOG INPUT ARSIP BARU */}
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

        {/* DIALOG KONFIRMASI HAPUS (MENGGUNAKAN KOMPONEN DIALOG YANG SAMA) */}
        <Dialog 
          isOpen={deleteConfig.isOpen} 
          onClose={() => !isSubmitting && setDeleteConfig({ ...deleteConfig, isOpen: false })} 
          title="Hapus Arsip"
        >
          <div className="text-center py-2">
            <p className="text-slate-600 font-medium">
              Hapus arsip <span className="font-black text-slate-900">TA {deleteConfig.ta}</span>?
            </p>
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-2">Tindakan ini permanen!</p>
            
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button 
                type="button" 
                onClick={() => setDeleteConfig({ ...deleteConfig, isOpen: false })} 
                className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200"
              >
                Batal
              </button>
              <button 
                onClick={() => handleDelete()} 
                disabled={isSubmitting} 
                className="py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Proses...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </Dialog>

        {/* DIALOG STATUS (SUCCESS/ERROR) */}
        <Dialog 
          isOpen={statusDialog.isOpen} 
          onClose={() => setStatusDialog(prev => ({ ...prev, isOpen: false }))} 
          type={statusDialog.type} 
          title={statusDialog.title}
        >
          <div className="text-center font-bold text-slate-600">
            {statusDialog.message}
          </div>
        </Dialog>
      </div>
    );
  };

  export default ArchivePage;