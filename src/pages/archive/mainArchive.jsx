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
                const roles = res.data.roles || [];
                const foldersWithStats = await Promise.all(roles.map(async (role) => {
                    try {
                        const fileRes = await axios.get('/files/list', { params: { tapel, jabatan: role, subPath: '' } });
                        if (fileRes.data.success) {
                            const items = fileRes.data.data;
                            return {
                                name: role,
                                folderCount: items.filter(i => i.isFolder).length,
                                fileCount: items.filter(i => !i.isFolder).length
                            };
                        }
                    } catch (e) {
                        // skip errors
                    }
                    return { name: role, folderCount: 0, fileCount: 0 };
                }));
                setFolders(foldersWithStats);
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
        <div className="flex flex-col flex-1 min-h-0 max-w-7xl mx-auto px-4 md:px-0 w-full">
            
            {/* --- HEADER SECTION: CONSISTENT STYLE --- */}
            <div className="shrink-0 pt-2 pb-6 flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
                {/* BREADCRUMB */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
                        <FiFolder size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                            Tahun Pelajaran {displayTapel}
                        </h2>
                    </div>
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
                            className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Grid View"
                        >
                            <FiGrid size={16} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            title="List View"
                        >
                            <FiList size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1 overflow-y-auto min-h-0 pb-10 pr-2 flex flex-col [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
            {folders.length > 0 ? (
              viewMode === 'grid' ? (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {folders.map((folder, idx) => (
            <motion.div
                key={folder.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => navigate(`/archive/${tapel}/${folder.name.toLowerCase().trim().replace(/\s+/g, "_")}`)}
                className="group bg-white rounded-3xl shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col border border-slate-100"
            >
                {/* TOP AREA: CONTENT */}
                <div className="flex-1 p-5 md:p-6 flex flex-col bg-white">
                    <FiHardDrive 
                        size={24} 
                        className="text-slate-300 group-hover:text-emerald-500 transition-colors duration-300" 
                    />
                    
                    <div className="mt-5">
                        <h3 className="text-[14px] md:text-[16px] font-bold text-slate-800 uppercase tracking-tight leading-snug line-clamp-2">
                            {folder.name.replace(/_/g, " ")}
                        </h3>
                        <p className="text-[9px] font-semibold text-slate-400 mt-1.5 uppercase tracking-widest">
                            Digital Archive
                        </p>
                    </div>
                </div>

                {/* BOTTOM AREA: SOLID EMERALD */}
                <div className="py-3.5 px-5 md:px-6 bg-emerald-500 flex items-center justify-between transition-colors duration-300">
                    <div className="flex gap-4 text-[10px] font-bold uppercase text-white/95 tracking-wider">
                        <span>{folder.folderCount} Folder</span>
                        <span>{folder.fileCount} File</span>
                    </div>
                    <FiChevronRight className="text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" size={16} />
                </div>
            </motion.div>
        ))}
    </div>
) : (
    /* LIST VIEW: FLAT & SHARP */
    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm grow">
        <table className="w-full text-left">
            <tbody className="divide-y-2 divide-slate-50">
                {folders.map((folder) => (
                    <tr 
                        key={folder.name} 
                        onClick={() => navigate(`/archive/${tapel}/${folder.name.toLowerCase().trim().replace(/\s+/g, "_")}`)}
                        className="group hover:bg-slate-50 cursor-pointer transition-none"
                    >
                        <td className="px-8 py-7">
                            <div className="flex items-center gap-5">
                             
                                <span className="text-sm md:text-base font-bold text-slate-900 uppercase tracking-tight">
                                    {folder.name.replace(/_/g, " ")}
                                </span>
                            </div>
                        </td>
                        <td className="px-8 py-7 text-right">
                             <div className="flex justify-end gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                 <span>{folder.folderCount} Folder</span>
                                 <span>{folder.fileCount} File</span>
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
        </div>
    );
};

export default MainArchive;
