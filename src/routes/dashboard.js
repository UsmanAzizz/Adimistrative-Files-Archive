import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import db from '../backend/db_connections.js';
import { verifyToken } from '../backend/middlewares/auth.js';

const router = express.Router();
const ROOT_STORE = process.env.VITE_UPLOAD_PATH || "D:\\project\\DAFA\\src\\store";

// Fungsi rekursif untuk menyapu seluruh file di dalam store
async function scanDirectory(dir, fileList = []) {
    if (!(await fs.pathExists(dir))) return fileList;

    const items = await fs.readdir(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
            await scanDirectory(fullPath, fileList);
        } else {
            // Kita coba tebak kategori (nama folder tempat file ini berada)
            // path.dirname(fullPath) akan mengembalikan parent folder
            const parentDirName = path.basename(path.dirname(fullPath));
            
            fileList.push({
                name: item,
                path: fullPath,
                kategori: parentDirName, // Nama folder induk sebagai kategori
                mtime: stat.mtime,
                size: stat.size
            });
        }
    }
    return fileList;
}

router.get('/stats', verifyToken, async (req, res) => {
    try {
        // 1. Ambil Total User dari Database
        const [userRows] = await db.query("SELECT COUNT(*) as total FROM users");
        const totalUsers = userRows[0].total;

        // 2. Scan Storage untuk menghitung arsip
        const allFiles = await scanDirectory(ROOT_STORE);
        
        // 3. Hitung statistik file
        const totalArsip = allFiles.length;
        
        // Hitung upload bulan ini
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const uploadBulanIni = allFiles.filter(file => {
            const fileDate = new Date(file.mtime);
            return fileDate.getMonth() === currentMonth && fileDate.getFullYear() === currentYear;
        }).length;

        // 4. Ambil 5 aktivitas terbaru (file yang paling baru diubah/upload)
        const recentActivities = allFiles
            .sort((a, b) => b.mtime - a.mtime)
            .slice(0, 5)
            .map(file => {
                // Formatting tanggal manual untuk konsistensi
                const diffTime = Math.abs(now - new Date(file.mtime));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                
                let dateStr = "";
                if (diffHours < 24) {
                    dateStr = diffHours <= 1 ? "Baru saja" : `${diffHours} jam yang lalu`;
                } else if (diffDays === 1) {
                    dateStr = "Kemarin";
                } else {
                    dateStr = new Date(file.mtime).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    });
                }

                return {
                    name: file.name,
                    cat: file.kategori.replace(/_/g, ' '),
                    date: dateStr
                };
            });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalArsip,
                uploadBulanIni,
                recentActivities
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil statistik dashboard." });
    }
});

export default router;
