import express from 'express';
import db from '../backend/db_connections.js';
import { verifyToken } from '../backend/verifyToken.js';
import { isAdmin } from '../backend/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

// --- 1. GET ALL DATA & COLUMNS ---
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM client_access');
    const filteredData = rows.map(({ created_at, updated_at, ...rest }) => rest);

    res.status(200).json({ status: 'success', data: filteredData });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// --- 2. TAMBAH KOLOM BARU ---
router.post('/column', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama kolom wajib diisi' });

    const formattedName = name.toLowerCase().trim().replace(/\s+/g, '_');

    // Query untuk menambah kolom
    const query = `ALTER TABLE client_access ADD COLUMN \`${formattedName}\` TINYINT(1) DEFAULT 0`;
    await db.query(query);

    res.status(200).json({ status: 'success', message: `Jabatan "${name}" berhasil ditambahkan` });
  } catch (error) {
    console.error("Add Column Error:", error);
    
    // Cek jika error disebabkan karena kolom sudah ada (MySQL Error 1060)
    if (error.errno === 1060 || error.code === 'ER_DUP_FIELDNAME') {
      return res.status(409).json({ status: 'error', message: 'Jabatan tersebut sudah ada dalam sistem' });
    }

    res.status(500).json({ status: 'error', message: 'Gagal menambah jabatan: ' + error.message });
  }
});

// --- 3. EDIT/RENAME KOLOM ---
router.put('/column', async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !newName) return res.status(400).json({ message: 'Data tidak lengkap' });

    const formattedNewName = newName.toLowerCase().trim().replace(/\s+/g, '_');

    const query = `ALTER TABLE client_access CHANGE \`${oldName}\` \`${formattedNewName}\` TINYINT(1) DEFAULT 0`;
    await db.query(query);

    res.status(200).json({ status: 'success', message: 'Nama jabatan berhasil diubah' });
  } catch (error) {
    if (error.errno === 1060 || error.code === 'ER_DUP_FIELDNAME') {
      return res.status(409).json({ status: 'error', message: 'Nama jabatan baru sudah digunakan' });
    }
    res.status(500).json({ status: 'error', message: 'Gagal mengubah struktur: ' + error.message });
  }
});

// --- 4. HAPUS KOLOM ---
router.delete('/column/:name', async (req, res) => {
  try {
    const { name } = req.params;
    if (name === 'user_id') return res.status(400).json({ message: 'Kolom utama tidak bisa dihapus' });

    const query = `ALTER TABLE client_access DROP COLUMN \`${name}\``;
    await db.query(query);

    res.status(200).json({ status: 'success', message: `Jabatan "${name}" telah dihapus` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Gagal menghapus kolom: ' + error.message });
  }
});

// --- 5. UPDATE DATA AKSES USER ---
router.put('/update', async (req, res) => {
  try {
 const { user_id, ...allFields } = req.body;
    if (!user_id) return res.status(400).json({ message: 'User ID wajib diisi' });

    // 2. Buang field 'nama' atau field lain yang hanya untuk display UI
    // agar tidak ikut masuk ke daftar kolom database
    const { nama, ...roles } = allFields; 

    const roleNames = Object.keys(roles);
    if (roleNames.length === 0) return res.status(400).json({ message: 'Tidak ada data jabatan' });

    const roleValues = roleNames.map(role => (roles[role] ? 1 : 0));
    const columns = ['user_id', ...roleNames].map(col => `\`${col}\``).join(', ');
    const placeholders = new Array(1 + roleNames.length).fill('?').join(', ');
    const updateStatement = roleNames.map(role => `\`${role}\` = VALUES(\`${role}\`)`).join(', ');

    const query = `
      INSERT INTO client_access (${columns})
      VALUES (${placeholders})
      ON DUPLICATE KEY UPDATE ${updateStatement}
    `;

    await db.query(query, [user_id, ...roleValues]);
    res.status(200).json({ status: 'success', message: 'Hak akses berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Gagal update akses: ' + error.message });
  }
});

export default router;