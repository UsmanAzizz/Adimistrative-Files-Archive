import express from 'express';
const router = express.Router();
import db from '../backend/db_connections.js';

// --- 1. GET ALL DATA & COLUMNS ---
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM client_access');
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// --- TAMBAH KOLOM BARU ---
router.post('/column', async (req, res) => {
  try {
    const { name } = req.body; 
    if (!name) return res.status(400).json({ message: 'Nama kolom wajib' });

    // Format: lowercase dan ganti spasi dengan underscore
    const formattedName = name.toLowerCase().trim().replace(/\s+/g, '_');

    const query = `ALTER TABLE client_access ADD COLUMN \`${formattedName}\` TINYINT(1) DEFAULT 0`;
    await db.execute(query);

    res.status(200).json({ status: 'success', message: `Kolom ${formattedName} ditambahkan` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// --- EDIT/RENAME KOLOM ---
router.put('/column', async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    const formattedNewName = newName.toLowerCase().trim().replace(/\s+/g, '_');

    const query = `ALTER TABLE client_access CHANGE \`${oldName}\` \`${formattedNewName}\` TINYINT(1) DEFAULT 0`;
    await db.execute(query);

    res.status(200).json({ status: 'success', message: 'Struktur berhasil diubah' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
// --- 4. HAPUS KOLOM (ALTER TABLE DROP) ---
router.delete('/column/:name', async (req, res) => {
  try {
    const { name } = req.params;

    // Proteksi agar user_id tidak terhapus secara tidak sengaja
    if (name === 'user_id') {
      return res.status(400).json({ message: 'Kolom user_id adalah kunci utama dan tidak boleh dihapus' });
    }

    // Perintah ini akan menghapus kolom beserta seluruh record data di dalamnya
    const query = `ALTER TABLE client_access DROP COLUMN \`${name}\``;
    await db.execute(query);

    res.status(200).json({ status: 'success', message: `Kolom ${name} dan seluruh datanya telah dihapus` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: `Gagal hapus kolom: ${error.message}` });
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
router.delete('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    await db.execute('DELETE FROM client_access WHERE user_id = ?', [user_id]);
    res.status(200).json({ status: 'success', message: 'Record user berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;