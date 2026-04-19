import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // 1. Ambil token dari cookie (namanya harus sesuai dengan saat res.cookie di login)
  const token = req.cookies.token;

  // 2. Jika token tidak ada
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Akses ditolak: Sesi Anda telah berakhir atau Anda belum login." 
    });
  }

  // 3. Pastikan JWT_SECRET ada di environment (Production Best Practice)
  if (!process.env.JWT_SECRET) {
      console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
      return res.status(500).json({
          success: false,
          message: "Internal Server Error: Konfigurasi keamanan tidak lengkap."
      });
  }

  try {
    // 4. Verifikasi token menggunakan secret key dari .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Simpan data hasil decode (id, username, role) ke dalam req.user
    req.user = decoded;

    // 6. Lanjut ke middleware atau controller berikutnya
    next();
  } catch (err) {
    // Jika token expired atau tidak valid
    return res.status(403).json({ 
      success: false,
      message: "Token tidak valid atau telah kedaluwarsa." 
    });
  }
};

export const isAdmin = (req, res, next) => {
    // 1. Debugging: Pantau identitas user yang masuk hanya di mode development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Security Check] User ID: ${req.user?.id} | Role: ${req.user?.role}`);
    }

    // 2. Cek apakah atribut user tersedia (sebagai pengaman tambahan setelah verifyToken)
    if (!req.user || !req.user.id || !req.user.role) {
        return res.status(403).json({ 
            success: false,
            message: "Akses Ditolak: Data sesi (token) tidak lengkap atau tidak valid." 
        });
    }

    // 3. Pengecekan Role Admin
    if (req.user.role.toLowerCase() === 'admin') {
        // Jika lolos, lanjut ke controller
        next();
    } else {
        return res.status(403).json({ 
            success: false,
            message: `Akses Ditolak: Role '${req.user.role}' tidak diizinkan mengakses menu Admin.` 
        });
    }
};
