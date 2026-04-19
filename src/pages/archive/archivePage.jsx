  import React, { useState, useEffect } from 'react';
  import { FiFolder, FiClock, FiPlus, FiTrash2, FiMoreVertical } from 'react-icons/fi';
  import Card from '../../components/card'; 
  import Dialog from '../../components/dialog'; 
  import axios from '../../backend/axiosConfig';
  import { useNavigate } from 'react-router-dom';
  import { useToast } from '../../contexts/ToastContext';
  import { motion } from 'framer-motion';

  const ArchivePage = () => {
    const [archiveYears, setArchiveYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTa, setNewTa] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { showToast } = useToast();

    const containerVariants = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
      }
    };
  
    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };
    
    // State untuk Dialog Konfirmasi Hapus
    const [deleteConfig, setDeleteConfig] = useState({ isOpen: false, id: null, ta: '' });
    
    // State untuk Context Menu (Klik Kanan)
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, item: null });

    const handleContextMenu = (e, item) => {
      if (!isAdmin) return;
      e.preventDefault();
      setContextMenu({
        show: true,
        x: e.pageX,
        y: e.pageY,
        item: item
      });
    };

    const closeContextMenu = () => {
      setContextMenu({ ...contextMenu, show: false });
    };

    useEffect(() => {
      window.addEventListener('click', closeContextMenu);
      return () => window.removeEventListener('click', closeContextMenu);
    }, []);



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
        const response = await axios.get('/archive-years');
        if (response.data.success) {
          setArchiveYears(response.data.data);
        }
      } catch (error) {
        showToast('error', 'Koneksi Gagal', 'Gagal memuat database.');
      } finally {
        setLoading(false);
      }
    };



    // --- FUNGSI CREATE ---
    const handleCreateFolder = async (e) => {
      e.preventDefault();
      if (!newTa) return;
      setIsSubmitting(true);
      try {
        const response = await axios.post(
          '/archive-years', 
          { ta: newTa }
        );
        
        if (response.data.success) {
          setIsDialogOpen(false);
          setNewTa('');
          showToast('success', 'Berhasil', `Direktori berhasil dibuat.`);
          fetchArchives();
        }
      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          showToast('error', 'Akses Ditolak', 'Sesi berakhir atau Anda bukan Admin.');
        } else {
          showToast('error', 'Gagal', error.response?.data?.message || 'Gagal menyimpan data.');
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
        const response = await axios.delete(
          `/archive-years/${deleteConfig.id}`
        );

        if (response.data.success) {
          setDeleteConfig({ isOpen: false, id: null, ta: '' });
          showToast('success', 'Dihapus', `Arsip ${deleteConfig.ta} berhasil dihapus.`);
          fetchArchives();
        }
      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          showToast('error', 'Akses Ditolak', 'Hanya Admin yang diizinkan.');
        } else {
          showToast('error', 'Gagal Hapus', error.response?.data?.message || 'Data gagal dihapus.');
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
        { bg: "bg-emerald-600", gradient: "bg-gradient-to-br from-emerald-600 to-teal-500", light: "text-emerald-600" },
        { bg: "bg-blue-600", gradient: "bg-gradient-to-br from-blue-600 to-indigo-500", light: "text-blue-600" },
        { bg: "bg-orange-500", gradient: "bg-gradient-to-br from-orange-500 to-amber-400", light: "text-orange-500" },
        { bg: "bg-violet-600", gradient: "bg-gradient-to-br from-violet-600 to-purple-500", light: "text-violet-600" },
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

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
    {loading ? (
      <div className="col-span-full py-10 text-center font-black text-slate-300 animate-pulse tracking-widest uppercase">
        Loading Database...
      </div>
    ) : (
      archiveYears.map((item, index) => {
        const isCurrentTa = item.ta === currentTa;
        const theme = isCurrentTa 
          ? getTheme(index) 
          : { bg: "bg-slate-900", gradient: "bg-gradient-to-br from-slate-900 to-slate-800", light: "text-slate-900" };

        return (
          <motion.div variants={itemVariants} key={item.id} className="h-full">
            <Card
              animate={false}
              variant="none"
              onClick={() => {
                const slug = item.ta.replace(/\//g, '-');
                navigate(`/archive/${slug}`);
              }}
              onContextMenu={(e) => handleContextMenu(e, item)}
              className="group flex flex-col h-full bg-white border border-slate-50 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.08)] hover:shadow-[0_0_60px_rgba(0,0,0,0.15)] hover:scale-[1.02] transition-all duration-500 relative cursor-pointer"
            >
              {/* Options Menu (Three Dots) - Admin Only */}
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, item);
                  }}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95 transition-all z-20 md:opacity-0 md:group-hover:opacity-100"
                >
                  <FiMoreVertical size={20} />
                </button>
              )}

              <div className="p-6 md:p-8 flex flex-col items-center text-center flex-1">
                {/* Header: Ikon Folder (Centered) */}
                <div className="relative flex justify-center items-center w-full mb-4 md:mb-6">
                  <div className={`${theme.light} transition-transform duration-500 group-hover:scale-110`}>
                    <FiFolder size={40} className="md:size-14" />
                  </div>
                </div>

                {/* Info Text */}
                <div className="space-y-1">
                  <h3 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">
                    {item.ta}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Directory Arsip
                  </p>
                </div>
              </div>

              {/* Bottom Gradient Block */}
              <div className={`${theme.gradient} py-3.5 md:py-5 px-6 mt-auto text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${isCurrentTa ? 'bg-white animate-pulse' : 'bg-white/40'}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    {isCurrentTa ? 'Aktif' : 'Arsip'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })
    )}

    {isAdmin && (
      <motion.div variants={itemVariants} className="h-full">
        <Card
        animate={false}
        variant="none"
        onClick={() => setIsDialogOpen(true)}
        className="h-full bg-white border border-slate-50 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group hover:bg-emerald-600 transition-all duration-500 cursor-pointer shadow-[0_0_40px_rgba(0,0,0,0.06)] hover:shadow-[0_0_60px_rgba(0,0,0,0.12)] hover:scale-[1.02] flex flex-col items-center justify-center min-h-[160px] md:min-h-[280px]"
      >
        <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-emerald-600 group-hover:border-white transition-all duration-300 mb-4">
          <FiPlus className="text-xl md:text-2xl" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white text-center">
          Tambah Baru
        </p>
      </Card>
      </motion.div>
    )}
  </motion.div>

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

        {/* CUSTOM CONTEXT MENU */}
        {contextMenu.show && (
          <div 
            className="fixed z-[100] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden min-w-[180px] py-1 animation-in fade-in zoom-in duration-200"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="px-4 py-2 border-b border-slate-50">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi Arsip</p>
            </div>
            <button 
              onClick={() => handleDelete(null, contextMenu.item.id, contextMenu.item.ta)}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <FiTrash2 size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Hapus Arsip</span>
            </button>
          </div>
        )}

      </div>
    );
  };

  export default ArchivePage;