function getDateRange(period) {
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'hari ini' || period === 'riwayat hari ini') {
        // Start and end date are the same day (today)
        startDate.setHours(0, 0, 0, 0);
    } else if (period === 'kemarin' || period === 'riwayat kemarin') {
        // Yesterday
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        now.setDate(now.getDate() - 1);
        now.setHours(23, 59, 59, 999);
    } else if (period === 'minggu ini' || period === 'riwayat minggu ini') {
        startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    } else if (period === 'bulan ini') {
        startDate.setDate(1); // Start of current month
    } else if (/^(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)$/.test(period)) {
        const months = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
        const monthIndex = months.indexOf(period);
        startDate.setMonth(monthIndex);
        startDate.setDate(1);
        now.setMonth(monthIndex + 1);
        now.setDate(0); // Last day of specified month
    } else if (/^\d{4}$/.test(period)) { // Year format: "2024"
        startDate.setFullYear(parseInt(period), 0, 1); // January 1st of specified year
        now.setFullYear(parseInt(period), 11, 31); // December 31st of specified year
    }
    
    // Set time to beginning of day for start date and end of day for end date
    // if not already set in the conditions above
    if (period !== 'kemarin' && period !== 'riwayat kemarin') {
        startDate.setHours(0, 0, 0, 0);
        now.setHours(23, 59, 59, 999);
    }
    
    return { startDate, endDate: now };
}

module.exports = { getDateRange };