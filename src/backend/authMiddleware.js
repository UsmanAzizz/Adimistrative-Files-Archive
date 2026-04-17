// backend/authMiddleware.js

export const isAdmin = (req, res, next) => {
    // 1. Debugging: Pantau identitas user yang masuk
    // Sekarang Mas bisa lihat ID, Nama, dan Role di terminal
    console.log("--- Security Check ---");
    console.log("User ID   :", req.user?.id);
    console.log("User Role :", req.user?.role);
    console.log("----------------------");

    // 2. Cek apakah user sudah terautentikasi (VerifyToken harus dijalankan sebelum ini)
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: "Unauthorized: Anda belum login atau token tidak valid." 
        });
    }

    // 3. Pastikan user_id tersedia (Penting untuk CRUD Files nanti)
    if (!req.user.id) {
        return res.status(403).json({ 
            success: false,
            message: "Akses Ditolak: User ID tidak ditemukan dalam sesi." 
        });
    }

    // 4. Pengecekan Role Admin
    if (!req.user.role) {
        return res.status(403).json({ 
            success: false,
            message: "Akses Ditolak: Role tidak terdefinisi." 
        });
    }

    if (req.user.role.toLowerCase() === 'admin') {
        // Jika lolos, lanjut ke controller
        next();
    } else {
        return res.status(403).json({ 
            success: false,
            message: `Akses Ditolak: Role ${req.user.role} tidak diizinkan mengakses menu Admin.` 
        });
    }
};