const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../db');


router.patch('/edit/:id', (req, res) => {
    const id = req.params.id;
    const { tipe, jumlah, kategori, catatan } = req.body;

    try {
        const stmt = db.prepare(`
            UPDATE transaksi 
            SET tipe = ?, jumlah = ?, kategori = ?, catatan = ? 
            WHERE id = ?
        `);
        const result = stmt.run(tipe, jumlah, kategori, catatan, id);

        if (result.changes === 0) {
            return res.status(404).send('Transaksiss tidak ditemukan');
        }

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mengedit transaksi');
    }
});

router.get('/:randomId/:nomor',  (req, res) => {
    const { randomId, nomor } = req.params;
    const transaksi = db.prepare(`SELECT * FROM transaksi WHERE nomor = ? ORDER BY waktu DESC`).all(nomor);

    if (transaksi.length === 0) {
        return res.status(404).send('Transakssi tidak ditemukan');
    }

    if (!global.userUrls || global.userUrls[randomId] !== nomor) {
        return res.status(401).send('Akses tidak valid. URL tidak dikenali.');
    }

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

    // Generate transaction rows HTML
    const transaksiRows = transaksi.map(row => `
        <tr>
            <td><span class="badge badge-pemasukan">${row.tipe}</span></td>
            <td>${row.kategori}</td>
            <td>Rp ${row.jumlah}</td>
            <td>${new Date(row.waktu).toLocaleString()}</td>
            <td>${row.catatan || '-'}</td>
            <td class="action-buttons">
            <button class="btn-edit" onclick="editTransaction(${row.id})">Edit</button>
            <button class="btn-delete" onclick="deleteTransaction(${row.id})">Hapus</button>
        </td>
        </tr>
    `).join('');

    // Read and process template
    let template = fs.readFileSync(path.join(__dirname, '../views/ringkasan.html'), 'utf8');
    template = template
        .replace('{{nomor}}', nomor)
        .replace('{{totalPemasukan}}', totalPemasukan.toLocaleString('id-ID'))
        .replace('{{totalPengeluaran}}', totalPengeluaran.toLocaleString('id-ID'))
        .replace('{{saldo}}', saldo.toLocaleString('id-ID'))
        .replace('{{transaksiRows}}', transaksiRows);

    res.send(template);
});

module.exports = router;