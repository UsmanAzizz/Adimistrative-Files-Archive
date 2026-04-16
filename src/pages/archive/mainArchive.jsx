import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiFolder, FiChevronRight, FiHardDrive, FiArrowLeft } from 'react-icons/fi';
import axios from '../../backend/axiosConfig';

const MainArchive = () => {
    // 1. Menangkap variabel 'tapel' dari URL (dikirim oleh ArchivePage)
    const { tapel } = useParams();
    const navigate = useNavigate();

    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Mempersiapkan format tampilan Tahun Pelajaran (misal: 2025-2026 -> 2025/2026)
    const displayTapel = tapel ? tapel.replace(/-/g, '/') : '';

    const fetchFolders = async () => {
        setLoading(true);
        try {
            // Mengambil struktur kolom jabatan dari backend
            const res = await axios.get('/define-access');
            
            if (res.data.status === 'success' && res.data.data.length > 0) {
                // Ambil semua kunci kolom
                const allKeys = Object.keys(res.data.data[0]);
                
                // Pengecualian: variabel ini bukan merupakan direktori jabatan
                const ignoreFields = ['user_id', 'nama', 'tahun_pelajaran', 'created_at', 'updated_at'];
                const dynamicFolders = allKeys.filter(key => !ignoreFields.includes(key));
                
                setFolders(dynamicFolders);
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

    // 3. Fungsi Navigasi ke halaman berikutnya dengan membawa 2 variabel
 const handleFolderClick = (folderName) => {
    // Variabel 'tapel' didapat dari useParams() di bagian atas komponen
    // folderName didapat dari iterasi .map()
    
    const jabatanSlug = folderName.toLowerCase().trim();
    
    // Ini akan mengarah ke rute /archive/2025-2026/kurikulum
    navigate(`/archive/${tapel}/${jabatanSlug}`);
};

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Direktori...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Navigasi Balik */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => navigate('/archive')}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <FiHardDrive className="text-emerald-600" size={18} />
                            <h2 className="text-xl font-black text-slate-800">Direktori Utama</h2>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                            DAFArchive SMK Diponegoro
                        </p>
                    </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter opacity-60">Tahun Pelajaran</p>
                    <p className="text-sm font-black text-emerald-600">{displayTapel}</p>
                </div>
            </div>

            {/* Grid Folder Jabatan */}
      

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {folders.length > 0 ? (
        folders.map((folderName) => (
            <div 
                key={folderName}
                // --- LOGIKA NAVIGASI ---
                onClick={() => {
                    // Bersihkan nama jabatan untuk URL (misal: 'Sarana Prasarana' -> 'sarana_prasarana')
                    const jabatanSlug = folderName.toLowerCase().trim().replace(/\s+/g, '_');
                    // Kirim parameter tapel (dari URL saat ini) dan jabatan ke halaman berikutnya
                    navigate(`/archive/${tapel}/${jabatanSlug}`);
                }}
                className="group bg-white p-8 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
                {/* Dekorasi Ikon Background */}
                <FiFolder className="absolute -right-6 -bottom-6 text-slate-50 group-hover:text-emerald-50 transition-colors duration-500" size={150} />

                <div className="relative z-10 space-y-6">
                    {/* Ikon Box */}
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white rounded-3xl flex items-center justify-center transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-200">
                        <FiFolder size={32} />
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">
                            {/* Menghapus underscore untuk tampilan user */}
                            {folderName.replace(/_/g, ' ')}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {/* Menampilkan Tahun Pelajaran yang aktif */}
                                Arsip Digital {displayTapel}
                            </p>
                        </div>
                    </div>

                    {/* Indikator Aksi */}
                    <div className="pt-4 flex items-center text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        Buka Direktori <FiChevronRight className="ml-2" size={14} />
                    </div>
                </div>
            </div>
        ))
    ) : (
        /* Empty State */
        <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <FiHardDrive className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Belum ada struktur direktori jabatan.</p>
            <button 
                onClick={() => navigate('/settings')}
                className="mt-4 text-emerald-600 font-black text-[10px] uppercase underline tracking-widest"
            >
                Konfigurasi di Settings
            </button>
        </div>
    )}
</div>
        </div>
    );
};

export default MainArchive;