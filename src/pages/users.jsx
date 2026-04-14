import { useState, useEffect } from 'react';
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiShield, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Dialog from '../components/dialog';


const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ nama: '', username: '', password: '', role: 'client' });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      currentUser 
        ? await axios.put(`/api/users/${currentUser.id}`, formData) 
        : await axios.post('/api/users', formData);
      setIsModalOpen(false);
      fetchUsers();
      resetForm();
    } catch (err) { alert("Gagal menyimpan data"); }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${currentUser.id}`);
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err) { alert("Gagal menghapus user"); }
  };

  const resetForm = () => {
    setFormData({ nama: '', username: '', password: '', role: 'client' });
    setCurrentUser(null);
  };

 // Cari baris ini di kode kamu:
// const filteredUsers = users.filter(u => u.nama?.toLowerCase().includes(searchTerm.toLowerCase()));

// Ubah menjadi seperti ini:
const filteredUsers = users
  .filter(u => u.nama?.toLowerCase().includes(searchTerm.toLowerCase()))
  .sort((a, b) => {
    // Jika a adalah admin dan b bukan, a naik ke atas (-1)
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    // Jika b adalah admin dan a bukan, b naik ke atas (1)
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    // Jika role sama, urutkan berdasarkan nama secara alfabetis (opsional)
    return a.nama.localeCompare(b.nama);
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
<div className="max-w-6xl mx-auto space-y-4 font-sans pb-20 px-4 pt-2">
  {/* Header & Search Bar Row */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    
    {/* Search Bar (Kiri) */}
   <div className="relative w-full md:max-w-md">
  <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-black" size={20} />
  
  <input 
    type="text" 
    placeholder="Cari user..."
    className="
      w-full pl-16 pr-6 py-4 
      bg-white 
      /* Border ditebalkan sedikit ke tingkat 2 */
      border-2 border-slate-300
      rounded-2xl 
      outline-none 
      text-black 
      font-bold
      /* Shadow dipertegas volumenya tapi tetap soft (white/20) */
      shadow-xl shadow-white/20
      focus:border-black
      transition-all
    "
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

    {/* Tombol Tambah (Kanan) */}
    <button 
      onClick={() => { resetForm(); setIsModalOpen(true); }}
      className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-slate-200 whitespace-nowrap"
    >
      <FiUserPlus size={20} />
      <span>Tambah User Baru</span>
    </button>
    
  </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-800 uppercase tracking-widest">Nama User</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-800 uppercase tracking-widest">Akses</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-800 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="3" className="text-center py-20 text-emerald-600 font-bold animate-pulse text-xs tracking-tighter">LOADING DATA...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-20 text-slate-300 italic">Data kosong</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold text-xs group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                          {user.nama.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.nama}</p>
                          <p className="text-xs text-slate-400 font-medium italic">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {user.role === 'admin' ? <FiShield size={12} /> : <FiUser size={12} />}
                        {user.role}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setCurrentUser(user); setFormData({ ...user, password: '' }); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-emerald-600 rounded-lg transition-all"><FiEdit2 size={16}/></button>
                        <button onClick={() => { setCurrentUser(user); setIsDeleteOpen(true); }} className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-all"><FiTrash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
 </div>
      {/* --- MENGGUNAKAN KOMPONEN DIALOG UNTUK FORM --- */}
      <Dialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentUser ? 'Edit User' : 'User Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="w-full space-y-4 mt-4">
          <input 
            placeholder="Nama Lengkap" 
            className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-sm" 
            value={formData.nama} 
            onChange={(e) => setFormData({...formData, nama: e.target.value})} 
            required 
          />
          <div className="grid grid-cols-2 gap-3">
            <input 
              placeholder="Username" 
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" 
              value={formData.username} 
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
              required 
            />
            <select 
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm cursor-pointer" 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <input 
            type="password" 
            placeholder={currentUser ? "Password (opsional)" : "Password"} 
            className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required={!currentUser} 
          />
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all mt-2">
            Simpan Data
          </button>
        </form>
      </Dialog>

      {/* --- MENGGUNAKAN KOMPONEN DIALOG UNTUK KONFIRMASI HAPUS --- */}
      <Dialog 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        title="Konfirmasi Hapus"
        type="error"
        size="sm"
      >
        <p className="text-slate-400 text-sm">
          Apakah Anda yakin ingin menghapus <span className="text-slate-900 font-bold">{currentUser?.nama}</span>?
        </p>
        <div className="flex flex-col gap-2 w-full mt-6">
          <button onClick={handleDelete} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Ya, Hapus</button>
          <button onClick={() => setIsDeleteOpen(false)} className="w-full py-4 text-slate-400 font-bold text-xs uppercase">Batal</button>
        </div>
      </Dialog>
    </div>
  );
};

export default Users;