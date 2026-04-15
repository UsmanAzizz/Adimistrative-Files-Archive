import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Users from './pages/users';
import ArchivePage from './pages/archive/archivePage'; // Pastikan path file ArchivePage benar
import Settings from './pages/settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik */}
        <Route path="/login" element={<Login />} />

        {/* Rute Terproteksi (Dalam Layout Utama) */}
        <Route element={<MainLayout />}>
          {/* Dashboard Utama */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Manajemen User */}
          <Route path="/users" element={<Users />} />
          
          {/* Manajemen Arsip - Menggunakan halaman yang baru dibuat */}
          <Route path="/archives" element={<ArchivePage />} />
          
          {/* Placeholder untuk rute lain agar navigasi tidak pecah */}
          <Route path="/reports" element={<div className="p-8">Halaman Laporan Tahunan (Coming Soon)</div>} />
           <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Redirect default ke dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Fallback rute jika halaman tidak ditemukan (404) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;