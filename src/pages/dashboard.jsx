import { FiFileText, FiUploadCloud, FiUsers, FiClock } from 'react-icons/fi';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  const stats = [
    { label: 'Total Arsip', value: '1,284', icon: FiFileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Upload Bulan Ini', value: '42', icon: FiUploadCloud, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'User Aktif', value: '12', icon: FiUsers, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header Section */}
    {/* Header - Center di mobile, Left di desktop */}
        <header className="mb-5 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Ringkasan <span className="text-emerald-600">Data</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Sistem Manajemen Arsip Digital DAFA.</p>
        </header>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`text-2xl ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content: Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <FiClock className="text-emerald-500" /> Aktivitas Terakhir
            </h2>
            <button className="text-xs font-bold text-emerald-600 hover:underline">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Dokumen</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: 'SK_Kelulusan_2026.pdf', cat: 'Kurikulum', date: '2 jam yang lalu' },
                  { name: 'Laporan_UKK_TKJ.docx', cat: 'Uji Kompetensi', date: '5 jam yang lalu' },
                  { name: 'Inventaris_Lab_RPL.xlsx', cat: 'Sarpras', date: 'Kemarin' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{row.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase">
                        {row.cat}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Info Card */}
        <div className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-600/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-xl font-bold leading-tight">Siap untuk mengarsipkan dokumen baru?</h2>
            <p className="text-emerald-100 text-sm mt-3 opacity-80 leading-relaxed">
              Pastikan dokumen dalam format PDF atau gambar yang jelas untuk kemudahan pencarian otomatis.
            </p>
          </div>
          <button className="relative z-10 mt-8 bg-white text-emerald-600 font-bold py-3 px-6 rounded-xl text-sm shadow-lg hover:bg-emerald-50 transition-colors active:scale-95">
            Mulai Upload
          </button>
          {/* Efek dekorasi background */}
          <FiFileText className="absolute -bottom-10 -right-10 text-[12rem] text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;