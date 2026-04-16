import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // 1. Ambil token dari cookie (namanya harus sesuai dengan saat res.cookie di login)
  const token = req.cookies.token;

  // 2. Jika token tidak ada
  if (!token) {
    return res.status(401).json({ 
      message: "Akses ditolak: Sesi Anda telah berakhir atau Anda belum login." 
    });
  }

  try {
    // 3. Verifikasi token menggunakan secret key dari .env
   // Samakan fallback secret-nya
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smk_dipo_secret');

    /**
     * 4. Simpan data hasil decode (id, username, role) ke dalam req.user
     * Ini sangat penting karena middleware isAdmin akan mengecek req.user.role
     */
    req.user = decoded;

    // 5. Lanjut ke middleware atau controller berikutnya
    next();
  } catch (err) {
    // Jika token expired atau tidak valid
    return res.status(403).json({ 
      message: "Token tidak valid atau telah kedaluwarsa." 
    });
  }
};