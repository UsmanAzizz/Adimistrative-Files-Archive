import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../backend/db_connections.js'; // Import koneksi DB dari server.js

const router = express.Router();

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Query ke database menggunakan async/await
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: 'Username tidak ditemukan' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Password salah' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'smk_dipo_secret', 
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login Berhasil',
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

export default router;