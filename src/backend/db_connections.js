import mysql from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'dafa_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

const db = pool.promise();

const initializeDatabase = async () => {
    try {
        // 1. Tabel Users
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

        // 2. Tabel Client Access (Disesuaikan)
        // - Kolom tahun_pelajaran dihapus
        // - user_id ditambahkan sebagai kolom
        // - UNIQUE KEY diubah menjadi hanya user_id saja
    await db.query(`
            CREATE TABLE IF NOT EXISTS client_access (
                user_id INT PRIMARY KEY,
                kepsek BOOLEAN DEFAULT 0,
                waka_kurikulum BOOLEAN DEFAULT 0,
                waka_kesiswaan BOOLEAN DEFAULT 0,
                waka_sarpras BOOLEAN DEFAULT 0,
                waka_humas BOOLEAN DEFAULT 0,
                bendahara BOOLEAN DEFAULT 0,
                tu BOOLEAN DEFAULT 0,
                kajur_tjkt BOOLEAN DEFAULT 0,
                kajur_akl BOOLEAN DEFAULT 0,
                wali_kelas BOOLEAN DEFAULT 0,
                guru_piket BOOLEAN DEFAULT 0,
                operator_simnu BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // 3. Tabel Global Settings
        await db.query(`
            CREATE TABLE IF NOT EXISTS global_settings (
                id INT PRIMARY KEY DEFAULT 1,
                active_tahun_pelajaran VARCHAR(20) NOT NULL,
                CONSTRAINT one_row_only CHECK (id = 1)
            ) ENGINE=InnoDB;
        `);

        // Inisialisasi Tahun Pelajaran
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const currentTP = month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;

        const [settings] = await db.query("SELECT * FROM global_settings WHERE id = 1");
        if (settings.length === 0) {
            await db.query("INSERT INTO global_settings (id, active_tahun_pelajaran) VALUES (1, ?)", [currentTP]);
        }

        // Inisialisasi Admin Default
        const [adminExists] = await db.query("SELECT id FROM users WHERE username = 'admin'");
        if (adminExists.length === 0) {
            const hashed = await bcrypt.hash('1234', 10);
            await db.query("INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)", 
                ['Administrator', 'admin', hashed, 'admin']);
        }

        console.log('Database initialized successfully.');
    } catch (err) {
        console.error('DB Init Error:', err.message);
    }
    // 1. Buat Tabel tahun_akademik
await db.query(`
    CREATE TABLE IF NOT EXISTS tahun_akademik (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ta VARCHAR(20) NOT NULL UNIQUE
    ) ENGINE=InnoDB;
`);

// 2. Ambil TA Aktif dari global_settings dan Masukkan ke tahun_akademik jika belum ada
await db.query(`
    INSERT INTO tahun_akademik (ta)
    SELECT active_tahun_pelajaran 
    FROM global_settings 
    WHERE id = 1
    AND active_tahun_pelajaran NOT IN (SELECT ta FROM tahun_akademik);
`);
    // 3. Buat Tabel Archives
    await db.query(`
        CREATE TABLE IF NOT EXISTS archives (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            isFolder TINYINT(1) DEFAULT 1,
            size VARCHAR(50) DEFAULT '-',
            tapel VARCHAR(50),
            jabatan VARCHAR(100),
            parent_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
        ) ENGINE=InnoDB;
    `);
};

export { initializeDatabase };
export default db;