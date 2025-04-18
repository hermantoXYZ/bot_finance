const { Sequelize, DataTypes } = require('sequelize');

// Inisialisasi SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

// Model transaksi
const Transaksi = sequelize.define('Transaksi', {
    nomor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jenis: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    kategori: {
        type: DataTypes.STRING,
        defaultValue: 'Umum'
    },
    via: {
        type: DataTypes.STRING,
        defaultValue: 'wa'
    }
}, {
    timestamps: true
});

// Sinkronisasi model
sequelize.sync();

module.exports = { Transaksi };
