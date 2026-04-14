import { motion } from 'framer-motion';
import { FiSearch, FiBell, FiChevronDown } from 'react-icons/fi';

const Navbar = ({ user = { name: 'Admin Dipo', role: 'System Administrator' } }) => {
  return (
    <nav className="h-20 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border-b border-slate-50">
      
      {/* Full Width Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300" size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Cari file, nomor surat, atau kategori arsip..."
            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all duration-300 outline-none text-sm text-slate-700 font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Modern User Section */}
      <div className="flex items-center gap-4 ml-8">
        
       

        {/* User Profile Card */}
     {/* User Profile - Ultra Simple Version */}
<motion.div 
  whileHover={{ opacity: 0.8 }}
  className="flex items-center gap-3 cursor-pointer group ml-4"
>
  <div className="text-right hidden sm:block">
    <p className="text-sm font-bold text-slate-800 leading-none">
      {user.name}
    </p>
    <p className="text-[10px] text-emerald-600 font-medium mt-1 uppercase tracking-wider">
      {user.role}
    </p>
  </div>

  {/* Avatar Simple (Tanpa Shadow Berat) */}
  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-sm">
    {user.name.split(' ').map(n => n[0]).join('')}
  </div>

</motion.div>

      </div>
    </nav>
  );
};

export default Navbar;