import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../backend/axiosConfig';
import Dialog from '../../components/dialog'; // Sesuaikan path jika folder components sejajar
import {
    FiArrowLeft, FiChevronRight, FiHome, FiPlus, FiUploadCloud,
    FiGrid, FiList, FiDownload, FiFolder, FiEdit2, FiTrash2,
    FiSearch, FiImage, FiMusic, FiVideo, FiFileText, FiArchive, FiCode, FiMoreVertical 
} from 'react-icons/fi';
import {
    FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint
} from 'react-icons/fa';

// --- CONFIGURATION: ICON & COLOR MAPPING ---
const getFileConfig = (fileName, isFolder) => {
    if (isFolder) {
        return {
            icon: <FiFolder size={24} fill="currentColor" />,
            color: 'bg-amber-50 text-amber-500'
        };
    }
    const ext = fileName.split('.').pop().toLowerCase();
    const map = {
        pdf: { icon: <FaFilePdf />, color: 'bg-red-50 text-red-500' },
        doc: { icon: <FaFileWord />, color: 'bg-blue-50 text-blue-600' },
        docx: { icon: <FaFileWord />, color: 'bg-blue-50 text-blue-600' },
        xls: { icon: <FaFileExcel />, color: 'bg-emerald-50 text-emerald-600' },
        xlsx: { icon: <FaFileExcel />, color: 'bg-emerald-50 text-emerald-600' },
        ppt: { icon: <FaFilePowerpoint />, color: 'bg-orange-50 text-orange-500' },
        pptx: { icon: <FaFilePowerpoint />, color: 'bg-orange-50 text-orange-500' },
        jpg: { icon: <FiImage />, color: 'bg-purple-50 text-purple-500' },
        png: { icon: <FiImage />, color: 'bg-purple-50 text-purple-500' },
        mp4: { icon: <FiVideo />, color: 'bg-pink-50 text-pink-500' },
        mp3: { icon: <FiMusic />, color: 'bg-cyan-50 text-cyan-500' },
        zip: { icon: <FiArchive />, color: 'bg-yellow-50 text-yellow-600' },
        rar: { icon: <FiArchive />, color: 'bg-yellow-50 text-yellow-600' },
        js: { icon: <FiCode />, color: 'bg-slate-100 text-slate-700' },
    };
    return map[ext] || { icon: <FiFileText />, color: 'bg-slate-50 text-slate-400' };
};

