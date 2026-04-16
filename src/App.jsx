import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Users from './pages/users';
import ArchivePage from './pages/archive/archivePage';
import MainArchive from './pages/archive/mainArchive';
import ArchivePath from './pages/archive/archivePath'; // 1. Impor komponen ArchivePath
import Settings from './pages/settings';

function App() {

  const baseName = import.meta.env.VITE_ROUTER_BASE || '/';
  return (
    
    // BENAR
<Router basename={baseName}>
      <Routes>
        {/* Rute Publik */}
        <Route path="/login" element={<Login />} />

        {/* Rute Terproteksi (Dalam Layout Utama) */}
        <Route element={<MainLayout />}>
          {/* Dashboard Utama */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Manajemen User */}
          <Route path="/users" element={<Users />} />

          {/* --- Manajemen Arsip --- */}
          {/* Halaman 1: Daftar Tahun Pelajaran */}
          <Route path="/archives" element={<ArchivePage />} />

          {/* Halaman 2: Daftar Jabatan/Folder (Berdasarkan Tahun) */}
          <Route path="/archive/:tapel" element={<MainArchive />} />


          <Route path="/archive/:tapel/:jabatan/*" element={<ArchivePath />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

          {/* Rute Lainnya */}
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