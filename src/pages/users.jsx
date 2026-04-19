import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiShield, FiUser, FiCheck } from 'react-icons/fi';
// 1. Gunakan axios kustom agar Cookie JWT otomatis terkirim
import axios from '../backend/axiosConfig';
import Dialog from '../components/dialog';
import { useToast } from '../contexts/ToastContext';

const Users = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessColumns, setAccessColumns] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Profil, Step 2: Akses

  const [formData, setFormData] = useState({
    nama: '', username: '', password: '', role: 'client',
    tahun_pelajaran: ''
  });
  const [rolesData, setRolesData] = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 2. Path disingkat karena axiosConfig sudah punya baseURL: http://.../api
      const [resUsers, resGlobal] = await Promise.all([
        axios.get('/users'),
        axios.get('/global')
      ]);

      const usersData = Array.isArray(resUsers.data) ? resUsers.data : [];
      setUsers(usersData);

      if (resGlobal.data.status === 'success') {
        const globalData = resGlobal.data.data;
        setFormData(prev => ({
          ...prev,
          tahun_pelajaran: globalData.active_tahun_pelajaran
        }));
      }

      if (usersData.length > 0) {
        const ignoreFields = ['id', 'user_id', 'nama', 'username', 'password', 'role', 'tahun_pelajaran', 'created_at', 'updated_at'];
        const columns = Object.keys(usersData[0]).filter(key => !ignoreFields.includes(key));
        setAccessColumns(columns);
      }

    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    if (!currentUser) return;
    try {
      await axios.delete(`/users/${currentUser.id}`);
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal Menghapus', 'Gagal menghapus user.');
    }
  };

  const handleOpenAdd = () => {
    setCurrentUser(null);
    setFormData({ nama: '', username: '', password: '', role: 'client' });
    const initialRoles = {};
    accessColumns.forEach(col => { initialRoles[col] = false; });
    setRolesData(initialRoles);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setCurrentUser(user);
    const { id, nama, username, role, tahun_pelajaran, created_at, updated_at, user_id, ...onlyRoles } = user;
    setFormData({ nama, username, role, tahun_pelajaran, password: '' });

    const cleanRoles = {};
    accessColumns.forEach(col => {
      cleanRoles[col] = onlyRoles[col] === 1 || onlyRoles[col] === true;
    });
    setRolesData(cleanRoles);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Proteksi Mobile: Jika menekan Enter di Step 1, validasi lalu pindah ke Step 2
    if (window.innerWidth < 768 && currentStep === 1) {
      const form = e?.target;
      if (form && !form.reportValidity()) return;
      setCurrentStep(2);
      return;
    }

    try {
      let targetId = currentUser?.id;

      if (currentUser) {
        await axios.put(`/users/${targetId}`, formData);
      } else {
        const resUser = await axios.post('/users', formData);
        // Menyesuaikan dengan struktur response backend: { status, message, id }
        targetId = resUser.data.id;
      }

      if (!targetId) {
        showToast('error', 'Error', 'ID User tidak ditemukan. Cek response backend!');
        return;
      }

      // Simpan akses jabatan secara terpisah
      await axios.put('/define-access/update', {
        user_id: targetId,
        nama: formData.nama,
        tahun_pelajaran: formData.tahun_pelajaran,
        ...rolesData
      });

      setIsModalOpen(false);
      fetchUsers();
      showToast('success', 'Berhasil', 'Data user dan akses berhasil disimpan!');
    } catch (err) {
      console.error("Submit Error:", err);
      showToast('error', 'Terjadi Kesalahan', err.response?.data?.message || err.message);
    }
  };

  const filteredUsers = users
    .filter(u => u.nama?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.role === 'admin' ? -1 : 1);

  return (
    <div className="min-h-screen bg-slate-50/50 pt-0 pb-10 px-4 sm:px-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Manajemen <span className="text-emerald-600">User</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] mt-1 uppercase">
            Daftar Pengguna & Hak Akses
          </p>
        </div>

        {/* Search Bar & Add Button Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Bar dengan Radius Lebih Besar */}
          <div className="relative w-full max-w-md group">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama pengguna..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm hover:shadow-md"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Button dengan Radius Senada */}
          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
          >
            <FiUserPlus size={20} />
            <span>Tambah User</span>
          </button>
        </div>

        {/* Clean Professional Table - Responsive */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Username</th>
                  <th className="px-6 py-4 text-center hidden sm:table-cell">Role</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="4" className="py-12 text-center text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Memuat data...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="4" className="py-12 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">Tidak ada user ditemukan</td></tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} onClick={() => handleOpenEdit(u)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700 text-sm">{u.nama}</div>
                        <div className="sm:hidden flex items-center gap-2 mt-1">
                          <span className="text-slate-400 text-xs font-medium">@{u.username}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {u.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium hidden sm:table-cell">@{u.username}</td>
                      <td className="px-6 py-4 text-center hidden sm:table-cell">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded tracking-widest ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={(e) => { e.stopPropagation(); setCurrentUser(u); setIsDeleteOpen(true); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>
      </div>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentUser ? 'Edit Profil User' : 'Tambah User Baru'} size="lg">
        <form onSubmit={handleSubmit} className="py-2 -mx-2 md:mx-0">

          {/* MOBILE ONLY: Minimal Step Indicator */}
          <div className="md:hidden flex items-center gap-2 mb-6 px-2">
            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${currentStep >= 1 ? 'bg-slate-900' : 'bg-slate-100'}`} />
            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'bg-slate-900' : 'bg-slate-100'}`} />
          </div>

          <div className="flex flex-col md:flex-row gap-0">

            {/* LEFT SECTION / STEP 1 */}
            <div className={`md:w-[40%] md:shrink-0 md:pr-8 ${currentStep !== 1 ? 'hidden md:block' : 'block'} px-2 md:px-0`}>
              <div className="border-b border-slate-100 pb-2 mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">
                  {currentStep === 1 && <span className="md:hidden text-emerald-600 mr-2">01.</span>}
                  Informasi Akun
                </h4>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nama Lengkap</label>
                  <input
                    className="w-full p-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-all text-sm font-semibold"
                    value={formData.nama}
                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                  <input
                    className="w-full p-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-all text-sm font-semibold"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                  <input
                    type="password"
                    placeholder={currentUser ? "Kosongkan jika tidak diubah" : "Password Akun"}
                    className="w-full p-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition-all text-sm font-semibold"
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required={!currentUser}
                  />
                </div>
                <div className="space-y-1 pt-3 border-t border-slate-50 mt-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Level Akses</label>
                  <div className="flex gap-2">
                    {['client', 'admin'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: r })}
                        className={`flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${formData.role === r ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-100 text-slate-400'
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Divider (Desktop Only) */}
            <div className="hidden md:block w-px bg-slate-100 self-stretch" />

            {/* RIGHT SECTION / STEP 2 */}
            <div className={`md:flex-1 md:pl-8 ${currentStep !== 2 ? 'hidden md:block' : 'block'} mt-4 md:mt-0 px-0 md:px-0`}>
              <div className="border-b border-slate-100 pb-2 mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 px-1">
                  {currentStep === 2 && <span className="md:hidden text-emerald-600 mr-2">02.</span>}
                  Hak Akses Jabatan
                </h4>
              </div>

              <div className="border border-slate-100 rounded-xl bg-slate-50/30 overflow-hidden h-[280px] md:h-[310px] flex flex-col mb-4 w-full -mx-0">
                <div className="flex-1 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                  {Object.keys(rolesData).map(roleName => (
                    <div
                      key={roleName}
                      onClick={() => setRolesData({ ...rolesData, [roleName]: !rolesData[roleName] })}
                      className="flex items-center justify-between px-6 py-3 hover:bg-white cursor-pointer transition-all"
                    >
                      <span className="text-sm md:text-[10px] text-slate-600 uppercase font-bold tracking-wider">{roleName.replace(/_/g, ' ')}</span>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${rolesData[roleName] ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'bg-white border-slate-200'}`}>
                        {rolesData[roleName] && <FiCheck size={12} strokeWidth={4} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 mt-6 border-t border-slate-100 px-2 md:px-0">

            {/* MOBILE STEP 1: Batal & Lanjut */}
            <div className={`flex gap-3 md:hidden ${currentStep !== 1 ? 'hidden' : ''}`}>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setCurrentUser(null); }}
                className="flex-1 bg-white text-slate-400 py-4 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={(e) => {
                  const form = e.target.closest('form');
                  if (!form.reportValidity()) return;
                  setCurrentStep(2);
                }}
                className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
              >
                Lanjut
              </button>
            </div>

            {/* MOBILE STEP 2: Kembali & Simpan/Tambah */}
            <div className={`flex gap-3 md:hidden ${currentStep !== 2 ? 'hidden' : ''}`}>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 bg-white text-slate-400 py-4 rounded-xl font-black text-xs uppercase tracking-widest border border-slate-100"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
              >
                {currentUser ? 'Simpan' : 'Tambah'}
              </button>
            </div>

            {/* DESKTOP: Selalu tampil Simpan/Tambah + Batal */}
            <div className="hidden md:flex gap-3">
              <button
                type="submit"
                className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
              >
                {currentUser ? 'Simpan' : 'Tambah'}
              </button>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setCurrentUser(null); }}
                className="flex-1 bg-white text-slate-400 py-4 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
            </div>

          </div>
        </form>
      </Dialog>

      {/* --- DIALOG HAPUS --- */}
      <Dialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Hapus User" type="error" size="sm">
        <p className="text-slate-500 text-sm">Hapus permanen <span className="font-bold text-slate-900">{currentUser?.nama}</span>?</p>
        <div className="flex flex-col gap-2 mt-6">
          <button onClick={handleDelete} className="bg-rose-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Ya, Hapus</button>
          <button onClick={() => setIsDeleteOpen(false)} className="text-slate-400 font-bold text-xs uppercase py-2">Batal</button>
        </div>
      </Dialog>
    </div>
  );
};

export default Users;