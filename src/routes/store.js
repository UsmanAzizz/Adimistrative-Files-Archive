import express from 'express';
import db from '../backend/db_connections.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Tentukan path absolut ke folder store di project Anda
const ROOT_STORE = "D:\\project\\DAFA\\src\\store";

// Helper untuk membuat folder fisik jika belum ada
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// --- 1. RUTE GET (READ) ---

// Ambil daftar jabatan (kolom di client_access)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM client_access LIMIT 1');
        if (rows.length === 0) return res.status(200).json({ status: 'success', data: [] });
        
        const allKeys = Object.keys(rows[0]);
        const ignoreFields = ['user_id', 'nama', 'tahun_pelajaran', 'created_at', 'updated_at'];
        const folders = allKeys.filter(key => !ignoreFields.includes(key));
        
        res.status(200).json({ status: 'success', data: folders });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Ambil isi folder (berdasarkan path bersarang)
router.get('/content', async (req, res) => {
    const { tapel, jabatan, path: subPath } = req.query;
    try {
        const [rows] = await db.query(
            'SELECT id, name, isFolder, size FROM archives WHERE tapel = ? AND jabatan = ? AND parent_path = ?',
            [tapel, jabatan, subPath || '']
        );
        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        res.status(200).json({ status: 'success', data: [] });
    }
});

// --- 2. RUTE POST (CREATE) ---

// Membuat Jabatan Baru (Kolom baru + Folder Fisik Utama)
router.post('/', async (req, res) => {
    const { name, tapel } = req.body; // tapel dibutuhkan untuk path fisik
    if (!name) return res.status(400).json({ message: 'Nama jabatan wajib diisi' });

    const folderName = name.toLowerCase().trim().replace(/\s+/g, '_');
    
    try {
        // SQL: Tambah kolom akses
        await db.query(`ALTER TABLE client_access ADD COLUMN ${folderName} TINYINT(1) DEFAULT 0`);
        
        // Fisik: Buat folder root jabatan di dalam tapel
        const targetPath = path.join(ROOT_STORE, tapel, folderName);
        ensureDir(targetPath);

        res.status(201).json({ status: 'success', message: `Jabatan ${name} dan folder fisik dibuat` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Membuat Sub-Folder (Database + Fisik Bersarang)
router.post('/create-sub', async (req, res) => {
    const { tapel, jabatan, parentPath, folderName } = req.body;
    try {
        const safeName = folderName.replace(/[/\\?%*:|"<>]/g, '-').trim(); // Sanitasi nama file Windows
        
        // 1. Database
        await db.query(
            'INSERT INTO archives (name, isFolder, tapel, jabatan, parent_path) VALUES (?, 1, ?, ?, ?)',
            [safeName, tapel, jabatan, parentPath || '']
        );

        // 2. Fisik
        const targetPath = path.join(ROOT_STORE, tapel, jabatan, parentPath || '', safeName);
        ensureDir(targetPath);

        res.status(201).json({ status: 'success', message: 'Sub-folder fisik berhasil dibuat' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- 3. RUTE PUT (UPDATE / RENAME) ---

// Rename Sub-Folder
router.put('/rename-sub', async (req, res) => {
    const { id, newName } = req.body;
    try {
        // Ambil data lama dulu untuk tahu path fisik lama
        const [oldData] = await db.query('SELECT * FROM archives WHERE id = ?', [id]);
        if (oldData.length === 0) return res.status(404).send("Folder tidak ditemukan");

        const item = oldData[0];
        const oldPath = path.join(ROOT_STORE, item.tapel, item.jabatan, item.parent_path, item.name);
        const newPath = path.join(ROOT_STORE, item.tapel, item.jabatan, item.parent_path, newName);

        // 1. Fisik: Rename folder
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
        }

        // 2. Database: Update nama
        await db.query('UPDATE archives SET name = ? WHERE id = ?', [newName, id]);

        // 3. Database: Update semua parent_path anak-anaknya (Jika folder memiliki isi)
        const oldParentPath = item.parent_path ? `${item.parent_path}/${item.name}` : item.name;
        const newParentPath = item.parent_path ? `${item.parent_path}/${newName}` : newName;
        
        await db.query(
            'UPDATE archives SET parent_path = REPLACE(parent_path, ?, ?) WHERE parent_path LIKE ?',
            [oldParentPath, newParentPath, `${oldParentPath}%`]
        );

        res.status(200).json({ status: 'success', message: 'Rename folder fisik & DB berhasil' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- 4. RUTE DELETE (REMOVE) ---

// Hapus Sub-Folder & Isinya secara Rekursif
router.delete('/sub/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM archives WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).send("Folder tidak ditemukan");

        const item = rows[0];
        const targetPath = path.join(ROOT_STORE, item.tapel, item.jabatan, item.parent_path, item.name);

        // 1. Fisik: Hapus folder dan isinya
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
        }

        // 2. Database: Hapus data folder ini dan semua anaknya
        const pathToDelete = item.parent_path ? `${item.parent_path}/${item.name}` : item.name;
        await db.query('DELETE FROM archives WHERE id = ? OR parent_path LIKE ?', [id, `${pathToDelete}%`]);

        res.status(200).json({ status: 'success', message: 'Folder fisik & data terhapus' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;