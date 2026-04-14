import express from 'express';
const router = express.Router();
import db from '../backend/db_connections.js';

router.get('/', async (req, res) => {
  try {
    // Karena tahun_pelajaran dihilangkan dari filter query utama, 
    // kita langsung mengambil semua data akses.
    const [rows] = await db.execute('SELECT * FROM client_access');
    
    res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/update', async (req, res) => {
  try {
    // 1. Destrukturisasi: Keluarkan nama dan tahun_pelajaran agar tidak masuk ke ...roles
    const { 
      user_id = null, 
      nama, 
      tahun_pelajaran, // Dikeluarkan agar tidak ikut diproses ke database
      ...roles 
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ status: 'error', message: 'User ID wajib diisi' });
    }

    // 2. Filter roles: Ambil key dan value (1 atau 0)
    const roleNames = Object.keys(roles);
    const roleValues = roleNames.map(role => (roles[role] ? 1 : 0));

    if (roleNames.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Data jabatan kosong' });
    }

    // 3. Susun Kolom & Placeholders (Hanya user_id dan roles)
    const columns = ['user_id', ...roleNames]
      .map(col => `\`${col}\``)
      .join(', ');

    const placeholders = new Array(1 + roleNames.length).fill('?').join(', ');
    
    // 4. Susun Update Statement
    const updateStatement = roleNames
      .map(role => `\`${role}\` = VALUES(\`${role}\`)`)
      .join(', ');

    const query = `
      INSERT INTO client_access (${columns})
      VALUES (${placeholders})
      ON DUPLICATE KEY UPDATE ${updateStatement}
    `;

    // 5. Parameter: Hanya user_id dan roleValues
    const params = [
      user_id, 
      ...roleValues
    ];

    await db.execute(query, params);
    
    res.status(200).json({ status: 'success', message: 'Akses diperbarui' });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ status: 'error', message: `Database Error: ${error.message}` });
  }
});

export default router;