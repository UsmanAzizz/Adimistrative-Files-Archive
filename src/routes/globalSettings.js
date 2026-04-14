import express from 'express';
const router = express.Router();
import db from '../backend/db_connections.js';

// Route untuk mengambil seluruh konfigurasi global
router.get('/', async (req, res) => {
  try {
    // Mengambil seluruh kolom dari tabel global_settings
    // Biasanya hanya ada satu record (id=1), jadi kita ambil record pertama
    const [rows] = await db.execute('SELECT * FROM global_settings LIMIT 1');

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Data global settings belum dikonfigurasi'
      });
    }

    res.status(200).json({
      status: 'success',
      data: rows[0] // Mengembalikan objek baris pertama
    });
  } catch (error) {
    console.error("Global Route Error:", error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;