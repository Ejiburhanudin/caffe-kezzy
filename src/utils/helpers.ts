/**
 * Helper utilities for Coffee Shop POS & Order Management System
 */

/**
 * Format raw number to Indonesian Rupiah currency format
 * e.g., 28000 -> "Rp 28.000"
 */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Export data to a downloadable CSV file
 */
export function exportToCSV(filename: string, headers: string[], rows: any[][]) {
  const content = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Handle values with commas or newlines by wrapping in quotes
        const valStr = cell === null || cell === undefined ? '' : String(cell);
        if (valStr.includes(',') || valStr.includes('\n') || valStr.includes('"')) {
          return `"${valStr.replace(/"/g, '""')}"`;
        }
        return valStr;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper to generate a live QR Code URL representing any transaction or table URL
 */
export function getQRCodeUrl(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data)}`;
}

/**
 * Calculate dynamic statistics based on order datasets
 */
export function calculateOrderStats(orders: any[], selectedOutletId: string = 'all') {
  const filtered = selectedOutletId === 'all' 
    ? orders 
    : orders.filter(o => o.outletId === selectedOutletId);

  const completed = filtered.filter(o => o.status === 'Selesai');
  const active = filtered.filter(o => o.status !== 'Selesai');

  const todayStr = '2026-06-18'; // Matches the mocked contextual date
  const todayOrders = filtered.filter(o => o.createdTime.startsWith(todayStr));
  const todayCompleted = todayOrders.filter(o => o.status === 'Selesai');

  const totalSalesToday = todayCompleted.reduce((acc, o) => acc + o.totalPayable, 0);
  const totalTransactionsToday = todayOrders.length;
  const activeOrdersCount = active.length;

  // Monthly Revenue estimation (sum of all completed)
  const monthlyRevenue = completed.reduce((acc, o) => acc + o.totalPayable, 0);

  // Best selling products calculation
  const productCounters: Record<string, { name: string, qty: number, revenue: number, categoryId: string }> = {};
  
  completed.forEach(order => {
    order.items.forEach((item: any) => {
      if (!productCounters[item.productId]) {
        productCounters[item.productId] = {
          name: item.productName || 'Unknown Product',
          qty: 0,
          revenue: 0,
          categoryId: ''
        };
      }
      productCounters[item.productId].qty += item.qty;
      productCounters[item.productId].revenue += (item.price * item.qty);
    });
  });

  const bestSellers = Object.entries(productCounters)
    .map(([id, stats]) => ({ id, ...stats }))
    .sort((a, b) => b.qty - a.qty);

  return {
    totalSalesToday,
    totalTransactionsToday,
    activeOrdersCount,
    monthlyRevenue,
    bestSellers: bestSellers.slice(0, 10),
    allProductSellers: bestSellers
  };
}

/**
 * Estimate mock peak hours based on past order log
 */
export const MOCK_PEAK_HOURS = [
  { hour: '07:00 - 09:00', count: 42, label: 'Ramai (Pagi)' },
  { hour: '09:00 - 11:00', count: 25, label: 'Sedang' },
  { hour: '11:00 - 13:00', count: 58, label: 'Sangat Ramai (Makan Siang)' },
  { hour: '13:00 - 15:00', count: 30, label: 'Sedang' },
  { hour: '15:00 - 17:00', count: 48, label: 'Ramai (Sore)' },
  { hour: '17:00 - 19:00', count: 62, label: 'Sangat Ramai (Pulang Kantor)' },
  { hour: '19:00 - 21:00', count: 35, label: 'Sedang' },
  { hour: '21:00 - 23:00', count: 15, label: 'Senggang' }
];

/**
 * Mock data representing Baristas and performance report
 */
export const BARISTA_STATS_DATA = [
  { id: 'b1', name: 'Barista Rangga', completedOrders: 32, avgTimeMinutes: 3.5, activeRating: 4.8 },
  { id: 'b2', name: 'Barista Siska', completedOrders: 28, avgTimeMinutes: 4.2, activeRating: 4.9 },
  { id: 'b3', name: 'Barista Fadil', completedOrders: 25, avgTimeMinutes: 3.1, activeRating: 4.6 },
  { id: 'b4', name: 'Barista Dina', completedOrders: 18, avgTimeMinutes: 5.0, activeRating: 4.7 }
];
