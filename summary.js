function getDateRange(period) {
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'minggu ini') {
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
    
    startDate.setHours(0, 0, 0, 0);
    now.setHours(23, 59, 59, 999);
    
    return { startDate, endDate: now };
}

module.exports = { getDateRange };