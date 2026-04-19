import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../backend/axiosConfig';
import Dialog from '../../components/dialog';
import { useToast } from '../../contexts/ToastContext';
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
            color: 'bg-amber-0 text-amber-500'
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
    const { showToast } = useToast();

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
        } catch (err) { showToast('error', 'Gagal Download', "Gagal mendownload berkas."); }
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
            showToast('success', 'Berhasil', 'Berkas berhasil diupload.');
        } catch (err) { showToast('error', 'Gagal Upload', "Gagal upload berkas."); } finally { setLoading(false); }
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
            showToast('success', 'Berhasil', 'Operasi folder/berkas berhasil.');
        } catch (err) { showToast('error', 'Gagal', "Operasi gagal."); }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Hapus "${item.name}" secara permanen?`)) {
            try {
                await axios.post('/files/delete', { tapel, jabatan, subPath, fileName: item.name });
                fetchContent();
                showToast('success', 'Berhasil', `Dihapus secara permanen.`);
            } catch (err) { showToast('error', 'Gagal Hapus', "Gagal menghapus berkas/folder."); }
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
        <div className="min-h-screen bg-[#FBFBFB] p-0 md:p-0 space-y-6">

            {/* --- NAVIGATOR BAR --- */}
            <div className="bg-white/80] flex flex-col gap-4">
                <div className="
    
            bg-white/95 
            backdrop-blur-1xl 
            p-2
            rounded-xl 
            border border-slate-200/60 
           shadow-[10px_10px_20px_-12px_rgba(0,0,0,0.15)]
            flex flex-col gap-40
            transition-all 
            duration-500
        ">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {/* Tombol Back - Sedikit lebih tegas */}
                        <button
                            onClick={handleBack}
                            className="w-11 h-11 flex items-center justify-center bg-slate-50 hover:bg-slate-900 rounded-2xl transition-all duration-300 text-slate-700 hover:text-white active:scale-90 shrink-0 border border-slate-200/50"
                        >
                            <FiArrowLeft size={20} />
                        </button>

                        {/* Bar Navigasi dengan Custom Scrollbar Modern */}
                        <nav className="
            flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-xl flex-1
            overflow-x-auto border border-slate-200/40 shadow-inner
            /* MODERN SCROLLBAR LOGIC */
            scrollbar-thin 
            scrollbar-thumb-slate-300 
            scrollbar-track-transparent
            hover:scrollbar-thumb-slate-400
            [&::-webkit-scrollbar]:h-1
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-slate-200
            hover:[&::-webkit-scrollbar-thumb]:bg-slate-300
        ">
                            {pathSegments.map((segment, i) => {
                                const isLast = i === pathSegments.length - 1;
                                return (
                                    <div key={i} className="flex items-center gap-1 whitespace-nowrap">
                                        {i !== 0 && (
                                            <FiChevronRight className="text-slate-300 mx-0.5" size={14} />
                                        )}

                                        <button
                                            onClick={() => navigate(segment.path)}
                                            className={`
    group flex items-center px-3 py-2 rounded-md transition-all duration-200
    ${isLast
                                                    ? 'text-blue-500 font-black cursor-default'
                                                    : 'text-slate-400 hover:text-emerald-600 active:scale-95 font-bold'
                                                }
`}
                                        >
                                            {segment.isHome ? (
                                                <FiHome
                                                    size={16}
                                                    className={`transition-colors ${isLast ? 'text-emerald-600' : 'group-hover:text-emerald-600'}`}
                                                />
                                            ) : (
                                                <span className="text-[11px] uppercase tracking-widest leading-none">
                                                    {segment.name}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3">


                    <div className="flex items-center gap-2 w-full">
                        {/* SEARCH BAR - Flex 1 agar dinamis memenuhi ruang */}
                        <div className="relative flex-1 group">
                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                            <input
                                type="text"
                                placeholder="Cari berkas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-200/80 hover:bg-slate-200/50 border border-transparent focus:border-slate-200 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-medium text-slate-700 focus:outline-none focus:shadow-[8px_8px_20px_-8px_rgba(0,0,0,0.1)] transition-all duration-300"
                            />
                            {/* Shortcut - Hidden on Mobile */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:block opacity-30 group-focus-within:opacity-0 transition-opacity">
                            </div>
                        </div>

                        {/* ACTION GROUP - Tombol & Toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1.5 shrink-0">
                                {canEdit && (
                                    <>
                                        {/* Tombol Folder - Simple Slate */}
                                        <button
                                            onClick={() => { setModalType('create'); setFolderNameInput(''); setShowModal(true); }}
                                            className="
                    h-9 px-3 
                bg-amber-400 hover:bg-amber-500 
                    text-white 
                    rounded-lg
                 
                    flex items-center gap-2 
                    transition-colors duration-200
                    active:scale-95
                "
                                        >
                                            <FiPlus size={16} strokeWidth={2.5} />
                                            <span className="hidden md:block font-bold text-[11px]">Folder</span>
                                        </button>

                                        {/* Tombol Upload - Solid Emerald */}
                                        <label className="
                h-9 px-3 
                cursor-pointer 
                bg-emerald-400 hover:bg-emerald-500 
                text-white 
                rounded-lg
                flex items-center gap-2 
                transition-colors duration-200
                active:scale-95
            ">
                                            <FiUploadCloud size={16} strokeWidth={2} />
                                            <span className="hidden md:block font-bold text-[11px]">Upload</span>
                                            <input type="file" className="hidden" onChange={handleUpload} />
                                        </label>
                                    </>
                                )}
                            </div>

                            {/* View Toggle - Compact */}
                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/30">
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>
                                    <FiGrid size={16} />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>
                                    <FiList size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- EXPLORER SECTION --- */}
            {loading ? (
                <div className="py-20 text-center animate-pulse text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">Memuat...</div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" : "bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"}>
                    {viewMode === 'list' && (
                        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-700/50 border-b border-slate-100 text-[10px] font-black text-white uppercase tracking-widest">
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
                                        ? `group bg-white p-5 rounded-[1rem] border transition-all cursor-pointer text-center relative ${isActive ? 'z-20 border-emerald-500 shadow-xl' : 'z-10 border-slate-100 shadow-sm hover:border-slate-300'}`
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
                                                className="absolute top-4 right-2 w-8 h-8 flex items-center justify-center text-slate-300 active:text-emerald-600 pointer-events-auto rounded-full active:bg-slate-50 transition-all"
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
                title={modalType === 'create' ? 'Folder Baru' : modalType === 'Ubah ' ? 'Ubah Nama' : 'Detail'}
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
                                    {selectedItem?.isFolder ? 'Download ZIP' : 'Download'}
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