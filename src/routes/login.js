import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../backend/db_connections.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: 'Username tidak ditemukan' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Password salah' });
        }

        // 1. Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'smk_dipo_secret', 
            { expiresIn: '24h' }
        );

        // 2. Simpan token di Cookie
       res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax', // Ganti dari strict ke lax
    maxAge: 24 * 60 * 60 * 1000 
});

        // 3. Kirim response tanpa token di body
        res.json({
            message: 'Login Berhasil',
            user: { 
                name: user.nama,
                role: user.role 
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// Tambahkan Route Logout untuk menghapus cookie
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout berhasil' });
});

export default router;