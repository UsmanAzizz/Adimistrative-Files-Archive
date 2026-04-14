import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../backend/db_connections.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Ambil semua user (tanpa password)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nama, username, role, created_at FROM users ORDER BY nama DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nama, username, role, created_at FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/users
// @desc    Tambah user baru (dengan Hash Password)
router.post('/', async (req, res) => {
  const { nama, username, password, role } = req.body;

  try {
    // Cek username
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(400).json({ message: 'Username sudah digunakan' });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      'INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)',
      [nama, username, hashedPassword, role || 'client']
    );

    res.status(201).json({ message: 'User berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah user' });
  }
});

// @route   PUT /api/users/:id
router.put('/:id', async (req, res) => {
  const { nama, username, role, password } = req.body;
  const userId = req.params.id;

  try {
    let query = 'UPDATE users SET nama = ?, username = ?, role = ?';
    let params = [nama, username, role];

    // Jika ganti password juga
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(userId);

    await db.query(query, params);
    res.json({ message: 'Data user berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal update user' });
  }
});

// @route   DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus user' });
  }
});

export default router;