import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import Koneksi DB
import db from './db_connections.js';

// Import Routes
import globalRoutes from '../routes/globalSettings.js';
import loginRoutes from '../routes/login.js';
import userRoutes from '../routes/users.js'; 
import getArchive from '../routes/getArchive.js';
import accessRoutes from '../routes/defineAccess.js';
import errorMiddleware from './errorMiddleware.js';


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => {
    res.json({ status: "Online", project: "DAFArchive API" });
});

// 2. Daftarkan route users di sini
app.use('/api/global', globalRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/users', userRoutes);
app.use('/api/define-access', accessRoutes); 
app.use('/api/archive-years', getArchive); 

// --- ERROR HANDLING ---
app.use((req, res, next) => {
    // Jika request ke /api/users tapi muncul HTML, pastikan path ini benar
    const err = new Error(`Resource ${req.originalUrl} tidak ditemukan`);
    err.statusCode = 404;
    next(err);
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});