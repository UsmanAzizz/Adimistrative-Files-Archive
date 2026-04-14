import { useState, useEffect } from 'react';
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiShield, FiUser, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import Dialog from '../components/dialog';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessColumns, setAccessColumns] = useState([]);

  const [formData, setFormData] = useState({ 
    nama: '', username: '', password: '', role: 'client',
    tahun_pelajaran: '' 
  });
  const [rolesData, setRolesData] = useState({});

  const fetchUsers = async () => {
  setLoading(true);
  try {
    // 1. Ambil data Global & Users secara bersamaan (Parallel)
    const [resUsers, resGlobal] = await Promise.all([
      axios.get('/api/users'),
      axios.get('/api/global')
    ]);

    // 2. Set Data Users
    const usersData = Array.isArray(resUsers.data) ? resUsers.data : [];
    setUsers(usersData);

    // 3. Set Tahun Pelajaran dari Tabel Global
    if (resGlobal.data.status === 'success') {
      const globalData = resGlobal.data.data;
      setFormData(prev => ({ 
        ...prev, 
        tahun_pelajaran: globalData.active_tahun_pelajaran 
      }));
    }

    // 4. Set Kolom Akses (tetap ambil dari struktur tabel users/client_access)
    // Kita gunakan data pertama jika ada untuk mapping kolom dinamis
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

  // --- FIX: Pastikan handleDelete didefinisikan sebelum return ---
  const handleDelete = async () => {
    if (!currentUser) return;
    try {
      await axios.delete(`/api/users/${currentUser.id}`);
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err) { 
      console.error(err);
      alert("Gagal menghapus user"); 
    }
  };

  const handleOpenAdd = () => {
    setCurrentUser(null);
    setFormData({ nama: '', username: '', password: '', role: 'client', tahun_pelajaran: formData.tahun_pelajaran });
    const initialRoles = {};
    accessColumns.forEach(col => { initialRoles[col] = false; });
    setRolesData(initialRoles);
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
    setIsModalOpen(true);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    let targetId = currentUser?.id;

    if (currentUser) {
      await axios.put(`/api/users/${targetId}`, formData);
    } else {
      const resUser = await axios.post('/api/users', formData);
      
      // DEBUG: Lihat di console browser, apa isi resUser.data?
      console.log("Response dari Backend:", resUser.data);

      // Ambil ID (Coba beberapa kemungkinan properti yang umum)
      targetId = resUser.data.id || resUser.data.insertId || resUser.data.data?.id;
    }

    // Jika targetId masih kosong, kita hentikan proses sebelum menembak API akses
    if (!targetId) {
      alert("ID User tidak ditemukan di response server. Cek Console Browser!");
      return;
    }

    // Lanjut simpan akses
    await axios.put('/api/define-access/update', {
      user_id: targetId,
      nama: formData.nama,
      tahun_pelajaran: formData.tahun_pelajaran,
      ...rolesData
    });

    setIsModalOpen(false);
    fetchUsers();
    alert("Berhasil disimpan!");
  } catch (err) {
    console.error("Submit Error:", err);
    alert("Terjadi kesalahan: " + (err.response?.data?.message || err.message));
  }
};

  const filteredUsers = users
    .filter(u => u.nama?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.role === 'admin' ? -1 : 1);

  return (
    <div className="min-h-screen bg-slate-50/50 p-0 pt-0">
      <div className="max-w-6xl mx-auto space-y-6">
   <div className="min-h-screen bg-slate-50/50 p-0 pt-0">
  <div className="max-w-6xl mx-auto space-y-6">
    {/* Header Section */}
    <div>
      <h1 className="text-4xl font-black text-slate-900">
        Manajemen <span className="text-emerald-600">User</span>
      </h1>
      <p className="text-slate-400 text-xs font-bold tracking-widest mt-1 uppercase">
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

    {/* Table Section */}
    <div className="bg-white rounded-[1rem] shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead>
         <tr className="bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-100">
  <th className="px-8 py-4 first:rounded-tl-2xl">Nama Pengguna</th>
  <th className="px-8 py-4 text-center last:rounded-tr-2xl">Aksi</th>
</tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filteredUsers.map(u => (
            <tr key={u.id} onClick={() => handleOpenEdit(u)} className="cursor-pointer hover:bg-slate-50/50 group transition-all">
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {u.nama ? u.nama.substring(0, 2).toUpperCase() : '??'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{u.nama}</p>
                    <p className="text-xs text-slate-400 font-bold">@{u.username} • <span className="uppercase text-emerald-500">{u.role}</span></p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 text-center">
                  <button onClick={(e) => { e.stopPropagation(); setCurrentUser(u); setIsDeleteOpen(true); }} className="p-3 text-slate-300 hover:text-rose-500 transition-all">
                    <FiTrash2 size={18} />
                  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
      </div>

      {/* --- DIALOG EDIT / TAMBAH --- */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentUser ? 'Profil User' : 'Tambah User Baru'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">
    Informasi Dasar
  </label>
  
  <div className="space-y-3">
    <input 
      placeholder="Nama Lengkap" 
      className="w-full p-4 px-6 bg-slate-50 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition-all" 
      value={formData.nama} 
      onChange={e => setFormData({...formData, nama: e.target.value})} 
      required 
    />
    
    <input 
      placeholder="Username" 
      className="w-full p-4 px-6 bg-slate-50 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition-all" 
      value={formData.username} 
      onChange={e => setFormData({...formData, username: e.target.value})} 
      required 
    />
    
    <input 
      type="password" 
      placeholder={currentUser ? "Password (Opsional)" : "Password"} 
      className="w-full p-4 px-6 bg-slate-50 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition-all" 
      onChange={e => setFormData({...formData, password: e.target.value})} 
      required={!currentUser} 
    />

    {/* Ganti Select ke Input Tiles */}
    <div className="flex gap-3 mt-2">
      {['client', 'admin'].map((role) => (
        <label 
          key={role}
          className={`
            flex-1 flex items-center justify-center py-4 rounded-[2rem] cursor-pointer
            font-black text-xs uppercase tracking-widest transition-all border-2
            ${formData.role === role 
              ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
              : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}
          `}
        >
          <input
            type="radio"
            className="hidden"
            name="role"
            value={role}
            checked={formData.role === role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
          {role}
        </label>
      ))}
    </div>
  </div>
</div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hak Akses Jabatan</label>
              <div className="grid grid-cols-1 gap-2 max-h-[270px] overflow-y-auto pr-2">
                {Object.keys(rolesData).map(roleName => (
                  <div 
                    key={roleName} 
                    onClick={() => setRolesData({...rolesData, [roleName]: !rolesData[roleName]})}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border-2 transition-all ${rolesData[roleName] ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-400'}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider">{roleName.replace(/_/g, ' ')}</span>
                    {rolesData[roleName] && <FiCheck className="text-emerald-500" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
<button 
  type="button" 
  onClick={() => {
    setIsModalOpen(false);
    setCurrentUser(null);
  }} 
  className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 active:scale-95"
>
  Batalkan
</button>
  
  <button 
    type="submit" 
    className="flex-[2] bg-slate-900 text-white py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-900/10 transition-all active:scale-95"
  >
    {currentUser ? 'Simpan Perubahan' : 'Buat User Baru'}
  </button>
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