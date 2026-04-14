import express from 'express';
import db from '../backend/db_connections.js';

const router = express.Router();

// --- 1. GET ALL ---
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM tahun_akademik ORDER BY ta DESC`);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data' });
    }
});

// --- 2. POST (CREATE) ---
router.post('/', async (req, res) => {
    const { ta } = req.body;
    if (!ta) return res.status(400).json({ success: false, message: "TA wajib diisi" });

    try {
        const [result] = await db.query(`
            INSERT INTO tahun_akademik (ta) 
            VALUES (?)`, [ta]);
        res.status(201).json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 400 : 500).json({ 
            success: false, 
            message: error.code === 'ER_DUP_ENTRY' ? "TA sudah ada" : "Server Error" 
        });
    }
});

// --- 3. PUT (UPDATE Nama TA atau Status Jabatan) ---
// --- 3. PUT (Update) ---
// Cukup gunakan '/:id' karena prefix sudah diatur di server.js
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    if (values.length === 0) return res.status(400).json({ success: false, message: "Tidak ada data yang diubah" });

    try {
        await db.query(`UPDATE tahun_akademik SET ${fields} WHERE id = ?`, [...values, id]);
        res.status(200).json({ success: true, message: "Update berhasil" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal update data" });
    }
});

// --- 4. DELETE ---
// Cukup gunakan '/:id'
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [exists] = await db.query(`SELECT id FROM tahun_akademik WHERE id = ?`, [id]);
        if (exists.length === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

        await db.query(`DELETE FROM tahun_akademik WHERE id = ?`, [id]);
        res.status(200).json({ success: true, message: `Arsip berhasil dihapus` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Gagal menghapus data" });
    }
});

export default router;