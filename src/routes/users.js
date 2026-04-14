import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../backend/db_connections.js';

const router = express.Router();

// Helper getActiveYear dihapus karena tidak lagi digunakan untuk filter akses

// @route   GET /api/users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id, 
        u.nama, 
        u.username, 
        u.password, 
        u.role, 
        u.created_at,
        ca.* FROM users u
      LEFT JOIN client_access ca ON u.id = ca.user_id
      ORDER BY u.nama ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id, 
        u.nama, 
        u.username, 
        u.password, 
        u.role, 
        u.created_at,
        ca.*
      FROM users u
      LEFT JOIN client_access ca ON u.id = ca.user_id
      WHERE u.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/users
router.post('/', async (req, res) => {
  const { nama, username, password, role } = req.body;
  
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)',
      [nama, username, hashedPassword, role || 'client']
    );

    res.status(201).json({ 
      status: 'success',
      message: 'User berhasil dibuat',
      id: result.insertId 
    });

  } catch (err) {
    console.error("Error Post User:", err);
    res.status(500).json({ message: 'Gagal menambah user', error: err.message });
  }
});

// @route   PUT /api/users/:id
router.put('/:id', async (req, res) => {
  const { nama, username, role, password } = req.body;
  const userId = req.params.id;

  try {
    let query = 'UPDATE users SET nama = ?, username = ?, role = ?';
    let params = [nama, username, role];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
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
    // Pastikan di database sudah menggunakan ON DELETE CASCADE 
    // agar data di client_access otomatis terhapus saat user dihapus.
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus user' });
  }
});

export default router;