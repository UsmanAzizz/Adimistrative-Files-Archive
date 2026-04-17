import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiFolder, FiChevronRight, FiHardDrive, FiArrowLeft, FiGrid, FiList } from 'react-icons/fi';
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
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-2 md:px-0">
            
            {/* --- HEADER & NAVIGATION --- */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => navigate('/archives')} 
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-300"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            {/* <FiHardDrive className="text-emerald-600" size={18} /> */}
                            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                                Direktori Utama
                            </h1>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Tahun Pelajaran {displayTapel}
                        </p>
                    </div>
                </div>

                {/* TOGGLE VIEW MODE (Grid vs Table) */}
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 self-end md:self-center">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                    >
                        <FiGrid size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                    >
                        <FiList size={16} /> 
                    </button>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            {folders.length > 0 ? (
                viewMode === 'grid' ? (
                    /* 4. GRID VIEW: CARD SNACK STYLE */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {folders.map((folderName) => (
                            <div
                                key={folderName}
                                onClick={() => navigate(`/archive/${tapel}/${folderName.toLowerCase().trim().replace(/\s+/g, "_")}`)}
                                className="group relative bg-white rounded-[1.8rem] md:rounded-[2.2rem] border border-slate-100 shadow-md hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px] md:min-h-[200px]"
                            >
                                <div className="p-5 md:p-8 relative z-10">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-50 text-slate-400 group-hover:bg-amber-400 group-hover:text-white rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm">
                                        <FiFolder size={24} />
                                    </div>

                                    <div className="mt-4 md:mt-6">
                                        <h3 className="text-[13px] md:text-lg font-bold text-slate-700 uppercase leading-tight group-hover:text-emerald-700 transition-colors">
                                            {folderName.replace(/_/g, " ")}
                                        </h3>
                                        <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase">Direktori Sistem</p>
                                    </div>
                                </div>

                                {/* Dekorasi Ikon Shadow */}
                                <FiFolder 
                                    className="absolute -right-2 -bottom-2 text-slate-50 group-hover:text-emerald-50/30 transition-all duration-700" 
                                    size={100} 
                                />

                                {/* INDICATOR SNACK (Warna Hijau) */}
                                <div className="h-1.5 md:h-2 w-full bg-emerald-500 transform scale-x-75 group-hover:scale-x-100 transition-transform duration-500 origin-center rounded-t-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* 5. LIST VIEW: TABLE STYLE */
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Departemen</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {folders.map((folderName) => (
                                    <tr 
                                        key={folderName} 
                                        onClick={() => navigate(`/archive/${tapel}/${folderName.toLowerCase().trim().replace(/\s+/g, "_")}`)}
                                        className="group hover:bg-emerald-50/30 cursor-pointer transition-all"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-amber-400 group-hover:text-white rounded-xl flex items-center justify-center transition-all">
                                                    <FiFolder size={18} />
                                                </div>
                                                <span className="text-sm md:text-base font-bold text-slate-700 capitalize group-hover:text-emerald-700 transition-colors">
                                                    {folderName.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-300 group-hover:text-emerald-600 transition-all">
                                                <span className="text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all">BUKA</span>
                                                <FiChevronRight size={20} />
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