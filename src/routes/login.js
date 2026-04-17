import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../backend/db_connections.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Gunakan execute agar konsisten
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: 'Username tidak ditemukan' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Password salah' });
        }

        // 1. Generate Token (Sudah benar memasukkan role)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            process.env.JWT_SECRET || 'smk_dipo_secret', 
            { expiresIn: '24h' }
        );

        // 2. Simpan token di Cookie (PERBAIKAN DI SINI)
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set FALSE dulu selama di localhost agar bisa terbaca tanpa HTTPS
            sameSite: 'lax', 
            maxAge: 24 * 60 * 60 * 1000,
            path: '/' // Pastikan cookie tersedia di seluruh path API
        });

        // 3. Kirim response
        res.json({
            success: true,
            message: 'Login Berhasil',
            user: { 
                name: user.nama,
                user_id:user.user_id,
                role: user.role 
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logout berhasil' });
});

export default router;