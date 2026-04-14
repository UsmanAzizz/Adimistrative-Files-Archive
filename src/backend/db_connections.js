import mysql from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// 1. Konfigurasi Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'dafa_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();

// 2. Fungsi Otomatisasi Tabel & Admin
const initializeDatabase = async () => {
    try {
        // Buat Tabel Users jika belum ada
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama VARCHAR(100) NOT NULL,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'client') DEFAULT 'client',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // Cek apakah admin sudah ada
        const [rows] = await db.query("SELECT * FROM users WHERE username = 'admin'");
        
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('1234', 10);
            await db.query(
                "INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)",
                ['Administrator', 'admin', hashedPassword, 'admin']
            );
            console.log('✨ Akun Admin default (admin/1234) berhasil dibuat.');
        }

        console.log('✅ Database siap digunakan.');
    } catch (err) {
        console.error('❌ Gagal Inisialisasi Database:', err.message);
    }
};

// Jalankan Inisialisasi
initializeDatabase();

export default db;