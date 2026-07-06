import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import Header from './Header';

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
    <div className="flex h-screen overflow-hidden bg-slate-100/50">
      {/* Sidebar tetap fixed */}
      <Sidebar />

      {/* Konten Utama */}
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-w-0 transition-all duration-300">
        <main className="px-4 pb-0 pt-0 md:pr-8 md:pl-2 md:pb-0 md:pt-0 flex-1 flex flex-col min-h-0">
          <Header />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
