import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    FiFolder, FiFile, FiArrowLeft, FiPlus, FiMoreVertical,
    FiChevronRight, FiHome, FiX, FiEdit2, FiTrash2, FiGrid, FiList, FiDownload, FiUploadCloud
} from 'react-icons/fi';
import axios from '../../backend/axiosConfig';

const ArchivePath = () => {
    const params = useParams();
    const { tapel, jabatan } = params;
    const subPath = params['*'] || "";

    const navigate = useNavigate();
    const location = useLocation();

    // --- STATE UTAMA ---
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [canEdit, setCanEdit] = useState(false); // State Izin Akses

    // --- STATE JABATAN & UI ---
    const [currentJabatan, setCurrentJabatan] = useState(jabatan);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [folderNameInput, setFolderNameInput] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const menuRef = useRef(null);

    // --- 1. LOGIKA CEK AKSES (RBAC) ---
    const checkPermission = async () => {
        try {
            // Memanggil API client_access untuk cek kolom [jabatan] pada user ini
            const res = await axios.get('/define-access/check-permission', {
                params: { jabatan: jabatan }
            });
            setCanEdit(res.data.can_edit);
        } catch (err) {
            console.error("Permission check failed", err);
            setCanEdit(false);
        }
    };

    // --- 2. FETCH CONTENT ---
const fetchContent = async () => {
    try {
        const cleanPath = (subPath || "").replace(/^\/+|\/+$/g, "");
        const res = await axios.get('/files/list', { // Pastikan endpointnya /files/list
            params: { tapel, jabatan, subPath: cleanPath }
        });
        
        // SINKRONKAN DI SINI:
        if (res.data.success) { 
            setItems(res.data.data); 
        } else {
            setItems([]);
        }
    } catch (err) {
        console.error("Fetch error:", err);
        setItems([]);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        setLoading(true);
        fetchContent();
        checkPermission();
        setActiveMenu(null);
        if (jabatan !== currentJabatan) setCurrentJabatan(jabatan);
    }, [tapel, jabatan, subPath]);

    // --- 3. FILE OPERATIONS ---
    
    // Download via crudFiles.js
    const handleDownload = (item) => {
        const url = `${axios.defaults.baseURL}/files/download?tapel=${tapel}&jabatan=${jabatan}&subPath=${subPath}&fileName=${item.name}`;
        window.open(url, '_blank');
    };

    // Upload via crudFiles.js
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
            await axios.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchContent();
        } catch (err) {
            alert("Gagal upload berkas");
        } finally {
            setLoading(false);
        }
    };

    const handleFolderAction = async () => {
        if (!folderNameInput.trim()) return;
        try {
            if (modalType === 'create') {
                await axios.post('/folders/create-sub', {
                    tapel, jabatan, parentPath: subPath || '', folderName: folderNameInput
                });
            } else {
                // Rename File/Folder
                await axios.post('/files/rename', {
                    tapel, jabatan, subPath, oldName: selectedItem.name, newName: folderNameInput
                });
            }
            setShowModal(false);
            setFolderNameInput('');
            setTimeout(fetchContent, 500);
        } catch (err) {
            alert("Operasi gagal");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Hapus "${item.name}" secara permanen?`)) {
            try {
                await axios.post('/files/delete', {
                    tapel, jabatan, subPath, fileName: item.name
                });
                setActiveMenu(null);
                setTimeout(fetchContent, 300);
            } catch (err) {
                alert("Gagal menghapus");
            }
        }
    };

    // --- BREADCRUMBS LOGIC ---
    const pathSegments = [
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

    const handleFolderClick = (folderName) => {
        const nextPath = subPath ? `${subPath.replace(/\/+$/, "")}/${folderName}` : folderName;
        navigate(`/archive/${tapel}/${jabatan}/${nextPath}`);
    };

    const handleBack = () => {
        if (!subPath) return navigate(`/archive/${tapel}`);
        const segments = subPath.split('/').filter(Boolean);
        segments.pop();
        navigate(segments.length > 0 ? `/archive/${tapel}/${jabatan}/${segments.join('/')}` : `/archive/${tapel}/${jabatan}`);
    };

    return (
        <div className="min-h-screen bg-[#FBFBFB] p-4 md:p-2 space-y-6">
            
            {/* TOOLBAR */}
            <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 overflow-hidden">
                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <FiArrowLeft size={20} className="text-slate-400" />
                    </button>

                    <nav className="flex items-center gap-1 text-sm font-bold overflow-x-auto no-scrollbar">
                        {pathSegments.map((segment, i) => (
                            <div key={i} className="flex items-center gap-1 uppercase tracking-tight">
                                {i !== 0 && <FiChevronRight className="text-slate-300" />}
                                <button onClick={() => navigate(segment.path)} className={`${i === pathSegments.length - 1 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'} px-3 py-1.5 rounded-xl transition-all`}>
                                    {i === 0 && <FiHome className="inline mr-1 mb-1" />} {segment.name}
                                </button>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl mr-2">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}><FiGrid size={18} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}><FiList size={18} /></button>
                    </div>

                    {/* ACTIONS: Hanya muncul jika canEdit === true */}
                    {canEdit && (
                        <>
                            <button onClick={() => { setModalType('create'); setFolderNameInput(''); setShowModal(true); }} className="bg-amber-400 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-md">
                                <FiPlus /> Folder
                            </button>
                            <label className="cursor-pointer bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-md hover:bg-emerald-600 transition-all">
                                <FiUploadCloud /> Upload
                                <input type="file" className="hidden" onChange={handleUpload} />
                            </label>
                        </>
                    )}
                </div>
            </div>

            {/* EXPLORER */}
            {loading ? (
                <div className="py-20 text-center animate-pulse text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">Menyusun Berkas...</div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" : "flex flex-col gap-2"}>
                    {items.map((item, idx) => (
                        <div key={idx} onClick={() => item.isFolder && handleFolderClick(item.name)} className={`group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative ${viewMode === 'list' ? 'flex items-center justify-between p-4' : 'text-center'}`}>
                            
                            <div className={viewMode === 'list' ? "flex items-center gap-4" : ""}>
                                <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${item.isFolder ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'} ${viewMode === 'list' ? 'w-12 h-12 mb-0' : ''}`}>
                                    {item.isFolder ? <FiFolder size={32} fill="currentColor" /> : <FiFile size={32} />}
                                </div>
                                <div className={viewMode === 'list' ? "text-left" : ""}>
                                    <p className="font-bold text-slate-700 text-[11px] truncate uppercase tracking-tight px-2">{item.name}</p>
                                    <p className="text-[9px] font-black text-slate-300 uppercase mt-1">{item.isFolder ? 'Folder' : item.size}</p>
                                </div>
                            </div>

                            <div className="absolute top-4 right-2" ref={activeMenu === idx ? menuRef : null}>
                                <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === idx ? null : idx); }} className="p-2 text-slate-300 hover:text-slate-600"><FiMoreVertical size={16} /></button>
                                {activeMenu === idx && (
                                    <ActionMenu 
                                        item={item} 
                                        canEdit={canEdit} 
                                        handleDownload={handleDownload} 
                                        handleDelete={handleDelete}
                                        setModalType={setModalType}
                                        setSelectedItem={setSelectedItem}
                                        setFolderNameInput={setFolderNameInput}
                                        setShowModal={setShowModal}
                                        setActiveMenu={setActiveMenu}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL RENAME/CREATE */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-slate-800 uppercase mb-8">{modalType === 'create' ? 'Folder Baru' : 'Ubah Nama'}</h3>
                        <input autoFocus className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 mb-8 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700" placeholder="Nama..." value={folderNameInput} onChange={(e) => setFolderNameInput(e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setShowModal(false)} className="py-4 font-black text-[10px] uppercase text-slate-400">Batal</button>
                            <button onClick={handleFolderAction} className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-emerald-600 transition-all">Proses</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ActionMenu = ({ item, canEdit, handleDownload, handleDelete, ...props }) => (
    <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-50 py-2 z-50 animate-in fade-in slide-in-from-top-2">
        <button onClick={(e) => { e.stopPropagation(); handleDownload(item); props.setActiveMenu(null); }} className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 flex items-center gap-2">
            <FiDownload /> Download
        </button>
        {canEdit && (
            <>
                <button onClick={(e) => { e.stopPropagation(); props.setModalType('edit'); props.setSelectedItem(item); props.setFolderNameInput(item.name); props.setShowModal(true); props.setActiveMenu(null); }} className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-50">
                    <FiEdit2 className="text-emerald-500" /> Rename
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase text-red-500 hover:bg-red-50 flex items-center gap-2">
                    <FiTrash2 /> Hapus
                </button>
            </>
        )}
    </div>
);

export default ArchivePath;