# DAFA (Administrative Files Archive) - Project Context & Documentation

*File ini adalah dokumentasi komprehensif (master-file) dari proyek DAFA. Anda dapat mengunggah (upload) file ini ke AI manapun (ChatGPT, Claude, dll) untuk memberikan konteks utuh tentang sistem ini sebelum Anda meminta bantuan (seperti meminta perbaikan kode, penambahan fitur, atau pembuatan kueri database).*

---

## 1. Project Overview
**DAFA (Administrative Files Archive)** adalah sistem informasi berbasis web yang dirancang untuk mengelola dan mendigitalisasi arsip dokumen di lingkungan institusi akademik/sekolah. Sistem ini menggunakan arsitektur **Role-Based Access Control (RBAC)** yang membatasi hak akses folder dan dokumen sesuai dengan jabatan spesifik setiap pegawai (contoh: Kepala Sekolah, Waka Kurikulum, Bendahara, dll).

## 2. Tech Stack (Teknologi yang Digunakan)
Proyek ini mengadaptasi variasi MERN stack, namun mengganti MongoDB dengan basis data relasional (MySQL):
- **Frontend**: React.js 19, Vite, Tailwind CSS v4, Framer Motion, React Router DOM v7, Vite PWA (Progressive Web Apps).
- **Backend**: Node.js, Express.js 4.
- **Database**: MySQL (menggunakan *driver* `mysql2`).
- **Security & Auth**: JWT (`jsonwebtoken`), `bcryptjs`, HTTP-Only Cookies.
- **File Handling**: `multer` (untuk upload file langsung ke direktori fisik), `archiver` (untuk melakukan zipping folder secara dinamis saat didownload).

---

## 3. Database Schema (MySQL)

Sistem ini memiliki tabel-tabel utama berikut:

1. **`users`**: Tabel master akun.
   - Kolom: `id` (PK), `nama`, `username` (UNIQUE), `password` (bcrypt hash), `role` (ENUM: 'admin', 'client'), `created_at`.
2. **`client_access`**: Tabel pemetaan hak jabatan untuk spesifik Client. Memiliki relasi *One-to-One* ke `users.id` (dengan *Cascade Delete*).
   - Kolom: `user_id` (PK, FK), dan serangkaian *boolean flag* (contoh: `kepsek`, `waka_kurikulum`, `bendahara`, `tu`, `wali_kelas`, dll). Jika nilainya TRUE/1, maka user tersebut memegang jabatan tersebut.
3. **`tahun_akademik`**: Mencatat semua tahun pelajaran (contoh: "2025/2026").
   - Kolom: `id` (PK), `ta` (UNIQUE).
4. **`global_settings`**: Tabel *singleton* (selalu ID=1) untuk melacak status global aplikasi.
   - Kolom: `id` (PK), `active_tahun_pelajaran` (menyimpan string `ta` yang sedang aktif).
5. **`archives`**: Menyimpan meta-data dari file arsip atau struktur folder.
   - Kolom: `id` (PK), `name` (nama file/folder), `isFolder` (boolean), `size`, `tapel` (mengikat arsip ke tahun pelajaran tertentu), `jabatan` (menandai folder ini milik divisi mana), `parent_path` (teks *path* yang menunjukkan lokasi di dalam direktori penyimpanan fisik).

**Logika Pembagian Akses & Tahun Pelajaran (Krusial):**
1. **Filter Tahun Pelajaran (Tapel):** Admin mengatur satu `active_tahun_pelajaran` di tabel `global_settings`. Seluruh aktivitas pengambilan (SELECT) data arsip oleh Client *wajib* hanya memunculkan data di mana `archives.tapel` sama dengan `global_settings.active_tahun_pelajaran`. Arsip tahun lalu tetap tersimpan di database, tapi *hidden* dari dasbor Client.
2. **Filter Jabatan Client:** Seorang *Client* hanya bisa melihat atau mengunduh arsip jika kolom `archives.jabatan` COCOK dengan *flag* pada tabel `client_access` (misal kolom `kepsek`, `tu`) yang bernilai TRUE/1 milik *Client* tersebut.
3. **Jabatan Rangkap:** Karena `client_access` menggunakan banyak kolom boolean (bukan sekadar 1 enum role), satu pengguna bisa memiliki banyak jabatan sekaligus (misal menjabat Waka Kurikulum dan Guru Piket secara bersamaan). Backend harus merespons (biasanya via klausa logika OR) dengan menggabungkan arsip-arsip yang berhak dilihat pengguna tersebut.

---

## 4. Backend Architecture
Backend bertanggung jawab penuh atas manajemen logika dan berkas fisik:
- **Routing**: API dipisahkan untuk Auth (`/auth`), Akses Arsip (`/archives`), Manajemen User (`/users`), dan Pengaturan Sistem (`/settings`).
- **Middleware Proteksi**: Menggunakan pembedahan token JWT yang dikirimkan melalui *cookie*. Terdapat middleware pengecek apakah pengguna adalah Admin (untuk operasi *Create, Update, Delete* keseluruhan) atau sekadar Client.
- **Zipping (Archiver)**: Saat pengguna meminta unduh sebuah "Folder", backend tidak mengemasnya lalu menyimpannya di disk. Sebaliknya, `archiver` melakukan kompresi rekursif pada struktur fisik folder tersebut menjadi format `.zip` dan melemparnya langsung sebagai *Response Stream* kepada peramban (browser) pengguna.

---

## 5. Frontend UI/UX
Frontend didesain sebagai Single Page Application (SPA):
- Memiliki dua bentuk Dashboard yang terisolasi: **Admin Dashboard** (untuk kelola user, atur tahun pelajaran, dan atur seluruh hierarki folder) dan **Client Dashboard** (untuk eksplorasi dan unduh dokumen sesuai jabatan).
- Navigasi arsip menggunakan pola **Breadcrumb**, memfasilitasi penelusuran *deep directory* tanpa perlu me-*reload* keseluruhan halaman (state reaktif pada React `useEffect`).
- Dilengkapi dengan *micro-interactions* (Framer Motion) untuk membuat transisi tabel arsip terasa lebih luwes (*fluid*).

---

## 6. How to help (Instruksi untuk AI)
Jika saya (User) meminta bantuan terkait proyek ini:
1. Bacalah seluruh konteks arsitektur di atas.
2. Ingat bahwa kami menggunakan **MySQL**, bukan MongoDB/Mongoose. Gunakan sintaks kueri SQL biasa atau SQL wrapper (`mysql2/promise`).
3. Selalu perhatikan aturan *Role-Based Access Control* (RBAC) kami setiap kali saya meminta perbaikan API *endpoint*.
4. Frontend menggunakan Tailwind v4, jadi jangan berikan konfigurasi `tailwind.config.js` versi lawas jika tidak diminta.
5. Posisikan jawaban Anda fokus pada struktur DAFA di atas.
