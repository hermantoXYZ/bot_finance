const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');
const db = require('./db');
const keywordToKategori = require('./categories');
const ringkasanRouter = require('./routes/ringkasan');
const { getDateRange } = require('./utils/dateUtils');

function simpanTransaksi({ nomor, tipe, jumlah, kategori, catatan, waktu }) {
    const stmt = db.prepare(`
        INSERT INTO transaksi (nomor, tipe, jumlah, kategori, catatan, waktu)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(nomor, tipe, jumlah, kategori, catatan, waktu);
}

const app = express();
app.use(express.json());


app.get('/api/transaksi/id/:id', (req, res) => {
    const { id } = req.params;
    const transaksi = db.prepare(`
        SELECT id, tipe, jumlah, kategori, catatan, waktu
        FROM transaksi WHERE id = ?
    `).get(id); // pakai .get bukan .all, karena hasilnya satu baris

    if (transaksi) {
        res.json(transaksi);
    } else {
        res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
});


app.patch('/api/transaksi/:id', (req, res) => {
    const { id } = req.params;
    const { tipe, jumlah, kategori, catatan } = req.body;

    console.log('PATCH /api/transaksi/:id');
    console.log('Body:', req.body);
    console.log('ID:', id);

    const stmt = db.prepare(`
        UPDATE transaksi
        SET tipe = ?, jumlah = ?, kategori = ?, catatan = ?
        WHERE id = ?
    `);
    const result = stmt.run(tipe, jumlah, kategori, catatan, id);

    console.log('Update result:', result);
    
    res.json({ message: 'Transaksi berhasil diperbarui' });
});


app.delete('/api/transaksi/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM transaksi WHERE id = ?').run(id);
    res.json({ message: 'Transaksi berhasil dihapus' });
});

// Inisialisasi WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth() // Menyimpan sesi login
});

// Menampilkan QR code di terminal saat dibutuhkan
client.on('qr', (qr) => {
    console.log('[ QR CODE TERDETEKSI ] Scan QR Code berikut:');
    qrcode.generate(qr, { small: true });
});

// Konfirmasi bot siap digunakan
client.on('ready', () => {
    console.log('✅ Bot siap digunakan!');
});

// Log jika berhasil terkoneksi
client.on('authenticated', () => {
    console.log('🔐 Bot berhasil login!');
});
// Log jika gagal terkoneksi
client.on('auth_failure', () => {
    console.error('❌ Gagal login! Pastikan Anda telah memasukkan kode QR yang benar.');
});

client.on('message', async (msg) => {
    const text = msg.body.toLowerCase();
    const nomor = msg.from.split('@')[0];

    // Cek perintah "hari ini" atau "riwayat X"
    if (text === 'hari ini' || text.startsWith('riwayat')) {
        const now = new Date();
        let startDate = new Date();
        let periodText = 'Hari Ini';

        if (text.startsWith('riwayat')) {
            const parts = text.split(' ');
            const days = parseInt(parts[1]) || 7; // Default ke 7 hari jika tidak ada angka
            startDate.setDate(startDate.getDate() - days);
            periodText = `${days} Hari Terakhir`;
        } else {
            // Untuk "hari ini", atur waktu ke awal dan akhir hari
            startDate.setHours(0, 0, 0, 0);
            now.setHours(23, 59, 59, 999);
        }

        const query = `
            SELECT tipe, jumlah, kategori, waktu 
            FROM transaksi 
            WHERE nomor = ? AND waktu BETWEEN ? AND ?
            ORDER BY waktu DESC
        `;

        const transaksi = db.prepare(query).all(nomor, startDate.toISOString(), now.toISOString());

        if (transaksi.length === 0) {
            await msg.reply(`📝 Tidak ada transaksi dalam *${periodText.toLowerCase()}*`);
            return;
        }

        let response = `📋 *Riwayat Transaksi (${periodText})*\n\n`;

        transaksi.forEach((t, i) => {
            const date = new Date(t.waktu).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const emoji = t.tipe === 'pemasukan' ? '📥' : '📤';
            response += `${i + 1}. ${emoji} ${date}\n`;
            response += `   💰 Rp${(t.jumlah || 0).toLocaleString('id-ID')}\n`;
            response += `   📝 ${t.kategori || 'Umum'}\n\n`;
        });

        await msg.reply(response);
    }
});



client.on('message', async (msg) => {
    const text = msg.body.toLowerCase();
    const nomor = msg.from.split('@')[0];

    if (text.startsWith('total')) {
        const period = text.replace('total', '').trim();
        let query = `SELECT tipe, jumlah FROM transaksi WHERE nomor = ?`;
        let params = [nomor];

        if (period) {
            const { startDate, endDate } = getDateRange(period);
            query = `SELECT tipe, jumlah FROM transaksi 
                    WHERE nomor = ? AND waktu BETWEEN ? AND ?`;
            params = [nomor, startDate.toISOString(), endDate.toISOString()];
        }

        const transaksi = db.prepare(query).all(...params);
        
        let totalPemasukan = 0;
        let totalPengeluaran = 0;
        
        transaksi.forEach(row => {
            if (row.tipe === 'pemasukan') {
                totalPemasukan += row.jumlah;
            } else if (row.tipe === 'pengeluaran') {
                totalPengeluaran += row.jumlah;
            }
        });
        
        const saldo = totalPemasukan - totalPengeluaran;
        const periodText = period ? ` (${period})` : '';
        
        await msg.reply(
            `📊 *Ringkasan Transaksi${periodText}*\n\n` +
            `📥 Total Pemasukan: Rp${totalPemasukan.toLocaleString('id-ID')}\n` +
            `📤 Total Pengeluaran: Rp${totalPengeluaran.toLocaleString('id-ID')}\n` +
            `💰 Saldo: Rp${saldo.toLocaleString('id-ID')}`
        );
    }
    // ... rest of your message handling code ...
});

// Log jika ada pesan masuk
client.on('message', async (msg) => {
    console.log('📩 Pesan diterima:', msg.body);

    const text = msg.body.toLowerCase();
    const nomor = msg.from.split('@')[0]; // Get sender's number
    const waktu = new Date().toISOString(); // Get current timestamp

     // Tangani perintah khusus dulu
     if (text === 'total') {
        const transaksi = db.prepare(`SELECT tipe, jumlah FROM transaksi WHERE nomor = ?`).all(nomor);
    
        let totalPemasukan = 0;
        let totalPengeluaran = 0;
    
        transaksi.forEach(row => {
            if (row.tipe === 'pemasukan') {
                totalPemasukan += row.jumlah;
            } else if (row.tipe === 'pengeluaran') {
                totalPengeluaran += row.jumlah;
            }
        });
    
        const saldo = totalPemasukan - totalPengeluaran;
    
        const ringkasanUrl = `http://localhost:3000/api/ringkasan/${nomor}`;
    
        await msg.reply(
            `📊 *Ringkasan Transaksi*\n\n` +
            `📥 Total Pemasukan: Rp${totalPemasukan.toLocaleString('id-ID')}\n` +
            `📤 Total Pengeluaran: Rp${totalPengeluaran.toLocaleString('id-ID')}\n` +
            `💰 Saldo: Rp${saldo.toLocaleString('id-ID')}\n\n` +
            `🔗 Lihat ringkasan transaksi lengkap: ${ringkasanUrl}`
        );
    }


    // Help
    else if (text === 'help') {
        await msg.reply(
            `📌 *Daftar Perintah yang Tersedia*\n\n` +
            `💸 *Catat Pengeluaran:*\n` +
            `   - pengeluaran 20000 makanan\n` +
            `   - beli 15000 jajan\n\n` +
            `💰 *Catat Pemasukan:*\n` +
            `   - pemasukan 500000 gaji\n` +
            `   - dapat 100000 bonus\n\n` +
            `📊 *Cek Ringkasan:*\n` +
            `   - total\n` +
            `   - total minggu ini\n` +
            `   - total bulan ini\n` +
            `   - total januari\n` +
            `   - total 2024\n\n` +
            `📋 *Riwayat Transaksi:*\n` +
            `   - hari ini\n` +
            `   - riwayat 5\n\n` +
            `❓ *Bantuan:*\n` +
            `   - help\n\n` +
            `📝 Catatan:\n` +
            `- Gunakan kata kunci umum seperti: *makanan, transportasi, gaji, hadiah, jajan, dsb.*\n` +
            `- Bot akan otomatis mengenali kategori dan menyimpan transaksi kamu.\n` +
            `🔗 Untuk melihat semua riwayat transaksi kamu, ketik: *total*\n\n` +
            `📝 By hermantoXYZ.`
        );
    }


    else if (text.trim()) {
        const parts = text.trim().split(' ');
    
        // Cari angka (jumlah) dari teks
        const jumlah = parseInt(parts.find(p => !isNaN(parseInt(p))));
    
        // Temukan keyword yang cocok
        const foundKeyword = parts.find(p => keywordToKategori[p.toLowerCase()]);
        const keyword = foundKeyword?.toLowerCase();
    
        const kategoriData = keywordToKategori[keyword];
    
        let kategori, tipe;
    
        if (kategoriData) {
            kategori = kategoriData.kategori;
            tipe = kategoriData.tipe;
        } else {
            kategori = 'Umum';
            tipe = 'pengeluaran';
        }
    
        // Buat catatan dengan menghilangkan jumlah dari teks
        const catatanParts = parts.filter(p => isNaN(parseInt(p)));
        const catatan = catatanParts.join(' ').trim() || 'Tidak ada catatan';
    
        if (!isNaN(jumlah)) {
            simpanTransaksi({ nomor, tipe, jumlah, kategori, catatan, waktu });
    
            await msg.reply(
                `✅ ${tipe.charAt(0).toUpperCase() + tipe.slice(1)} dicatat:\n` +
                `📝 Kategori: ${kategori}\n` +
                `💭 Catatan: ${catatan}\n` +
                `💰 Nominal: Rp${jumlah.toLocaleString('id-ID')}`
            );
        } 
    }
    });

app.use('/ringkasan', ringkasanRouter);

// Jalankan WhatsApp client
client.initialize();

// Jalankan server Express di port 3000
app.listen(3000, () => {
    console.log('🚀 Server berjalan di http://localhost:3000');
});
