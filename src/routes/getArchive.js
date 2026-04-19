import express from 'express';
import db from '../backend/db_connections.js';
import { verifyToken, isAdmin } from '../backend/middlewares/auth.js';

const router = express.Router();

// --- 1. GET ALL (Public) ---
// Route ini tidak melewati middleware verifyToken/isAdmin agar user umum bisa melihat
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM tahun_akademik ORDER BY ta DESC`);
        res.status(200).json({ 
            success: true, 
            data: rows 
        });
    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal mengambil data dari database' 
        });
    }
});

/**
 * --- BARRIER PROTEKSI ---
 * Middleware didefinisikan secara berurutan. 
 * verifyToken: Mengambil token -> Decode -> Simpan data user ke req.user
 * isAdmin: Mengambil req.user -> Cek role
 */
router.use(verifyToken);
router.use(isAdmin);

// --- 2. POST (CREATE) - Terproteksi ---
router.post('/', async (req, res) => {
    const { ta } = req.body;
    
    // Validasi input
    if (!ta) {
        return res.status(400).json({ success: false, message: "Tahun Akademik (TA) wajib diisi" });
    }

    try {
        const [result] = await db.execute(`INSERT INTO tahun_akademik (ta) VALUES (?)`, [ta]);
        res.status(201).json({ 
            success: true, 
            id: result.insertId, 
            message: "Tahun akademik berhasil ditambahkan" 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "TA tersebut sudah terdaftar" });
        }
        res.status(500).json({ success: false, message: "Gagal menyimpan ke database" });
    }
});

// --- 3. PUT (UPDATE) - Terproteksi ---
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { ta } = req.body;

    if (!ta) return res.status(400).json({ success: false, message: "Data update kosong" });

    try {
        const [result] = await db.execute(`UPDATE tahun_akademik SET ta = ? WHERE id = ?`, [ta, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
        }

        res.status(200).json({ success: true, message: "Berhasil memperbarui data" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal memperbarui database" });
    }
});

// --- 4. DELETE - Terproteksi ---
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Cek keberadaan data sebelum hapus
        const [check] = await db.execute(`SELECT id FROM tahun_akademik WHERE id = ?`, [id]);
        if (check.length === 0) {
            return res.status(404).json({ success: false, message: "Arsip sudah tidak ada" });
        }

        const [result] = await db.execute(`DELETE FROM tahun_akademik WHERE id = ?`, [id]);
        
        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: "Tahun akademik berhasil dihapus" });
        } else {
            res.status(400).json({ success: false, message: "Gagal menghapus data" });
        }
    } catch (error) {
        console.error("Delete Error:", error.message);
        res.status(500).json({ success: false, message: "Kesalahan server saat menghapus arsip" });
    }
});

export default router;