const ArchivePath = () => {
    const params = useParams();
    const { tapel, jabatan } = params;
    const subPath = params['*'] || "";
    const navigate = useNavigate();

    // --- STATES ---
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [canEdit, setCanEdit] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [folderNameInput, setFolderNameInput] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const menuRef = useRef(null);

    // --- PERMISSION & FETCH ---
    const checkPermission = async () => {
        try {
            const res = await axios.get('/define-access/check-permission', { params: { jabatan } });
            setCanEdit(res.data.can_edit);
        } catch (err) { setCanEdit(false); }
    };

    const fetchContent = async () => {
        try {
            setLoading(true);
            const cleanPath = (subPath || "").replace(/^\/+|\/+$/g, "");
            const res = await axios.get('/files/list', { params: { tapel, jabatan, subPath: cleanPath } });
            setItems(res.data.success ? res.data.data : []);
        } catch (err) { setItems([]); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchContent();
        checkPermission();
        setActiveMenu(null);
    }, [tapel, jabatan, subPath]);

    // --- CLICK OUTSIDE HANDLER ---
    useEffect(() => {
        const handleClick = (e) => {
            if (activeMenu !== null && menuRef.current && !menuRef.current.contains(e.target)) setActiveMenu(null);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [activeMenu]);

    // --- ACTIONS ---
    const handleDownload = async (item) => {
        try {
            const endpoint = item.isFolder ? '/files/download-compressed' : '/files/download';
            const params = item.isFolder
                ? { tapel, jabatan, folderPath: subPath, folderName: item.name }
                : { tapel, jabatan, subPath, fileName: item.name };

            const response = await axios.get(endpoint, { params, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', item.isFolder ? `${item.name}.zip` : item.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) { alert("Gagal mendownload berkas."); }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tapel', tapel);
        formData.append('jabatan', jabatan);
        formData.append('subPath', subPath);
        try {
            setLoading(true);
            await axios.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            fetchContent();
        } catch (err) { alert("Gagal upload berkas"); } finally { setLoading(false); }
    };

    const handleFolderAction = async () => {
        if (!folderNameInput.trim()) return;
        try {
            if (modalType === 'create') {
                await axios.post('/folders/create-sub', { tapel, jabatan, parentPath: subPath, folderName: folderNameInput });
            } else {
                await axios.post('/files/rename', { tapel, jabatan, subPath, oldName: selectedItem.name, newName: folderNameInput });
            }
            setShowModal(false);
            setFolderNameInput('');
            fetchContent();
        } catch (err) { alert("Operasi gagal"); }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Hapus "${item.name}" secara permanen?`)) {
            try {
                await axios.post('/files/delete', { tapel, jabatan, subPath, fileName: item.name });
                fetchContent();
            } catch (err) { alert("Gagal menghapus"); }
        }
    };

    // --- NAVIGATION LOGIC ---
    // --- NAVIGATION LOGIC ---
    const pathSegments = [
        // Ikon rumah sekarang murni ke root archives
        { name: 'Home', path: '/archives', isHome: true },
        { name: tapel?.replace(/-/g, '/') || '', path: `/archive/${tapel}` },
        { name: jabatan?.replace(/_/g, ' ') || '', path: `/archive/${tapel}/${jabatan}` }
    ];

    if (subPath) {
        const segments = subPath.split('/').filter(Boolean);
        segments.forEach((seg, i) => {
            const fullSubPath = segments.slice(0, i + 1).join('/');
            pathSegments.push({ name: seg, path: `/archive/${tapel}/${jabatan}/${fullSubPath}` });
        });
    }
    const [showActionSheet, setShowActionSheet] = useState(false);
const [selectedFile, setSelectedFile] = useState(null);

    const handleFolderClick = (name) => navigate(`/archive/${tapel}/${jabatan}/${subPath ? `${subPath}/${name}` : name}`);
    const handleBack = () => {
        if (!subPath) return navigate(`/archive/${tapel}`);
        const segments = subPath.split('/').filter(Boolean);
        segments.pop();
        navigate(`/archive/${tapel}/${jabatan}${segments.length ? `/${segments.join('/')}` : ''}`);
    };

   return (
        <div className="min-h-screen bg-[#FBFBFB] p-4 md:p-0 space-y-6">

            {/* --- NAVIGATOR BAR --- */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-[0_8px_10px_rgb(0,0,0,0.1),0_20px_40px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={handleBack} className="p-2.5 hover:bg-slate-900 rounded-xl transition-all duration-300 text-slate-500 hover:text-white active:scale-90 shrink-0">
                        <FiArrowLeft size={20} />
                    </button>

                    <nav className="flex items-center gap-1 bg-slate-200/50 p-1.5 rounded-2xl text-sm font-bold overflow-x-auto no-scrollbar border border-slate-200/30">
                        {pathSegments.map((segment, i) => {
                            const isLast = i === pathSegments.length - 1;
                            return (
                                <div key={i} className="flex items-center gap-1 whitespace-nowrap">
                                    {i !== 0 && <FiChevronRight className="text-slate-900/80" size={12} />}
                                    <button onClick={() => navigate(segment.path)}
                                        className={`group flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 ${isLast ? 'text-blue-700 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-900 hover:bg-white active:scale-95'}`}>
                                        {segment.isHome ? <FiHome size={16} /> : <span className="text-[10px] font-black uppercase tracking-[0.15em]">{segment.name}</span>}
                                    </button>
                                </div>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="relative w-full md:flex-1 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Cari berkas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-11 pr-4 text-[11px] font-bold tracking-wider focus:outline-none focus:border-slate-800 transition-all" />
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                        {canEdit && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setModalType('create'); setFolderNameInput(''); setShowModal(true); }}
                                    className="h-[40px] bg-amber-400 text-white px-4 rounded-xl font-bold text-[10px] uppercase flex items-center gap-2 shadow-sm hover:bg-amber-500 transition-all">
                                    <FiPlus size={14} /> <span>Folder</span>
                                </button>
                                <label className="h-[40px] cursor-pointer bg-emerald-500 text-white px-4 rounded-xl font-bold text-[10px] uppercase flex items-center gap-2 shadow-sm hover:bg-emerald-600 transition-all">
                                    <FiUploadCloud size={14} /> <span>Upload</span>
                                    <input type="file" className="hidden" onChange={handleUpload} />
                                </label>
                            </div>
                        )}
                        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}><FiGrid size={18} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}><FiList size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- EXPLORER SECTION --- */}
            {loading ? (
                <div className="py-20 text-center animate-pulse text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">Memuat...</div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" : "bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"}>
                    {viewMode === 'list' && (
                        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="col-span-6">Nama Berkas</div>
                            <div className="col-span-3 text-center">Ukuran</div>
                            <div className="col-span-3 text-right">Update</div>
                        </div>
                    )}

               {[...items]
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (a.isFolder === b.isFolder ? a.name.localeCompare(b.name) : a.isFolder ? -1 : 1))
    .map((item, idx) => {
        const { icon, color } = getFileConfig(item.name, item.isFolder);
        const isActive = activeMenu === idx;

        return (
            <div key={idx} 
                onClick={() => {
                    setSelectedItem(item);
                    if (item.isFolder) {
                        handleFolderClick(item.name);
                    } else {
                        if (window.innerWidth < 1024) {
                            setModalType('options');
                            setShowModal(true);
                        } else {
                            setActiveMenu(idx); 
                        }
                    }
                }}
                onContextMenu={(e) => { 
                    e.preventDefault(); 
                    setSelectedItem(item);
                    setActiveMenu(idx);
                    setModalType('options');
                    setShowModal(true);
                }}
                className={viewMode === 'grid'
                    ? `group bg-white p-5 rounded-[1rem] border transition-all cursor-pointer text-center relative ${isActive ? 'z-20 border-emerald-500 shadow-xl' : 'z-10 border-slate-100 shadow-sm hover:border-emerald-200'}`
                    : `group grid grid-cols-12 items-center gap-4 px-8 py-4 border-b border-slate-50 relative ${isActive ? 'z-20 bg-emerald-50/50' : 'z-10'}`
                }>
                
                {/* TOMBOL TITIK TIGA - Dipasang di layer terpisah agar tidak menggeser layout */}
                {item.isFolder && (
                    <div className="absolute inset-0 pointer-events-none z-30">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                                setModalType('options');
                                setShowModal(true);
                            }}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-300 active:text-emerald-600 pointer-events-auto rounded-full active:bg-slate-50 transition-all"
                        >
                            <FiMoreVertical size={18} />
                        </button>
                    </div>
                )}

                {/* Konten Utama - Struktur tetap murni seperti punya Mas */}
                <div className={viewMode === 'grid' ? "w-full" : "col-span-10 md:col-span-6 flex items-center gap-4"}>
                    <div className={`flex items-center justify-center shrink-0 transition-transform ${viewMode === 'grid' ? `mx-auto w-14 h-14 rounded-2xl mb-3 group-hover:scale-110 ${color}` : `w-10 h-10 rounded-xl ${color}`}`}>
                        {React.cloneElement(icon, { size: viewMode === 'list' ? 18 : 24 })}
                    </div>
                    <div className={viewMode === 'list' ? "truncate text-left" : "w-full"}>
                        <p className="font-bold text-slate-700 text-[11px] truncate uppercase tracking-tight">
                            {item.name}
                        </p>
                        <p className="text-[9px] font-black text-slate-300 uppercase mt-1">
                            {item.isFolder ? 'Folder' : item.size}
                        </p>
                    </div>
                </div>

                {viewMode === 'list' && (
                    <>
                        <div className="hidden md:block col-span-3 text-center text-[11px] font-bold text-slate-400">{item.isFolder ? '-' : item.size}</div>
                        <div className="hidden md:block col-span-3 text-right text-[11px] font-bold text-slate-400 italic">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('id-ID') : '-'}</div>
                    </>
                )}
            </div>
        );
    })}
                </div>
            )}

            {/* --- MODAL DIALOG (Luar Konteks Baris) --- */}
            <Dialog 
                isOpen={showModal} 
                onClose={() => { setShowModal(false); setActiveMenu(null); }} 
                title={modalType === 'create' ? 'Folder Baru' : modalType === 'Ubah ' ? 'Ubah Nama' : 'Opsi Berkas'}
                size="sm"
            >
                {/* Gunakan Ref Mas di sini agar useEffect handleClick tetap bekerja */}
                <div ref={menuRef} className="w-full">
                    {modalType === 'options' ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center py-4">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl mb-4 bg-white border border-slate-50`}>
                                    {selectedItem && React.cloneElement(getFileConfig(selectedItem.name, selectedItem.isFolder).icon, { size: 32 })}
                                </div>
                                <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-tight text-center px-4 line-clamp-2 leading-tight">{selectedItem?.name}</h3>
                                <div className="mt-3 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase">{selectedItem?.isFolder ? 'Folder' : selectedItem?.size}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                               {/* Tombol Aksi Utama di dalam Dialog */}
<button 
    onClick={() => {
        handleDownload(selectedItem); // Memakai fungsi async download/zip yang Mas buat
        setShowModal(false);
        setActiveMenu(null);
    }}
    className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(16,185,129,0.2)] active:scale-[0.96] transition-all group"
>
    <FiDownload size={18} className="group-hover:-translate-y-0.5 transition-transform" /> 
    {selectedItem?.isFolder ? 'Download ZIP' : 'Download Berkas'}
</button>



                                {canEdit && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => setModalType('rename')} className="py-4 px-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                            <FiEdit2 size={14} /> Ubah Nama
                                        </button>
                                        <button onClick={() => { handleDelete(selectedItem); setShowModal(false); }} className="py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                            <FiTrash2 size={14} /> Hapus
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <input autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 mb-6 outline-none focus:border-emerald-500 font-bold text-slate-700 text-sm text-center" 
                                placeholder="Masukkan nama..." value={folderNameInput} onChange={(e) => setFolderNameInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFolderAction()} />
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setShowModal(false)} className="py-4 font-black text-[10px] uppercase text-slate-400 bg-slate-50 rounded-2xl">Batal</button>
                                <button onClick={handleFolderAction} className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-md shadow-emerald-100">Simpan</button>
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>

            {/* --- EMPTY STATE --- */}
            {!loading && items.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center opacity-40">
                    <FiFolder size={48} className="text-slate-200 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Folder Kosong</p>
                </div>
            )}
        </div>
    );
};

const ActionMenu = ({ item, canEdit, handleDownload, handleDelete, ...props }) => (
    <div className="w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in-95">
        <button onClick={(e) => { e.stopPropagation(); handleDownload(item); props.setActiveMenu(null); }}
            className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-3"><FiDownload size={16} /> Download</button>
        {canEdit && (
            <>
                <div className="h-px bg-slate-50 my-1 mx-2" />
                <button onClick={(e) => { e.stopPropagation(); props.setModalType('edit'); props.setSelectedItem(item); props.setFolderNameInput(item.name); props.setShowModal(true); props.setActiveMenu(null); }}
                    className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-3"><FiEdit2 size={16} /> Ubah Nama</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                    className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase text-red-500 hover:bg-red-50 flex items-center gap-3"><FiTrash2 size={16} /> Hapus</button>
            </>
        )}
    </div>
);

export default ArchivePath;