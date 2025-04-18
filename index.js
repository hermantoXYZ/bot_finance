const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

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

// Log jika ada pesan masuk
client.on('message', async (msg) => {
    console.log('📩 Pesan diterima:', msg.body);

    const text = msg.body.toLowerCase();

    if (text.startsWith('pengeluaran')) {
        const parts = text.split(' ');
        const jumlah = parts[1];
        const kategori = parts.slice(2).join(' ') || 'Umum';

        await msg.reply(`✅ Pengeluaran Rp${jumlah} untuk kategori "${kategori}" telah dicatat.`);
    }

    else if (text.startsWith('pemasukan')) {
        const parts = text.split(' ');
        const jumlah = parts[1];
        const kategori = parts.slice(2).join(' ') || 'Umum';

        await msg.reply(`✅ Pemasukan Rp${jumlah} untuk kategori "${kategori}" telah dicatat.`);
    }

    else if (text === 'help') {
        await msg.reply(`📌 Perintah yang tersedia:\n- pengeluaran 20000 makanan\n- pemasukan 100000 gaji\n- help`);
    }

    else {
        await msg.reply('❓ Perintah tidak dikenali. Ketik *help* untuk melihat daftar perintah.');
    }
});

// Jalankan WhatsApp client
client.initialize();

// Endpoint API untuk mencatat transaksi via HTTP POST
app.post('/catat-transaksi', (req, res) => {
    const { nomor, jenis, jumlah, kategori } = req.body;

    if (!nomor || !jenis || !jumlah) {
        return res.status(400).json({ message: '⚠️ Data tidak lengkap! Kirim nomor, jenis, dan jumlah.' });
    }

    const message = `📌 Transaksi *${jenis}* sebesar *Rp${jumlah}* telah dicatat dalam kategori *${kategori || 'Umum'}*`;

    client.sendMessage(`${nomor}@c.us`, message)
        .then(response => {
            res.json({ message: '✅ Pesan terkirim!', response });
        })
        .catch(error => {
            console.error('❌ Gagal mengirim pesan:', error);
            res.status(500).json({ message: '❌ Gagal mengirim pesan!', error });
        });
});

// Jalankan server Express di port 3000
app.listen(3000, () => {
    console.log('🚀 Server berjalan di http://localhost:3000');
});
