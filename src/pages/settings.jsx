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
    if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse tracking-widest uppercase">Initializing Schema...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 px-0 select-none">

            {/* HEADER DAFCONFIG */}
            <header className="flex justify-between items-end border-b-2 border-slate-50 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">
                        DAF<span className="text-emerald-500">CONFIG</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Global Variables & Schema Management</p>
                </div>
                <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
                    <FiDatabase size={20} />
                </div>
            </header>

            <Card className="p-8 border-none bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem]">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <FiSettings size={18} />
                            </div>
                            <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                Tahun Pelajaran Aktif
                            </h2>
                        </div>

                        <select
                            className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                            value={globalData.active_tahun_pelajaran}
                            onChange={(e) => setGlobalData({ ...globalData, active_tahun_pelajaran: e.target.value })}
                        >
                            {/* Render dinamis di sini */}
                            {generateTapelOptions().map((tapel) => (
                                <option key={tapel} value={tapel}>
                                    {tapel}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleUpdateTAPEL}
                        className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all h-[58px] shadow-lg shadow-slate-200"
                    >
                        <FiSave className="inline mr-2" /> SIMPAN
                    </button>
                </div>
            </Card>

            {/* SECTION 2: MASTER HAK AKSES (KOLOM) */}
            <div className="space-y-6">
                <div className="flex w-full px-2">
                    <button
                        onClick={() => setIsColModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100"
                    >
                        <FiPlus size={16} /> Tambah Jabatan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableRoles.map(role => (
                        <div key={role} className="flex items-center justify-between bg-white p-5 rounded-3xl border-2 border-slate-50 shadow-sm group hover:border-emerald-200 transition-all">
                            <div>
                                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                                    {role.replace(/_/g, ' ')}
                                </span>
                                <p className="text-[9px] text-slate-400 font-mono mt-1 italic">{role}</p>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => { setEditCol({ oldName: role, newName: role.replace(/_/g, ' ') }); setIsEditColOpen(true); }}
                                    className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <FiEdit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteColumn(role)}
                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* ADD COLUMN */}
            <Dialog isOpen={isColModalOpen} onClose={() => setIsColModalOpen(false)} title="buat Jabatan Baru">
                <div className="space-y-6 pt-4 px-2 text-center">
                    <input
                        className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] font-black text-slate-900 outline-none focus:border-emerald-500 transition-all text-center uppercase"
                        placeholder="Nama Jabatan"
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                    />
                    <button
                        onClick={handleAddColumn}
                        className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-100"
                    >
                        Tambah
                    </button>
                </div>
            </Dialog>

            {/* EDIT/RENAME COLUMN */}
            <Dialog isOpen={isEditColOpen} onClose={() => setIsEditColOpen(false)} title="Edit Jabatan">
                <div className="space-y-6 pt-4 px-2 text-center">
                    <input
                        className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] font-black text-slate-900 outline-none focus:border-emerald-500 transition-all text-center uppercase"
                        value={editCol.newName}
                        onChange={(e) => setEditCol({ ...editCol, newName: e.target.value })}
                    />
                    <button
                        onClick={handleRenameColumn}
                        className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100"
                    >
                        Konfirmasi
                    </button>
                </div>
            </Dialog>

        </div>
    );
};

export default SettingsPage;