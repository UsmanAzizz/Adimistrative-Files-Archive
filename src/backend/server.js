import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import Koneksi DB
import db, { initializeDatabase } from './db_connections.js';

// Import Routes
import globalRoutes from '../routes/globalSettings.js';
import loginRoutes from '../routes/login.js';
import userRoutes from '../routes/users.js'; 
import getArchive from '../routes/getArchive.js';
import accessRoutes from '../routes/defineAccess.js';
import errorMiddleware from './errorMiddleware.js';
import folderRoutes from '../routes/store.js';
import fileRoutes from '../routes/crudFile.js';
import dashboardRoutes from '../routes/dashboard.js';

dotenv.config();
const app = express();

// --- 1. KONFIGURASI CORS (Penting: Jangan pakai wildcard '*' jika pakai cookie) ---
const corsOptions = {
    origin: 'http://localhost:5173', // Sesuaikan dengan port Vite Anda
    credentials: true,               // Izinkan pengiriman cookie/token
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// --- 2. MIDDLEWARE DASAR ---
app.use(express.json());
app.use(cookieParser()); // Pindahkan ke sini, setelah 'app' didefinisikan

// --- 3. ROUTES ---
app.get('/', (req, res) => {
    res.json({ status: "Online", project: "DAFArchive API" });
});

app.use('/api/global', globalRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/users', userRoutes);
app.use('/api/define-access', accessRoutes); 
app.use('/api/archive-years', getArchive); 
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- 4. ERROR HANDLING ---
app.use((req, res, next) => {
    const err = new Error(`Resource ${req.originalUrl} tidak ditemukan`);
    err.statusCode = 404;
    next(err);
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Gagal inisialisasi database:", err);
    process.exit(1);
});