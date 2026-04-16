import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    FiFolder, FiFile, FiArrowLeft, FiPlus, FiMoreVertical,
    FiChevronRight, FiHome, FiX, FiEdit2, FiTrash2, FiGrid, FiList
} from 'react-icons/fi';
import axios from '../../backend/axiosConfig';

const ArchivePath = () => {
    // 1. Ambil params dengan fallback yang aman
    const params = useParams();
    const { tapel, jabatan } = params;
    const subPath = params['*'] || ""; 
    
    const navigate = useNavigate();
    const location = useLocation();

    // State Utama
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    
    // State Modal & UI
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create'); 
    const [selectedItem, setSelectedItem] = useState(null);
    const [folderNameInput, setFolderNameInput] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const menuRef = useRef(null);

    // --- LOGIKA BREADCRUMBS (DIPERBAIKI) ---
    const pathSegments = [
        { name: tapel?.replace(/-/g, '/') || '', path: `/archive/${tapel}` },
        { name: jabatan?.replace(/_/g, ' ') || '', path: `/archive/${tapel}/${jabatan}` }
    ];

    if (subPath) {
        const segments = subPath.split('/').filter(Boolean);
        segments.forEach((seg, i) => {
            const fullSubPath = segments.slice(0, i + 1).join('/');
            pathSegments.push({
                name: seg,
                path: `/archive/${tapel}/${jabatan}/${fullSubPath}`
            });
        });
    }

    // --- 2. FETCH CONTENT (DIPERBAIKI AGAR TIDAK 502) ---
    const fetchContent = async () => {
        setLoading(true);
        try {
            // Pastikan tidak ada slash di awal/akhir yang mengganggu query backend
            const cleanPath = subPath.replace(/^\/+|\/+$/g, "");
            
            const res = await axios.get('/folders/content', {
                params: { 
                    tapel, 
                    jabatan, 
                    path: cleanPath 
                }
            });
            
            if (res.data.status === 'success') {
                setItems(Array.isArray(res.data.data) ? res.data.data : []);
            }
        } catch (err) {
            console.error("Gagal fetch content:", err);
            setItems([]);
            // Jika 502 terjadi, pastikan backend tidak crash saat membaca path kosong
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetch saat path berubah
    useEffect(() => {
        fetchContent();
        setActiveMenu(null);
    }, [tapel, jabatan, subPath]); // Dependency dipersempit ke params

    // --- 3. ACTIONS (NAVIGASI ABSOLUT) ---
    const handleFolderClick = (folderName) => {
        const currentSubPath = subPath.replace(/\/+$/, "");
        const nextPath = currentSubPath ? `${currentSubPath}/${folderName}` : folderName;
        // Gunakan path absolut agar tidak double prefix /dafa/dafa
        navigate(`/archive/${tapel}/${jabatan}/${nextPath}`);
    };

    const handleBack = () => {
        if (!subPath) return navigate(`/archive/${tapel}`);
        const segments = subPath.split('/').filter(Boolean);
        segments.pop();
        const targetPath = segments.length > 0 
            ? `/archive/${tapel}/${jabatan}/${segments.join('/')}`
            : `/archive/${tapel}/${jabatan}`;
        navigate(targetPath);
    };

    const handleFolderAction = async () => {
        if (!folderNameInput.trim()) return;
        try {
            if (modalType === 'create') {
                await axios.post('/folders/create-sub', {
                    tapel, 
                    jabatan, 
                    parentPath: subPath || '', 
                    folderName: folderNameInput
                });
            } else {
                await axios.put('/folders/rename-sub', {
                    id: selectedItem.id, 
                    newName: folderNameInput
                });
            }
            setShowModal(false);
            setFolderNameInput('');
            // Refresh content setelah aksi
            fetchContent();
        } catch (err) {
            alert("Gagal memproses folder. Periksa koneksi backend (502).");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Hapus folder "${item.name}" secara permanen?`)) {
            try {
                await axios.delete(`/folders/sub/${item.id}`);
                fetchContent();
            } catch (err) {
                alert("Gagal menghapus folder");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFBFB] p-4 md:p-2 space-y-6">

            {/* HEADER & CONTROLS */}
            <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 overflow-hidden">
                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                        <FiArrowLeft size={20} className="text-slate-400 group-hover:text-slate-900" />
                    </button>

                    <nav className="flex items-center gap-1 text-sm font-bold overflow-x-auto whitespace-nowrap no-scrollbar">
                        {pathSegments.map((segment, i) => (
                            <div key={i} className="flex items-center gap-1">
                                {i !== 0 && <FiChevronRight className="text-slate-300" />}
                                <button
                                    onClick={() => navigate(segment.path)}
                                    className={`${i === pathSegments.length - 1 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-emerald-600'} px-3 py-1.5 rounded-xl transition-all uppercase tracking-tight`}
                                >
                                    {i === 0 && <FiHome className="inline mr-1 mb-1" />}
                                    {segment.name}
                                </button>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>
                            <FiGrid size={18} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>
                            <FiList size={18} />
                        </button>
                    </div>

                 <button
    onClick={() => { setModalType('create'); setFolderNameInput(''); setShowModal(true); }}
    className="flex items-center justify-center gap-2 bg-amber-400 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-md active:scale-95"
>
    <div className="relative">
        <FiFolder size={16} />
        <FiPlus 
            size={10} 
            className="absolute -right-1 -bottom-1 bg-amber-400 group-hover:bg-emerald-400 rounded-full border border-white" 
        />
    </div>

</button>
                </div>
            </div>

            {/* EXPLORER AREA */}
            {loading ? (
                <div className="py-20 text-center animate-pulse text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                    Menyusun Berkas...
                </div>
            ) : viewMode === 'grid' ? (
                /* GRID VIEW */
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
    {items.map((item, idx) => (
        <div 
            key={item.id || idx} 
            onClick={() => item.isFolder && handleFolderClick(item.name)} 
            /* Radius dikurangi menjadi 3xl, shadow-sm untuk dimensi awal */
            className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-amber-500/20 hover:shadow-xl transition-all duration-300 cursor-pointer text-center relative"
        >
            <div className="absolute top-4 right-0 z-20" ref={activeMenu === idx ? menuRef : null}>
                <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === idx ? null : idx); }} 
                    className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                    <FiMoreVertical size={16} />
                </button>
                {activeMenu === idx && (
                    <ActionMenu 
                        item={item} 
                        setModalType={setModalType} 
                        setSelectedItem={setSelectedItem} 
                        setFolderNameInput={setFolderNameInput} 
                        setShowModal={setShowModal} 
                        setActiveMenu={setActiveMenu} 
                        handleDelete={handleDelete} 
                    />
                )}
            </div>

            {/* KEMBALI KE AMBER: bg-amber-50 dan text-amber-500 */}
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500 ${item.isFolder ? 'bg-amber-50 text-amber-500 shadow-inner' : 'bg-blue-50 text-blue-500'}`}>
                {item.isFolder ? <FiFolder size={32} fill="currentColor" /> : <FiFile size={32} />}
            </div>

            <p className="font-bold text-slate-700 text-[11px] truncate uppercase tracking-tight px-2">
                {item.name}
            </p>
            <p className="text-[9px] font-black text-slate-300 mt-1 uppercase">
                {item.isFolder ? 'Folder' : item.size}
            </p>
        </div>
    ))}
</div>
            ) : (
                /* LIST VIEW */
                <div className="flex flex-col gap-2">
                    {items.map((item, idx) => (
                        <div key={item.id || idx} onClick={() => item.isFolder && handleFolderClick(item.name)} className="group bg-white p-4 rounded-3xl border border-transparent hover:border-emerald-500/20 hover:shadow-md transition-all cursor-pointer flex items-center justify-between relative">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.isFolder ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                                    {item.isFolder ? <FiFolder size={24} fill="currentColor" /> : <FiFile size={24} />}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 text-sm uppercase tracking-tight">{item.name}</p>
                                    <p className="text-[10px] font-black text-slate-300 uppercase">{item.isFolder ? 'Folder' : item.size}</p>
                                </div>
                            </div>
                            <div className="relative" ref={activeMenu === idx ? menuRef : null}>
                                <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === idx ? null : idx); }} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl">
                                    <FiMoreVertical size={18} />
                                </button>
                                {activeMenu === idx && <ActionMenu item={item} setModalType={setModalType} setSelectedItem={setSelectedItem} setFolderNameInput={setFolderNameInput} setShowModal={setShowModal} setActiveMenu={setActiveMenu} handleDelete={handleDelete} />}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL (Tetap Sama) */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{modalType === 'create' ? 'Buat Folder' : 'Ubah Nama'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={24} /></button>
                        </div>
                        <input autoFocus type="text" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 mb-8 outline-none" placeholder="Ketik nama folder..." value={folderNameInput} onChange={(e) => setFolderNameInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFolderAction()} />
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setShowModal(false)} className="py-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Batal</button>
                            <button onClick={handleFolderAction} className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all">{modalType === 'create' ? 'Buat Sekarang' : 'Simpan Perubahan'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-komponen Menu agar kode lebih bersih
const ActionMenu = ({ item, setModalType, setSelectedItem, setFolderNameInput, setShowModal, setActiveMenu, handleDelete }) => (
    <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
        <button onClick={(e) => { e.stopPropagation(); setModalType('edit'); setSelectedItem(item); setFolderNameInput(item.name); setShowModal(true); setActiveMenu(null); }} className="w-full px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <FiEdit2 className="text-emerald-500" /> Edit Nama
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(item); setActiveMenu(null); }} className="w-full px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-2">
            <FiTrash2 /> Hapus
        </button>
    </div>
);

export default ArchivePath;