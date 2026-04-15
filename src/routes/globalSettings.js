import express from 'express';
const router = express.Router();
import db from '../backend/db_connections.js';

// --- 1. GET SETTINGS (Sudah Ada) ---
router.get('/', async (req, res) => {
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
router.put('/', async (req, res) => {
  const updates = req.body; // Contoh: { school_name: "SMK Dipo", address: "Cipari" }
  
  // Ambil nama kolom (key) dari body request
  const fields = Object.keys(updates);
  
  if (fields.length === 0) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Tidak ada data yang dikirim untuk diupdate' 
    });
  }

  try {
    /**
     * Membangun query secara dinamis:
     * UPDATE global_settings SET col1 = ?, col2 = ? WHERE id = (SELECT id FROM ...)
     */
    const setQuery = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(updates);

    // Kita asumsikan update selalu ke record pertama yang ada di tabel
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