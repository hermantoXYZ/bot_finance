const Database = require('better-sqlite3');
const db = new Database('transaksi.db');

// Buat tabel jika belum ada
db.prepare(`
    CREATE TABLE IF NOT EXISTS transaksi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomor TEXT,
        tipe TEXT,
        jumlah INTEGER,
        kategori TEXT,
        waktu TEXT
    )
`).run();

// Tambahkan kolom catatan jika belum ada
try {
    db.prepare(`ALTER TABLE transaksi ADD COLUMN catatan TEXT`).run();
} catch (err) {
    if (!err.message.includes('duplicate column name')) {
        throw err;
    }
}

module.exports = db;
