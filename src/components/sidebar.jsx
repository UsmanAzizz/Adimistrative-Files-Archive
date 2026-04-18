import React, { useState } from 'react'; // Tambah useState
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'; // Tambah useScroll & useMotionValueEvent
import { NavLink, useNavigate } from 'react-router-dom'; 
import { FiHome, FiFolder, FiSettings, FiLogOut, FiUsers } from 'react-icons/fi';
import logoDafa from '../assets/vite.svg'; // Sesuaikan jumlah ../ dengan struktur folder Mas

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
      <aside className="hidden md:flex w-64 h-screen bg-slate-900 text-slate-300 flex-col fixed left-0 top-0 z-50 border-r border-slate-800">
  
  {/* HEADER LOGO */}
  <div className="p-6 flex items-center gap-3">
 <div className="relative w-10 h-10 bg-white rounded-[10px] flex items-center justify-center shadow-sm border border-emerald-400 overflow-hidden">
      <img 
        src={logoDafa} 
        alt="Logo DAFA" 
        className="w-6 h-6 object-contain" 
      />
    </div>
    <div>
      <h1 className="text-white font-bold leading-none tracking-tight">DAFA</h1>
      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold">
        Dipo Archive System
      </p>
    </div>
  </div>

  {/* NAVIGATION */}
<nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
  {filteredMenu.map((item) => (
    <NavLink 
      key={item.id} 
      to={item.path} 
      className="block no-underline group" // Group ini penting
    >
      {({ isActive }) => (
        <div className={`
          flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200
          ${isActive 
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
            : 'hover:bg-slate-800 hover:text-white'}
        `}>
          
          {/* PEMBUNGKUS IKON - Kita pakai varian motion di sini */}
          <motion.div
            variants={{
              hover: { scale: 1.3, rotate: 5 } // Membesar 30% saat group di-hover
            }}
            whileHover="hover"
            // Atau jika ingin otomatis membesar saat menu utamanya di-hover:
            initial={false}
            animate={isActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center justify-center"
          >
            <item.icon 
              className={`text-xl transition-colors duration-200 
                ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}
              `} 
            />
          </motion.div>

          <span className="text-sm font-bold">{item.label}</span>
        </div>
      )}
    </NavLink>
  ))}
</nav>

  {/* FOOTER / LOGOUT */}
 <div className="p-4 border-t border-slate-100/50">
    <button 
        onClick={handleLogout} 
        className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 transition-all duration-300 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98] relative overflow-hidden"
    >
        {/* Ikon dengan animasi rotasi tipis saat hover */}
        <FiLogOut className="text-xl transition-transform duration-300 group-hover:-translate-x-1 group-hover:scale-110" />
        
        {/* Teks dengan tracking luas agar konsisten dengan Nav */}
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Keluar Aplikasi
        </span>

        {/* Efek Garis Samping (Indicator) yang muncul saat hover */}
        <div className="absolute left-0 w-1 h-0 bg-rose-500 transition-all duration-300 group-hover:h-1/2" />
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
    <div className="relative flex items-center justify-center w-12 h-12">
      
      {/* PEMBUNGKUS BACKGROUND (Tetap Lingkaran) */}
      {isActive && (
        <motion.div 
          layoutId="navActive" 
          className="absolute inset-0 bg-emerald-600/20 rounded-full" 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      
      {/* IKON DENGAN EFEK SCALE */}
      <motion.div 
        className="relative z-10 flex flex-col items-center"
        // Efek saat kursor di atas ikon
        whileHover={{ scale: 1.2 }} 
        // Efek saat ikon diklik (opsional, biar mantul)
        whileTap={{ scale: 0.9 }}
        // Efek transisi halus
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <item.icon 
          size={22} 
          className={`transition-colors duration-300 ${isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`} 
        />
      </motion.div>
      
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