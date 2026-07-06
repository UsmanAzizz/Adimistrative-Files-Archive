import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const userName = userInfo?.name || 'User';

  let title = <>Dashboard</>;
  let subtitle = "Selamat datang di Dipo Archive System";

  // Hide header for dashboard and deep archive paths
  const pathParts = location.pathname.split('/').filter(Boolean);
  if (location.pathname.startsWith('/dashboard') || (pathParts[0] === 'archive' && pathParts.length >= 3)) {
    return null;
  }

  if (location.pathname.startsWith('/archives') || location.pathname.startsWith('/archive')) {
    title = <>Arsip <span className="text-emerald-600">Dokumen</span></>;
    subtitle = "Manajemen Berkas & Folder";
  } else if (location.pathname.startsWith('/users')) {
    title = <>Manajemen <span className="text-emerald-600">User</span></>;
    subtitle = "Daftar Pengguna & Hak Akses";
  } else if (location.pathname.startsWith('/settings')) {
    title = <>Pengaturan <span className="text-emerald-600">Sistem</span></>;
    subtitle = "Konfigurasi Global & Skema Jabatan";
  }

  return (
    <div className="w-full flex justify-between items-end pb-6 pt-2 md:pt-4 bg-transparent z-10 shrink-0 select-none">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-400 text-[10px] font-bold tracking-widest mt-1.5 uppercase">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default Header;
