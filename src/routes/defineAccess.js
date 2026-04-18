import express from 'express';
import db from '../backend/db_connections.js';
import { verifyToken } from '../backend/verifyToken.js';
import { isAdmin } from '../backend/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM client_access');
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'client_access' 
      AND TABLE_SCHEMA = DATABASE()
    `);

    const ignoreFields = ['user_id', 'created_at', 'updated_at'];
    const availableRoles = columns
      .map(col => col.COLUMN_NAME)
      .filter(name => !ignoreFields.includes(name));

    res.status(200).json({ 
      status: 'success', 
      data: rows, 
      roles: availableRoles 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.use(verifyToken);
// --- 2. RUTE USER ACCESS (Wajib Login) ---
router.get('/check-permission', verifyToken, async (req, res) => {
    try {
        const { jabatan } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role; // Ambil role dari token

        // 1. JIKA DIA ADMIN, LANGSUNG LOLOSKAN (BYPASS)
        if (userRole === 'admin') {
            return res.json({ can_edit: true, is_admin: true });
        }

        if (!jabatan) return res.status(400).json({ message: 'Parameter jabatan diperlukan' });

        // 2. JIKA BUKAN ADMIN, CEK KOLOM AKSES SEPERTI BIASA
        const [rows] = await db.query(
            `SELECT \`${jabatan}\` as status FROM client_access WHERE user_id = ?`,
            [userId]
        );

        if (rows.length > 0 && rows[0].status === 1) {
            return res.json({ can_edit: true });
        }

        // Jika semua gagal
        res.json({ can_edit: false });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// =========================================================
// BARRIER PROTEKSI (Middleware Satpam)
// Semua route di BAWAH baris ini wajib Login & Admin
// =========================================================

router.use(isAdmin);

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
    // 1. BUANG semua field yang bukan merupakan KOLOM JABATAN di database
    const { 
        user_id, 
        nama, 
        tahun_pelajaran, 
        created_at, 
        updated_at, 
        ...roles 
    } = req.body;

    if (!user_id) return res.status(400).json({ message: 'User ID wajib diisi' });

    const roleNames = Object.keys(roles);
    if (roleNames.length === 0) return res.status(400).json({ message: 'Tidak ada data jabatan' });

    // 2. Siapkan nilai (1 atau 0)
    const roleValues = roleNames.map(role => (roles[role] ? 1 : 0));

    // 3. Susun kolom dan placeholders
    // Kita pakai ` ` (backticks) untuk nama kolom jabatan agar aman dari reserved words
    const columns = ['user_id', ...roleNames].map(col => `\`${col}\``).join(', ');
    const placeholders = new Array(1 + roleNames.length).fill('?').join(', ');

    // 4. Susun update statement untuk ON DUPLICATE KEY
    const updateStatement = roleNames.map(role => `\`${role}\` = VALUES(\`${role}\`)`).join(', ');

    const query = `
      INSERT INTO client_access (${columns})
      VALUES (${placeholders})
      ON DUPLICATE KEY UPDATE ${updateStatement}
    `;

    // 5. Eksekusi: Masukkan user_id dan semua nilai jabatannya
    await db.query(query, [user_id, ...roleValues]);

    res.status(200).json({ 
        status: 'success', 
        message: 'Hak akses berhasil disimpan/diperbarui' 
    });
  } catch (error) {
    console.error("Error update akses:", error);
    res.status(500).json({ status: 'error', message: 'Gagal update akses: ' + error.message });
  }
});
export default router;