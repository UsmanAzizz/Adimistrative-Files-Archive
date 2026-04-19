import React, { useState, useEffect } from 'react';
import { FiFileText, FiUploadCloud, FiUsers, FiClock, FiChevronRight, FiFolder } from 'react-icons/fi';
import axios from '../backend/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Dashboard() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const userName = userInfo?.name || 'User';

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalArsip: 0,
    uploadBulanIni: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/dashboard/stats');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Animasi Staggered
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: "spring", stiffness: 300, damping: 24 } 
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] font-sans select-none overflow-hidden pb-20 md:pb-10">
      


      {/* MAIN CONTENT */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-4 md:pt-8 space-y-4 md:space-y-6"
      >
        {/* HEADER */}
        <motion.header variants={itemVariants} className="mb-6 md:mb-10 px-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter">
            Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 uppercase">{userName}</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-bold tracking-widest uppercase mt-2 opacity-80">
            Dipo Administrative Files Archive
          </p>
        </motion.header>

        {/* BENTO GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-4 md:gap-6">
          
          {/* 1. HERO CARD (Besar - Span 8 di Desktop, Full di Mobile) */}
          <motion.div 
            variants={itemVariants}
            onClick={() => navigate('/archives')}
            className="col-span-2 md:col-span-4 lg:col-span-8 row-span-2 relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 md:p-10 text-white shadow-2xl shadow-emerald-600/20 overflow-hidden group cursor-pointer"
          >

            <FiFolder className="absolute -bottom-10 -right-10 text-[12rem] text-white/10 -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 ease-out" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Sistem Aktif
                </div>
                <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight max-w-md">
                  Mulai unggah & kelola arsip baru hari ini.
                </h2>
                <p className="text-emerald-50 text-xs md:text-sm mt-3 opacity-90 leading-relaxed max-w-sm font-medium">
                  Pastikan dokumen terorganisir di tahun pelajaran dan kategori yang tepat.
                </p>
              </div>
              
              <div className="mt-8 md:mt-12">
                <div className="inline-flex items-center gap-3 bg-white text-emerald-700 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl group-hover:shadow-white/20 transition-all group-active:scale-95">
                  Buka Arsip <FiChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. TOTAL ARSIP CARD (Kotak Kanan Atas) */}
          <motion.div 
            variants={itemVariants}
            className="col-span-2 md:col-span-2 lg:col-span-4 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-[6px_6px_0_0_#cbd5e1] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <FiFileText size={80} />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/30">
              <FiFileText size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Arsip Server</p>
            <h3 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter">
              {loading ? '...' : dashboardData.totalArsip.toLocaleString('id-ID')}
            </h3>
          </motion.div>

          {/* 3. UPLOAD BULAN INI (Kotak Kecil Kanan Bawah Kiri) */}
          <motion.div 
            variants={itemVariants}
            className="col-span-1 md:col-span-2 lg:col-span-2 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-[4px_4px_0_0_#cbd5e1] flex flex-col justify-between"
          >
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <FiUploadCloud size={18} />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800">
                {loading ? '...' : dashboardData.uploadBulanIni.toLocaleString('id-ID')}
              </h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-tight">Upload<br/>Bulan Ini</p>
            </div>
          </motion.div>

          {/* 4. USER AKTIF (Kotak Kecil Kanan Bawah Kanan) */}
          <motion.div 
            variants={itemVariants}
            className="col-span-1 md:col-span-2 lg:col-span-2 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-[4px_4px_0_0_#cbd5e1] flex flex-col justify-between"
          >
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
              <FiUsers size={18} />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800">
                {loading ? '...' : dashboardData.totalUsers.toLocaleString('id-ID')}
              </h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-tight">Pengguna<br/>Aktif</p>
            </div>
          </motion.div>

          {/* 5. AKTIVITAS TERBARU (Baris Bawah - Full Width) */}
          <motion.div 
            variants={itemVariants}
            className="col-span-2 md:col-span-4 lg:col-span-12 bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-[6px_6px_0_0_#cbd5e1]"
          >
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <FiClock className="text-emerald-500" /> Aktivitas Terakhir
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dokumen yang baru saja diunggah</p>
              </div>
            </div>

            {/* BUBBLE LIST / CARD LIST UNTUK MOBILE FRIENDLY */}
            <div className="space-y-3">
              {loading ? (
                <div className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                  Menarik Data Server...
                </div>
              ) : dashboardData.recentActivities.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                  Belum ada aktivitas
                </div>
              ) : (
                dashboardData.recentActivities.map((row, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-md p-4 rounded-2xl transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 shrink-0 bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-500 rounded-xl flex items-center justify-center transition-colors">
                        <FiFileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs md:text-sm font-bold text-slate-800 truncate" title={row.name}>
                          {row.name}
                        </h4>
                        <span className="inline-block px-2.5 py-1 mt-1 bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 rounded-md text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-colors">
                          {row.cat}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 pl-4 text-right">
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg whitespace-nowrap">
                        {row.date}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
          
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;