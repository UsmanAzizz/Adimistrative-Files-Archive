import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import multer from 'multer';
import archiver from 'archiver'; // Ubah require jadi import

// Import verifyToken untuk ambil user_id
import { verifyToken } from '../backend/middlewares/auth.js';

const router = express.Router();
const upload = multer({ dest: 'temp/' });

// --- CONFIGURATION ---
// Gunakan path yang fleksibel untuk Windows (Lokal) dan Linux (VPS)
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
                    return null;
                }
            }));

            const cleanList = list.filter(item => item !== null);
            res.json({ success: true, data: cleanList });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // 2. DOWNLOAD FILE TUNGGAL
    downloadFile: async (req, res) => {
        try {
            const { tapel, jabatan, subPath, fileName } = req.query;
            const cleanSubPath = (subPath || "").replace(/^\/+|\/+$/g, "").replace(/\//g, path.sep);
            const filePath = path.join(ROOT_STORE, tapel, jabatan, cleanSubPath, fileName);

            if (await fs.pathExists(filePath)) {
                res.download(filePath, fileName);
            } else {
                res.status(404).json({ success: false, message: 'File tidak ditemukan.' });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // 3. DOWNLOAD FOLDER (KOMPRESI JADI ZIP/RAR)
    downloadFolder: async (req, res) => {
        try {
            const { tapel, jabatan, folderPath, folderName } = req.query;
            const cleanSubPath = (folderPath || "").replace(/^\/+|\/+$/g, "").replace(/\//g, path.sep);
            const fullFolderPath = path.join(ROOT_STORE, tapel, jabatan, cleanSubPath, folderName);

            if (!(await fs.pathExists(fullFolderPath))) {
                return res.status(404).json({ success: false, message: "Folder tidak ditemukan" });
            }

            // Set header agar browser mendownload sebagai file biner
            res.attachment(`${folderName}.zip`); 

            const archive = archiver('zip', { zlib: { level: 9 } });

            // Pipe output kompresi langsung ke response (stream)
            archive.pipe(res);
            archive.directory(fullFolderPath, false);
            await archive.finalize();

        } catch (err) {
            console.error("Archive Error:", err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: err.message });
            }
        }
    },

    // 4. UPLOAD FILE
    uploadFile: async (req, res) => {
        try {
            const { tapel, jabatan, subPath } = req.body;
            const file = req.file;
            if (!file) return res.status(400).json({ success: false, message: 'File kosong.' });

            const cleanSubPath = (subPath || "").replace(/^\/+|\/+$/g, "").replace(/\//g, path.sep);
            const targetDir = path.join(ROOT_STORE, tapel, jabatan, cleanSubPath);

            await fs.ensureDir(targetDir);
            const safeFileName = file.originalname.replace(/[<>:"/\\|?*]/g, '_');
            const finalPath = path.join(targetDir, safeFileName);
            
            await fs.move(req.file.path, finalPath, { overwrite: true });
            res.json({ success: true, message: 'Berhasil diarsipkan.' });
        } catch (err) {
            if (req.file) await fs.remove(req.file.path);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // 5. RENAME & 6. DELETE (Tetap seperti kode Mas)
    renameFile: async (req, res) => {
        try {
            const { tapel, jabatan, subPath, oldName, newName } = req.body;
            const cleanSubPath = (subPath || "").replace(/^\/+|\/+$/g, "").replace(/\//g, path.sep);
            const baseDir = path.join(ROOT_STORE, tapel, jabatan, cleanSubPath);
            const oldPath = path.join(baseDir, oldName);
            const newPath = path.join(baseDir, newName);

            if (!(await fs.pathExists(oldPath))) return res.status(404).json({ success: false, message: 'Sumber tidak ditemukan.' });

            await fs.rename(oldPath, newPath);
            res.json({ success: true, message: 'Nama diperbarui.' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Gagal ganti nama.' });
        }
    },

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

// --- REGISTER ROUTES ---
router.get('/list', verifyToken, fileController.getFiles);
router.get('/download', verifyToken, fileController.downloadFile);
// Tambahkan Route baru untuk folder
router.get('/download-compressed', verifyToken, fileController.downloadFolder); 

router.post('/upload', verifyToken, upload.single('file'), fileController.uploadFile);
router.post('/rename', verifyToken, fileController.renameFile);
router.post('/delete', verifyToken, fileController.deleteFile);

export default router;