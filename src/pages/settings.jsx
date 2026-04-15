import React, { useState, useEffect } from 'react';
import { 
  FiSettings, FiPlus, FiTrash2, FiEdit3, 
  FiSave, FiDatabase, FiGrid 
} from 'react-icons/fi';
import axios from 'axios';
import Card from '../components/card';
import Dialog from '../components/dialog';

const SettingsPage = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // --- STATES ---
  const [globalData, setGlobalData] = useState({ active_tahun_pelajaran: '' });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [isEditColOpen, setIsEditColOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [editCol, setEditCol] = useState({ oldName: '', newName: '' });

  // --- LOGIC: FETCH DATA ---
  const fetchData = async () => {
    try {
      const [globalRes, accessRes] = await Promise.all([
        axios.get(`${API_URL}api/global`),
        axios.get(`${API_URL}api/define-access`)
      ]);
      setGlobalData(globalRes.data.data);
      
      const accessData = accessRes.data.data;
      if (accessData.length > 0) {
        // Ambil nama kolom secara dinamis kecuali user_id
        setAvailableRoles(Object.keys(accessData[0]).filter(key => key !== 'user_id'));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIC: FORMATTING ---
  const formatString = (str) => str.toLowerCase().trim().replace(/\s+/g, '_');

  // --- ACTIONS ---
  const handleUpdateTAPEL = async () => {
    try {
      await axios.put(`${API_URL}api/global`, globalData);
      alert("Tahun Pelajaran berhasil diperbarui.");
    } catch (err) {
      alert("Gagal memperbarui TAPEL.");
    }
  };

  const handleAddColumn = async () => {
    if (!newColName) return;
    try {
      await axios.post(`${API_URL}api/define-access/column`, { 
        name: formatString(newColName) 
      });
      setIsColModalOpen(false);
      setNewColName('');
      fetchData();
    } catch (err) {
      alert("Gagal menambah kolom jabatan.");
    }
  };

  const handleRenameColumn = async () => {
    try {
      await axios.put(`${API_URL}api/define-access/column`, {
        oldName: editCol.oldName,
        newName: formatString(editCol.newName)
      });
      setIsEditColOpen(false);
      fetchData();
    } catch (err) {
      alert("Gagal mengubah nama kolom.");
    }
  };

  const handleDeleteColumn = async (name) => {
    if (!window.confirm(`HAPUS KOLOM "${name}"?\nIni akan menghapus seluruh data akses terkait untuk semua user.`)) return;
    try {
      await axios.delete(`${API_URL}api/define-access/column/${name}`);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus kolom.");
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse tracking-widest uppercase">Initializing Schema...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 select-none">
      
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

      {/* SECTION 1: TAHUN PELAJARAN */}
      <Card className="p-8 border-none bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FiSettings size={18}/></div>
              <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Active Academic Year</h2>
            </div>
            <select 
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              value={globalData.active_tahun_pelajaran}
              onChange={(e) => setGlobalData({...globalData, active_tahun_pelajaran: e.target.value})}
            >
              <option value="2024/2025">TAPEL 2024 / 2025</option>
              <option value="2025/2026">TAPEL 2025 / 2026</option>
              <option value="2026/2027">TAPEL 2026 / 2027</option>
            </select>
          </div>
          <button 
            onClick={handleUpdateTAPEL}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all h-[58px] shadow-lg shadow-slate-200"
          >
            <FiSave className="inline mr-2" /> Save Config
          </button>
        </div>
      </Card>

      {/* SECTION 2: MASTER HAK AKSES (KOLOM) */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2">
            <FiGrid className="text-emerald-500" /> Master Schema Roles
          </h2>
          <button 
            onClick={() => setIsColModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100"
          >
            <FiPlus size={16} /> Add Role
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRoles.map(role => (
            <div key={role} className="flex items-center justify-between bg-white p-5 rounded-3xl border-2 border-slate-50 shadow-sm group hover:border-emerald-200 transition-all">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  {role.replace(/_/g, ' ')}
                </span>
                <p className="text-[9px] text-slate-400 font-mono mt-1 italic">db_field: {role}</p>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => { setEditCol({ oldName: role, newName: role.replace(/_/g, ' ') }); setIsEditColOpen(true); }}
                  className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <FiEdit3 size={16}/>
                </button>
                <button 
                  onClick={() => handleDeleteColumn(role)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <FiTrash2 size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* ADD COLUMN */}
      <Dialog isOpen={isColModalOpen} onClose={() => setIsColModalOpen(false)} title="New Role Column">
        <div className="space-y-6 pt-4 px-2 text-center">
          <input 
            className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] font-black text-slate-900 outline-none focus:border-emerald-500 transition-all text-center uppercase"
            placeholder="Role Name (e.g. Waka)..."
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
          />
          <button 
            onClick={handleAddColumn}
            className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-100"
          >
            Execute Schema Change
          </button>
        </div>
      </Dialog>

      {/* EDIT/RENAME COLUMN */}
      <Dialog isOpen={isEditColOpen} onClose={() => setIsEditColOpen(false)} title="Rename Role">
        <div className="space-y-6 pt-4 px-2 text-center">
          <input 
            className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] font-black text-slate-900 outline-none focus:border-emerald-500 transition-all text-center uppercase"
            value={editCol.newName}
            onChange={(e) => setEditCol({...editCol, newName: e.target.value})}
          />
          <button 
            onClick={handleRenameColumn}
            className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100"
          >
            Confirm Rename
          </button>
        </div>
      </Dialog>

    </div>
  );
};

export default SettingsPage;