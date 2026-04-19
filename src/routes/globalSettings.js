import express from 'express';
import db from '../backend/db_connections.js';
import { verifyToken, isAdmin } from '../backend/middlewares/auth.js';

const router = express.Router();

// --- 1. GET SETTINGS ---
// Kita gunakan verifyToken saja agar semua user yang login bisa melihat nama sekolah/alamat
// Namun jika Anda ingin HANYA admin yang bisa melihat, tambahkan isAdmin
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM global_settings LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Settings tidak ditemukan' });
    }
    res.status(200).json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// --- 2. UPDATE SETTINGS (Dinamis) ---
// WAJIB menggunakan verifyToken dan isAdmin karena ini mengubah data instansi
router.put('/', verifyToken, isAdmin, async (req, res) => {
  const updates = req.body; 
  
  const fields = Object.keys(updates);
  
  if (fields.length === 0) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Tidak ada data yang dikirim untuk diupdate' 
    });
  }

  try {
    const setQuery = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(updates);

    // Update record pertama di tabel global_settings
    const query = `UPDATE global_settings SET ${setQuery} LIMIT 1`;

    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Gagal update, data global_settings mungkin kosong'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Konfigurasi berhasil diperbarui',
      updatedFields: fields
    });
  } catch (error) {
    console.error("Update Global Error:", error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;