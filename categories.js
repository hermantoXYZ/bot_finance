const keywordToKategori = {
    // Pemasukan
    gaji: { kategori: 'Gaji', tipe: 'pemasukan' },
    bonus: { kategori: 'Bonus', tipe: 'pemasukan' },
    jualan: { kategori: 'Usaha', tipe: 'pemasukan' },
    investasi: { kategori: 'Investasi', tipe: 'pemasukan' },
    pendapatan: { kategori: 'Pendapatan', tipe: 'pemasukan' },
    freelance: { kategori: 'Freelance', tipe: 'pemasukan' },
    komisi: { kategori: 'Komisi', tipe: 'pemasukan' },
    hibah: { kategori: 'Hibah', tipe: 'pemasukan' },
    royalti: { kategori: 'Royalti', tipe: 'pemasukan' },
    hadiah: { kategori: 'Hadiah', tipe: 'pemasukan' },
    penjualan: { kategori: 'Penjualan', tipe: 'pemasukan' },

    // Pengeluaran
    makan: { kategori: 'Makanan', tipe: 'pengeluaran' },
    bensin: { kategori: 'Transportasi', tipe: 'pengeluaran' },
    kopi: { kategori: 'Makanan', tipe: 'pengeluaran' },
    pulsa: { kategori: 'Tagihan', tipe: 'pengeluaran' },
    listrik: { kategori: 'Tagihan', tipe: 'pengeluaran' },
    air: { kategori: 'Tagihan', tipe: 'pengeluaran' },
    internet: { kategori: 'Tagihan', tipe: 'pengeluaran' },
    transportasi: { kategori: 'Transportasi', tipe: 'pengeluaran' },
    perawatan: { kategori: 'Perawatan', tipe: 'pengeluaran' },
    belanja: { kategori: 'Belanja', tipe: 'pengeluaran' },
    obat: { kategori: 'Kesehatan', tipe: 'pengeluaran' },
    pendidikan: { kategori: 'Pendidikan', tipe: 'pengeluaran' },
    sewa: { kategori: 'Sewa', tipe: 'pengeluaran' },
    asuransi: { kategori: 'Asuransi', tipe: 'pengeluaran' },
    olahraga: { kategori: 'Olahraga', tipe: 'pengeluaran' },
    makan_di_restoran: { kategori: 'Makanan', tipe: 'pengeluaran' },
    rumah_tangga: { kategori: 'Rumah Tangga', tipe: 'pengeluaran' },
    rekreasi: { kategori: 'Rekreasi', tipe: 'pengeluaran' },
    perbaikan: { kategori: 'Perbaikan', tipe: 'pengeluaran' },
    entertainment: { kategori: 'Hiburan', tipe: 'pengeluaran' },
    shopping: { kategori: 'Belanja', tipe: 'pengeluaran' },
    kecantikan: { kategori: 'Kecantikan', tipe: 'pengeluaran' },

    // Pengeluaran Umum
    umum: { kategori: 'Umum', tipe: 'pengeluaran' },
    biaya_tambahan: { kategori: 'Biaya Tambahan', tipe: 'pengeluaran' },
    tagihan_lainnya: { kategori: 'Tagihan Lainnya', tipe: 'pengeluaran' },
    biaya_ekstra: { kategori: 'Biaya Ekstra', tipe: 'pengeluaran' },

    // Kategori lainnya
    biaya_ekstra: { kategori: 'Biaya Ekstra', tipe: 'pengeluaran' }
};

module.exports = keywordToKategori;
