import React, { useState, useEffect } from 'react';
import {
    FiSettings, FiPlus, FiTrash2, FiEdit3,
    FiSave, FiDatabase, FiGrid
} from 'react-icons/fi';
// 1. Ganti import axios standar ke config buatan kita
import axios from '../backend/axiosConfig';
import Card from '../components/card';
import Dialog from '../components/dialog';
import { useToast } from '../contexts/ToastContext';

const SettingsPage = () => {
    // API_URL tidak lagi wajib di sini jika sudah ada di axiosConfig.js
    // Namun tetap bisa dipertahankan jika Anda butuh untuk hal lain.

    // --- STATES ---
    const { showToast } = useToast();
    const [globalData, setGlobalData] = useState({ active_tahun_pelajaran: '' });
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isColModalOpen, setIsColModalOpen] = useState(false);
    const [isEditColOpen, setIsEditColOpen] = useState(false);
    const [newColName, setNewColName] = useState('');
    const [editCol, setEditCol] = useState({ oldName: '', newName: '' });

    const generateTapelOptions = () => {
        const currentYear = new Date().getFullYear();
        const options = [];
        for (let i = -1; i <= 1; i++) {
            const start = currentYear + i;
            const end = start + 1;
            options.push(`${start}/${end}`);
        }
        return options;
    };

const fetchData = async () => {
    try {
        setLoading(true);
        // Memanggil global data dan define-access secara paralel
        const [globalRes, accessRes] = await Promise.all([
            axios.get('/global'),
            axios.get('/define-access')
        ]);

        // Set data tahun pelajaran aktif
        setGlobalData(globalRes.data.data);

        /**
         * PERBAIKAN:
         * Gunakan accessRes.data.roles untuk mendapatkan daftar jabatan.
         * Ini jauh lebih aman karena tidak akan error meskipun accessRes.data.data kosong [].
         */
        if (accessRes.data.status === 'success') {
            // Ambil daftar peran/jabatan langsung dari properti roles
            const rolesFromServer = accessRes.data.roles || [];
            setAvailableRoles(rolesFromServer);
        }

    } catch (err) {
        console.error("Fetch Error:", err);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => { fetchData(); }, []);

    const formatString = (str) => str.toLowerCase().trim().replace(/\s+/g, '_');

    // --- ACTIONS ---
// --- ACTIONS ---
const handleUpdateTAPEL = async () => {
    try {
        const res = await axios.put('/global', globalData);
        showToast('success', 'Berhasil', res.data.message || "Tahun Pelajaran berhasil diperbarui.");
    } catch (err) {
        // Ambil pesan dari backend jika ada, jika tidak gunakan pesan default
        const msg = err.response?.data?.message || "Gagal memperbarui TAPEL.";
        showToast('error', 'Gagal', msg);
    }
};

const handleAddColumn = async () => {
    if (!newColName) return;
    try {
        const res = await axios.post('/define-access/column', {
            name: newColName // formatString sebaiknya dilakukan di backend, tapi jika ingin di sini juga tidak apa-apa
        });
        showToast('success', 'Berhasil', res.data.message); // Memunculkan "Jabatan ... berhasil ditambahkan"
        setIsColModalOpen(false);
        setNewColName('');
        fetchData();
    } catch (err) {
        // Menangkap error 409 (Duplikasi) atau 500 dari backend
        const msg = err.response?.data?.message || "Gagal menambah kolom jabatan.";
        showToast('error', 'Gagal', msg); 
    }
};

const handleRenameColumn = async () => {
    try {
        const res = await axios.put('/define-access/column', {
            oldName: editCol.oldName,
            newName: editCol.newName
        });
        showToast('success', 'Berhasil', res.data.message);
        setIsEditColOpen(false);
        fetchData();
    } catch (err) {
        const msg = err.response?.data?.message || "Gagal mengubah nama kolom.";
        showToast('error', 'Gagal', msg);
    }
};

const handleDeleteColumn = async (name) => {
    if (!window.confirm(`HAPUS KOLOM "${name}"?\nIni akan menghapus seluruh data akses terkait untuk semua user.`)) return;
    try {
        const res = await axios.delete(`/define-access/column/${name}`);
        showToast('success', 'Berhasil dihapus', res.data.message);
        fetchData();
    } catch (err) {
        const msg = err.response?.data?.message || "Gagal menghapus kolom.";
        showToast('error', 'Gagal Menghapus', msg);
    }
};
    if (loading) return <div className="p-20 text-center font-bold text-slate-300 animate-pulse tracking-widest uppercase">Initializing Schema...</div>;

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="max-w-4xl mx-auto space-y-12 px-4 md:px-0 select-none pt-2">
            
            {/* --- GLOBAL CONFIG SECTION --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 space-y-8">

                    {/* LIST TILE: JABATAN / ROLES SECTION */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Daftar Jabatan</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Skema Hak Akses</p>
                            </div>
                            <button
                                onClick={() => setIsColModalOpen(true)}
                                className="flex items-center gap-2 bg-slate-900 text-white hover:bg-emerald-600 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                            >
                                <FiPlus size={16} /> Tambah Jabatan
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availableRoles.map((role) => (
                                <div 
                                    key={role} 
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all"
                                >
                                    <span className="text-sm font-bold text-slate-700 capitalize">
                                        {role.replace(/_/g, ' ')}
                                    </span>
                                    
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setEditCol({ oldName: role, newName: role.replace(/_/g, ' ') }); setIsEditColOpen(true); }}
                                            className="p-2 text-slate-300 hover:text-emerald-600 rounded-lg transition-colors"
                                        >
                                            <FiEdit3 size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteColumn(role)}
                                            className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}

            <Dialog isOpen={isColModalOpen} onClose={() => setIsColModalOpen(false)} title="Tambah Jabatan Baru">
                <div className="space-y-6 pt-4 px-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Jabatan</label>
                        <input
                            className="w-full p-4.5 bg-slate-50 border border-transparent rounded-2xl font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-all text-sm shadow-inner"
                            placeholder="Contoh: Kepala Sekolah"
                            value={newColName}
                            onChange={(e) => setNewColName(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAddColumn}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95"
                    >
                        Buat Jabatan
                    </button>
                </div>
            </Dialog>

            {/* EDIT/RENAME COLUMN */}
            <Dialog isOpen={isEditColOpen} onClose={() => setIsEditColOpen(false)} title="Ubah Nama Jabatan">
                <div className="space-y-6 pt-4 px-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Jabatan Baru</label>
                        <input
                            className="w-full p-4.5 bg-slate-50 border border-transparent rounded-2xl font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-500 transition-all text-sm shadow-inner"
                            value={editCol.newName}
                            onChange={(e) => setEditCol({ ...editCol, newName: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={handleRenameColumn}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95"
                    >
                        Konfirmasi Perubahan
                    </button>
                </div>
            </Dialog>

        </div>
        </div>
    );
};

export default SettingsPage;
