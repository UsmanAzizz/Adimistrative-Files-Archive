import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiFolder, FiChevronRight, FiHardDrive, FiArrowLeft, FiGrid, FiList } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from '../../backend/axiosConfig';

const MainArchive = () => {
    // 1. Inisialisasi State & Hooks
    const { tapel } = useParams();
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // Default ke Grid View

    const displayTapel = tapel ? tapel.replace(/-/g, '/') : '';

    // 2. Fetch Data dari API
    const fetchFolders = async () => {
        setLoading(true);
        try {
            // Mengambil struktur kolom jabatan yang sudah dikirim oleh backend
            const res = await axios.get('/define-access');
            if (res.data.status === 'success') {
                setFolders(res.data.roles || []);
            }
        } catch (err) {
            console.error("Gagal memuat struktur arsip:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    // 3. Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Sinkronisasi Direktori...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-0">
            
            {/* --- HEADER SECTION: CONSISTENT STYLE --- */}
            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Direktori <span className="text-emerald-600">Arsip</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] mt-1 uppercase">
                        Tahun Pelajaran {displayTapel}
                    </p>
                </div>

                {/* NAVIGATION & VIEW TOGGLE BOX */}
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
                    <button 
                        onClick={() => navigate('/archives')} 
                        className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-300"
                    >
                        <FiArrowLeft size={18} />
                    </button>
                    
                    <div className="h-8 w-px bg-slate-100 mx-1" />

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            <FiGrid size={14} /> Grid
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            <FiList size={14} /> List
                        </button>
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            {folders.length > 0 ? (
              viewMode === 'grid' ? (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {folders.map((folderName, idx) => (
            <motion.div
                key={folderName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => navigate(`/archive/${tapel}/${folderName.toLowerCase().trim().replace(/\s+/g, "_")}`)}
                className="group bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col min-h-[180px] md:min-h-[220px]"
            >
                {/* TOP AREA: CONTENT */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white">
                    <FiHardDrive 
                        size={32} 
                        className="text-slate-300 group-hover:text-emerald-500 transition-colors duration-300" 
                    />
                    
                        <div className="mt-6">
                            <h3 className="text-[14px] md:text-[18px] font-black text-slate-900 uppercase tracking-tighter leading-tight">
                                {folderName.replace(/_/g, " ")}
                            </h3>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">
                                Digital Archive
                            </p>
                        </div>
                </div>

                {/* BOTTOM AREA: SOLID EMERALD (Sharp & Seamless) */}
                <div className="h-12 md:h-14 w-full bg-emerald-500 flex items-center justify-end px-6 md:px-8">
                    <FiChevronRight className="text-white group-hover:translate-x-1 transition-transform" size={20} />
                </div>
            </motion.div>
        ))}
    </div>
) : (
    /* LIST VIEW: FLAT & SHARP */
    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
            <tbody className="divide-y-2 divide-slate-50">
                {folders.map((folderName) => (
                    <tr 
                        key={folderName} 
                        onClick={() => navigate(`/archive/${tapel}/${folderName.toLowerCase().trim().replace(/\s+/g, "_")}`)}
                        className="group hover:bg-slate-50 cursor-pointer transition-none"
                    >
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-5">
                             
                                <span className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">
                                    {folderName.replace(/_/g, " ")}
                                </span>
                            </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                             <div className="inline-block px-3 py-1 bg-white-600 text-white text-[10px] font-black rounded-md">
                                 <FiHardDrive size={20} className="text-slate-400 group-hover:text-slate-600" />
                             </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)
            ) : (
                /* 6. EMPTY STATE */
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <FiHardDrive className="text-slate-200" size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Direktori Kosong</h3>
                    <p className="text-slate-400 text-sm mt-1">Belum ada departemen yang dikonfigurasi di database.</p>
                </div>
            )}
        </div>
    );
};

export default MainArchive;