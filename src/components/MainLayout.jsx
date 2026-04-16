import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './sidebar';

function MainLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // UBAH: Cek 'user_info', bukan 'token'
    const userInfo = localStorage.getItem('user_info');
    
    if (!userInfo) {
      // Jika tidak ada data user, baru lempar ke login
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar tetap fixed */}
      <Sidebar />

      {/* Konten Utama */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-w-0 transition-all duration-300">
        <main className="p-4 md:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;