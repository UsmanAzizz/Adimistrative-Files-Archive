import React, { useState } from 'react'; // Tambah useState
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'; // Tambah useScroll & useMotionValueEvent
import { NavLink, useNavigate } from 'react-router-dom'; 
import { FiHome, FiFolder, FiSettings, FiLogOut, FiUsers } from 'react-icons/fi';


const Sidebar = () => {
 const navigate = useNavigate();
  const [hidden, setHidden] = useState(false); // State untuk kontrol sembunyi/tampil
  const { scrollY } = useScroll();

  // Logika memantau arah scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    // Jika scroll ke bawah lebih dari 50px dan sedang tidak di atas sendiri
    if (latest > previous && latest > 50) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });
  
  // 1. Ambil data user dari localStorage
  const userInfo = JSON.parse(localStorage.getItem('user_info'));
  const userRole = userInfo?.role; // Asumsi value-nya: 'admin', 'user', dll.

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { id: 'archives', label: 'Arsip Dokumen', icon: FiFolder, path: '/archives' },
    // 2. Filter menu berdasarkan role
    { id: 'users', label: 'Manajemen User', icon: FiUsers, path: '/users', adminOnly: true },
    { id: 'settings', label: 'Pengaturan', icon: FiSettings, path: '/settings', adminOnly: true },
  ];

  // 3. Fungsi filter untuk menentukan menu mana yang tampil
  const filteredMenu = menuItems.filter(item => {
    if (item.adminOnly) {
      return userRole === 'admin';
    }
    return true;
  });

  const handleLogout = () => {
    // Gunakan removeItem agar lebih spesifik atau tetap clear() jika ingin membersihkan semua
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 h-screen bg-slate-900 text-slate-300 flex-col fixed left-0 top-0 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
            D
          </div>
          <div>
            <h1 className="text-white font-bold leading-none">DAFA</h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold">
              Dipo Archive System
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {/* Gunakan filteredMenu di sini */}
          {filteredMenu.map((item) => (
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

      {/* MOBILE BOTTOM NAV */}
   {/* MOBILE BOTTOM NAV */}
<motion.nav 
  variants={{
    visible: { y: 0, opacity: 1 },
    hidden: { y: 100, opacity: 0 }
  }}
  initial="visible"
  animate={hidden ? "hidden" : "visible"}
  transition={{ duration: 0.3, ease: "easeOut" }}
  className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-lg border border-slate-800 h-16 rounded-[2rem] z-[100] flex justify-around items-center px-2 shadow-2xl"
>
  {filteredMenu.map((item) => (
    <NavLink key={item.id} to={item.path} className="relative flex-1 flex justify-center">
      {({ isActive }) => (
        <div className="relative flex items-center justify-center w-12 h-12"> {/* Container dikunci ukurannya */}
          
          {/* PEMBUNGKUS LINGKARAN */}
          {isActive && (
            <motion.div 
              layoutId="navActive" 
              className="absolute inset-0 bg-emerald-600/20 rounded-full" 
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          
          {/* IKON */}
          <div className="relative z-10 flex flex-col items-center">
            <item.icon size={22} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
            {/* Titik kecil opsional, kalau mau benar-benar bersih bisa dihapus */}
            {/* {isActive && <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1" />} */}
          </div>
          
        </div>
      )}
    </NavLink>
  ))}
  
  <button onClick={handleLogout} className="flex-1 text-rose-500/60 flex justify-center items-center">
    <FiLogOut size={22} />
  </button>
</motion.nav>
    </>
  );
};

export default Sidebar;