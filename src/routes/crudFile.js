import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import multer from 'multer';

// Import verifyToken untuk ambil user_id
import { verifyToken } from '../backend/verifyToken.js';

const router = express.Router();
const upload = multer({ dest: 'temp/' }); // Folder transit sementara

// --- CONFIGURATION ---
// Gunakan path absolut yang aman. Pastikan folder ini ada.
const ROOT_STORE = process.env.VITE_UPLOAD_PATH || "D:\\project\\DAFA\\src\\store";

export const fileController = {
    // 1. GET FILES & FOLDERS
    getFiles: async (req, res) => {
        try {
            const { tapel, jabatan, subPath } = req.query;
            const actorId = req.user?.id;

            if (!tapel || !jabatan) {
                return res.json({ success: true, data: [] });
            }

            const cleanSubPath = (subPath || "").replace(/^\/+|\/+$/g, "").replace(/\//g, path.sep);
            const targetDir = path.join(ROOT_STORE, tapel, jabatan, cleanSubPath);

            if (!(await fs.pathExists(targetDir))) {
                return res.json({ success: true, data: [] });
            }

            const items = await fs.readdir(targetDir);
            
            const list = await Promise.all(items.map(async (name) => {
                try {
                    const fullPath = path.join(targetDir, name);
                    const stats = await fs.stat(fullPath);
                    
                    return {
                        name: name,
                        isFolder: stats.isDirectory(),
                        size: stats.isDirectory() ? '-' : (stats.size / 1024).toFixed(2) + ' KB',
                        updatedAt: stats.mtime,
                        ext: path.extname(name).toLowerCase()
                    };
                } catch (statErr) {
                    // Jika file tiba-tiba hilang/di-rename saat loop, abaikan (return null)
                    return null;
                }
            }));

            // Filter data: buang yang null agar frontend tidak error
            const cleanList = list.filter(item => item !== null);

            console.log(`[DAFA GET] Folder: ${cleanSubPath} oleh UserID: ${actorId}`);
            res.json({ success: true, data: cleanList });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // 2. DOWNLOAD FILE
    downloadFile: async (req, res) => {
        try {
            const { tapel, jabatan, subPath, fileName } = req.query;
            const cleanSubPath = (subPath || "").replace(/^\/+|\/+$/g, "").replace(/\//g, path.sep);
            const filePath = path.join(ROOT_STORE, tapel, jabatan, cleanSubPath, fileName);

            if (await fs.pathExists(filePath)) {
                // Gunakan nama file asli agar saat didownload namanya benar
                res.download(filePath, fileName);
            } else {
                res.status(404).json({ success: false, message: 'File tidak ditemukan di Drive D.' });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // 3. UPLOAD FILE
    uploadFile: async (req, res) => {
        try {
            const { tapel, jabatan, subPath } = req.body;
            const file = req.file;
            if (!file) return res.status(400).json({ success: false, message: 'File kosong.' });

            const cleanSubPath = (subPath || "").replace(/^\/+|\/+$/g, "").replace(/\//g, path.sep);
            const targetDir = path.join(ROOT_STORE, tapel, jabatan, cleanSubPath);

            // Pastikan folder tujuan ada (kalau belum ada, buat otomatis)
            await fs.ensureDir(targetDir);
            
            // Hindari karakter aneh di nama file yang bikin Windows error
            const safeFileName = file.originalname.replace(/[<>:"/\\|?*]/g, '_');
            const finalPath = path.join(targetDir, safeFileName);
            
            // Pindah dari temp ke Drive D:
            await fs.move(req.file.path, finalPath, { overwrite: true });

            res.json({ success: true, message: 'Berhasil diarsipkan.' });
        } catch (err) {
            // Hapus file di temp jika gagal move agar folder temp tidak bengkak
            if (req.file) await fs.remove(req.file.path);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // 4. RENAME FILE/FOLDER
    renameFile: async (req, res) => {
        try {
            const { tapel, jabatan, subPath, oldName, newName } = req.body;
            const cleanSubPath = (subPath || "").replace(/^\/+|\/+$/g, "").replace(/\//g, path.sep);
            const baseDir = path.join(ROOT_STORE, tapel, jabatan, cleanSubPath);

            const oldPath = path.join(baseDir, oldName);
            const newPath = path.join(baseDir, newName);

            // Validasi: Apakah file lama benar-benar ada?
            if (!(await fs.pathExists(oldPath))) {
                return res.status(404).json({ success: false, message: 'Sumber file tidak ditemukan.' });
            }

            await fs.rename(oldPath, newPath);
            res.json({ success: true, message: 'Nama diperbarui.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Gagal ganti nama. File mungkin sedang dibuka program lain.' });
        }
    },

    // 5. DELETE FILE/FOLDER
    deleteFile: async (req, res) => {
        try {
            const { tapel, jabatan, subPath, fileName } = req.body;
            const cleanSubPath = (subPath || "").replace(/^\/+|\/+$/g, "").replace(/\//g, path.sep);
            const filePath = path.join(ROOT_STORE, tapel, jabatan, cleanSubPath, fileName);

            if (await fs.pathExists(filePath)) {
                await fs.remove(filePath);
                res.json({ success: true, message: 'Terhapus.' });
            } else {
                res.status(404).json({ success: false, message: 'File sudah tidak ada.' });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

// --- REGISTER ROUTES KE ROUTER ---
router.get('/list', verifyToken, fileController.getFiles);
router.get('/download', verifyToken, fileController.downloadFile);
router.post('/upload', verifyToken, upload.single('file'), fileController.uploadFile);
router.post('/rename', verifyToken, fileController.renameFile);
router.post('/delete', verifyToken, fileController.deleteFile);

export default router;