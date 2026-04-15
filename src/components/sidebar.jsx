import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom'; 
import { FiHome, FiFolder, FiSettings, FiLogOut, FiFileText, FiUsers } from 'react-icons/fi';

const Sidebar = () => {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { id: 'archives', label: 'Arsip Dokumen', icon: FiFolder, path: '/archives' },
    { id: 'users', label: 'Manajemen User', icon: FiUsers, path: '/users' },
    // { id: 'reports', label: 'Laporan Tahunan', icon: FiFileText, path: '/reports' },
    { id: 'settings', label: 'Pengaturan', icon: FiSettings, path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* DESKTOP SIDEBAR: Lebar Fix w-64 */}
      <aside className="hidden md:flex w-64 h-screen bg-slate-900 text-slate-300 flex-col fixed left-0 top-0 z-50">
       <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
          D
        </div>
        <div>
          <h1 className="text-white font-bold leading-none">DAFA</h1>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold">
           Dipo  Archive System
          </p>
        </div>
      </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink key={item.id} to={item.path} className="block no-underline">
              {({ isActive }) => (
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}>
                  <item.icon className="text-xl" />
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-500/10 font-bold text-sm">
            <FiLogOut className="text-xl" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV: Floating & No Text */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-lg border border-slate-800 h-16 rounded-[2rem] z-[100] flex justify-around items-center px-2 shadow-2xl">
        {menuItems.map((item) => (
          <NavLink key={item.id} to={item.path} className="relative flex-1 flex justify-center">
            {({ isActive }) => (
              <div className="relative flex flex-col items-center">
                {isActive && (
                  <motion.div layoutId="navActive" className="absolute -inset-3 bg-emerald-600/20 rounded-2xl" />
                )}
                <item.icon size={22} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                {isActive && <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1" />}
              </div>
            )}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="flex-1 text-rose-500/60 flex justify-center"><FiLogOut size={22} /></button>
      </nav>
    </>
  );
};

export default Sidebar;