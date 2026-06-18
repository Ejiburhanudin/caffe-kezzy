import React, { useState } from 'react';
import { Order, Product, Ingredient, Supplier, Feedback, AppNotification, Outlet } from '../types';
import { formatRupiah, calculateOrderStats, MOCK_PEAK_HOURS, BARISTA_STATS_DATA, exportToCSV } from '../utils/helpers';
import { 
  TrendingUp, ShoppingBag, Clock, Loader2, AlertTriangle, MessageSquare, 
  Settings, Download, Star, RefreshCw, BarChart3, Truck, Users, Coffee, Mail 
} from 'lucide-react';

interface DashboardProps {
  orders: Order[];
  products: Product[];
  ingredients: Ingredient[];
  suppliers: Supplier[];
  feedbacks: Feedback[];
  notifications: AppNotification[];
  outlets: Outlet[];
  onAddStock: (ingId: string, amount: number) => void;
  onRefreshData: () => void;
}

export default function Dashboard({
  orders,
  products,
  ingredients,
  suppliers,
  feedbacks,
  notifications,
  outlets,
  onAddStock,
  onRefreshData
}: DashboardProps) {
  const [selectedOutletFilter, setSelectedOutletFilter] = useState<string>('all');
  const [reportType, setReportType] = useState<'sales' | 'products' | 'barista' | 'inventory'>('sales');
  
  // Calculate analytics
  const stats = calculateOrderStats(orders, selectedOutletFilter);
  const activeOrders = orders.filter(o => o.status !== 'Selesai');
  const criticalStockCount = ingredients.filter(i => i.stock <= i.minimumStock).length;

  const handleExportCSV = () => {
    if (reportType === 'sales') {
      const headers = ['ID Pesanan', 'Kode Transaksi', 'Outlet', 'Pelanggan', 'Tipe Order', 'Metode Bayar', 'Status Pembayaran', 'Total Bayar', 'Waktu'];
      const data = orders.map(o => [
        o.id, o.code, o.outletName, o.customerName, o.orderType, o.paymentMethod || 'Belum Bayar', o.paymentStatus, o.totalPayable, o.createdTime
      ]);
      exportToCSV('Laporan_Penjualan_Kopi_Senja', headers, data);
    } else if (reportType === 'products') {
      const headers = ['Rank', 'Nama Produk', 'Jumlah Terjual', 'Estimasi Omset'];
      const data = stats.allProductSellers.map((p, index) => [
        index + 1, p.name, p.qty, p.revenue
      ]);
      exportToCSV('Laporan_Produk_Terlaris', headers, data);
    } else if (reportType === 'barista') {
      const headers = ['Nama Barista', 'Pesanan Selesai', 'Rata-rata Waktu (Menit)', 'Rating Layanan'];
      const data = BARISTA_STATS_DATA.map(b => [
        b.name, b.completedOrders, b.avgTimeMinutes, b.activeRating
      ]);
      exportToCSV('Laporan_Kinerja_Barista', headers, data);
    } else {
      const headers = ['Bahan Baku', 'Sisa Stok', 'Batas Minimum', 'Satuan', 'Status'];
      const data = ingredients.map(i => [
        i.name, i.stock, i.minimumStock, i.unit, i.stock <= i.minimumStock ? 'Habis/Kritis' : 'Cukup'
      ]);
      exportToCSV('Laporan_Status_Inventaris', headers, data);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Overview Dashboard & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau kinerja operasional, penjualan multi-outlet, dan kepuasan pelanggan secara realtime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Outlet Filter for Analytics */}
          <select
            value={selectedOutletFilter}
            onChange={(e) => setSelectedOutletFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Semua Cabang (Kumulatif)</option>
            {outlets.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>

          <button
            onClick={onRefreshData}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* METRIC CARD ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Penjualan Hari Ini</span>
            <span className="text-2xl font-bold text-slate-800 font-sans mt-1.5 block">
              {formatRupiah(stats.totalSalesToday)}
            </span>
            <span className="text-emerald-600 text-xs font-medium flex items-center mt-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +14.8% dari kemarin
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Pesanan Menunggu</span>
            <span className="text-2xl font-bold text-amber-600 font-sans mt-1.5 block">
              {stats.activeOrdersCount} Pesanan
            </span>
            <span className="text-slate-400 text-xs mt-1 block">
              KDS Baris Antrean: {activeOrders.filter(o => o.status === 'Menunggu').length} masuk
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Bahan Baku Kritis</span>
            <span className={`text-2xl font-bold font-sans mt-1.5 block ${criticalStockCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {criticalStockCount} Item Alert
            </span>
            <span className="text-slate-400 text-xs mt-1 block">
              Susu segar / Matcha habis
            </span>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${criticalStockCount > 0 ? 'bg-rose-50 text-rose-600 animate-bounce' : 'bg-slate-150 text-slate-500'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Akumulasi Omset</span>
            <span className="text-2xl font-bold text-slate-800 font-sans mt-1.5 block">
              {formatRupiah(stats.monthlyRevenue)}
            </span>
            <span className="text-slate-400 text-xs mt-1 block">
              Dari {orders.filter(o => o.status === 'Selesai').length} transaksi lunas
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* DETAILED CHARTS & METRIC GRAPHICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Peak Hours custom interactive chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Jam-Jam Ramai (Peak Hours Analysis)</h3>
              <p className="text-slate-400 text-xs">Menunjukkan volume transaksi berdasarkan rentang waktu operasional harian.</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          {/* Graphical custom SVG representation of Peak Hours Column Chart */}
          <div className="h-64 flex flex-col justify-between mt-6">
            <div className="flex h-48 items-end gap-2 md:gap-4.5 px-2">
              {MOCK_PEAK_HOURS.map((pd, index) => {
                const maxVal = Math.max(...MOCK_PEAK_HOURS.map(o => o.count));
                const heightPercentage = Math.round((pd.count / maxVal) * 100);
                const isVeryBusy = pd.count > 50;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 shadow">
                      {pd.count} trans ({pd.label})
                    </div>
                    
                    {/* Column bar */}
                    <div 
                      style={{ height: `${heightPercentage}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 hover:brightness-110 ${
                        isVeryBusy ? 'bg-amber-500' : 'bg-slate-400/80'
                      }`}
                    />
                    
                    <span className="text-[9px] font-mono text-slate-400 mt-2 text-center rotate-45 md:rotate-0 origin-center">
                      {pd.hour.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center space-x-6 text-xs text-slate-500 border-t border-slate-100 pt-3">
              <div className="flex items-center space-x-1.5">
                <span className="inline-block w-3 h-3 bg-amber-500 rounded-sm" />
                <span>Sangat Ramai (&gt;50 Order)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="inline-block w-3 h-3 bg-slate-400/80 rounded-sm" />
                <span>Menengah / Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Products Leaderboard */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Top 5 Produk Terlaris (Leaderboard)</h3>
              <p className="text-slate-400 text-xs">Paling populer dipesan oleh customer di cabang terpilih.</p>
            </div>
            <Coffee className="w-5 h-5 text-amber-600" />
          </div>

          <div className="space-y-4">
            {stats.bestSellers.slice(0, 5).map((p, index) => {
              const maxUnits = stats.bestSellers[0]?.qty || 1;
              const barWidthPct = Math.round((p.qty / maxUnits) * 100);

              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 font-bold font-mono text-xs text-slate-500 flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-slate-700">{p.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="font-bold text-slate-800">{p.qty} Pcs</span>
                      <span className="text-slate-400 text-xs">({formatRupiah(p.revenue)})</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${barWidthPct}%` }}
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-amber-400' : 'bg-slate-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
            
            {stats.bestSellers.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                Mulai catat transaksi POS untuk melihat grafik performa menu kopimu!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* BARISTA PERFORMANCE & CRITICAL INVENTORY WRAPPING ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Barista Performance Tracker */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Statistik Pembuatan Kopi (Barista Performance)</h3>
              <p className="text-slate-400 text-xs">Monitoring kecepatan barista menyeduh minuman dan meracik snack KDS.</p>
            </div>
            <Users className="w-5 h-5 text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Nama Barista</th>
                  <th className="px-4 py-3 text-center">Jumlah Cups Dibuat</th>
                  <th className="px-4 py-3 text-center">Rata-Rata Waktu</th>
                  <th className="px-4 py-3 text-right">Kepuasan Rata-Rata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {BARISTA_STATS_DATA.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-semibold text-slate-700 flex items-center space-x-2">
                      <div className="w-7 h-7 bg-amber-100 text-amber-700 font-bold rounded-full flex items-center justify-center text-xs">
                        {b.name.charAt(8)}
                      </div>
                      <span>{b.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">{b.completedOrders} Gelas</td>
                    <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-500">
                      {b.avgTimeMinutes} Menit / cup
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-amber-500">
                      <div className="flex items-center justify-end space-x-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{b.activeRating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alert Quick Feed & Supplier Orders */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-rose-600 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Alert Bahan Baku Kritis
              </h3>
              <p className="text-slate-400 text-xs">Beri input instan untuk restock material berikut.</p>
            </div>
          </div>

          <div className="space-y-3">
            {ingredients.map(ing => {
              const isLow = ing.stock <= ing.minimumStock;
              return (
                <div key={ing.id} className={`p-3 rounded-lg border flex flex-col justify-between gap-2.5 transition ${
                  isLow ? 'bg-rose-50/60 border-rose-100' : 'bg-slate-50/60 border-slate-100'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-700 text-xs">{ing.name}</h4>
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5">
                        <span>Min Stok: {ing.minimumStock} {ing.unit}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isLow ? 'bg-rose-100 text-rose-700' : 'bg-green-150 text-green-700'
                    }`}>
                      Stok: {ing.stock} {ing.unit}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => onAddStock(ing.id, ing.unit === 'Gram' ? 2000 : 5000)}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] py-1 px-2.5 rounded font-bold transition focus:outline-none"
                    >
                      + Tambah Stok 
                    </button>
                    <button 
                      onClick={() => alert(`Supplier dihubungi via email (${suppliers[0]?.email}) untuk pemesanan tambahan ${ing.name}!`)}
                      className="bg-white border border-slate-250 text-slate-600 hover:bg-slate-50 text-[10px] p-1 rounded transition"
                      title="Hubungi Supplier"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* EXPORT REPORT BUILDER PANEL (CSV, EXCEL, PDF IN-APP VIEWER) */}
      <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-5 gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base">Modul Export Laporan (Excel / PDF / CSV)</h3>
            <p className="text-slate-400 text-xs">Pilih database ekspor, saring data untuk kebutuhan pelaporan Anda.</p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor File CSV (Excel Format)</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setReportType('sales')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              reportType === 'sales'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Laporan Penjualan (Harian/Bulanan)
          </button>
          <button
            onClick={() => setReportType('products')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              reportType === 'products'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Laporan Kopi Terlaris (Top 10)
          </button>
          <button
            onClick={() => setReportType('barista')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              reportType === 'barista'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Laporan Barista KDS
          </button>
          <button
            onClick={() => setReportType('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              reportType === 'inventory'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Laporan Stok Gudang
          </button>
        </div>

        {/* Live Preview Console based on selection */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 max-h-56 overflow-y-auto">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span>Preview Laporan Realtime ({reportType})</span>
            <span className="text-amber-500 font-semibold animate-pulse">● Live Data Synced</span>
          </div>

          <table className="w-full text-left font-mono text-xs text-slate-700">
            {reportType === 'sales' && (
              <>
                <thead className="text-[11px] text-slate-400 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2">Kode Order</th>
                    <th className="py-2">Pelanggan</th>
                    <th className="py-2">Cabang</th>
                    <th className="py-2">Pembayaran</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-1.5 font-bold text-amber-700">{o.code}</td>
                      <td className="py-1.5">{o.customerName}</td>
                      <td className="py-1.5 truncate max-w-[120px]">{o.outletName.split(' - ')[1] || o.outletName}</td>
                      <td className="py-1.5 text-xs text-slate-500">{o.paymentMethod || 'Cash'} ({o.paymentStatus})</td>
                      <td className="py-1.5 text-right font-bold">{formatRupiah(o.totalPayable)}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'products' && (
              <>
                <thead className="text-[11px] text-slate-400 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2">Rank</th>
                    <th className="py-2">Nama Menu</th>
                    <th className="py-2 text-center">Gelas Terjual</th>
                    <th className="py-2 text-right">Pendapatan Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.allProductSellers.map((val, idx) => (
                    <tr key={val.id}>
                      <td className="py-1.5 font-bold">#{idx + 1}</td>
                      <td className="py-1.5 text-slate-800 font-semibold">{val.name}</td>
                      <td className="py-1.5 text-center">{val.qty} Cup</td>
                      <td className="py-1.5 text-right font-bold text-emerald-600">{formatRupiah(val.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'barista' && (
              <>
                <thead className="text-[11px] text-slate-400 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2">Nama Pengguna</th>
                    <th className="py-2">Tugas Selesai</th>
                    <th className="py-2 text-center">Waktu Seduh Rata-Rata</th>
                    <th className="py-2 text-right">Rating Layanan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {BARISTA_STATS_DATA.map((b) => (
                    <tr key={b.id}>
                      <td className="py-1.5 font-semibold">{b.name}</td>
                      <td className="py-1.5">{b.completedOrders} Antrean</td>
                      <td className="py-1.5 text-center">{b.avgTimeMinutes} Menit / Order</td>
                      <td className="py-1.5 text-right text-amber-500 font-bold">★ {b.activeRating}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'inventory' && (
              <>
                <thead className="text-[11px] text-slate-400 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2">Nama Item Masuk</th>
                    <th className="py-2 text-center">Stok Fisik</th>
                    <th className="py-2">Batas Minimum</th>
                    <th className="py-2">Status Gudang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ingredients.map((ing) => (
                    <tr key={ing.id} className={ing.stock <= ing.minimumStock ? 'text-rose-600 font-semibold' : ''}>
                      <td className="py-1.5">{ing.name}</td>
                      <td className="py-1.5 text-center">{ing.stock} {ing.unit}</td>
                      <td className="py-1.5">{ing.minimumStock} {ing.unit}</td>
                      <td className="py-1.5">
                        {ing.stock <= ing.minimumStock ? '⚠️ KELUARKAN PO!' : '✅ Aman'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>

      {/* FEEDBACK LOG & NOTIFICATION PANE CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customer Feedbacks */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Saran & Umpan Balik (Customer Feedback)</h3>
              <p className="text-slate-400 text-xs">Ulasan nyata pelanggan setelah pesanan diselesaikan.</p>
            </div>
            <MessageSquare className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-700 text-xs">{fb.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({fb.orderCode})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{fb.date}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < fb.rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    {fb.categories.map(cat => (
                      <span key={cat} className="bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-slate-600 text-xs italic mt-1 font-sans">
                  "{fb.comments}"
                </p>
              </div>
            ))}

            {feedbacks.length === 0 && (
              <div className="text-center py-12 text-xs text-slate-400">
                Belum ada rating feedback yang terkirim dari pelanggan.
              </div>
            )}
          </div>
        </div>

        {/* Realtime API Integration Logs (WhatsApp & Telegram Alert Simulator) */}
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-xl font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-amber-500 text-sm">Simulasi Notifikasi External (Fonnte/Telegram API)</h3>
              <p className="text-slate-500 text-[10px]">Log pengiriman webhook real-time ke WhatsApp Kasir dan Telegram Owner.</p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 text-[11px]">
            {notifications.slice().map((n) => {
              const isWA = n.channel === 'WhatsApp';
              const isTG = n.channel === 'Telegram';

              return (
                <div key={n.id} className="p-2.5 bg-slate-800/80 rounded border border-slate-700/60 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-700 pb-1">
                    <span className={`font-bold flex items-center gap-1 ${isWA ? 'text-emerald-400' : isTG ? 'text-sky-400' : 'text-slate-400'}`}>
                      <span>■</span>
                      <span>{n.channel} API Webhook</span>
                    </span>
                    <span className="text-slate-450">{n.time} UTC+7</span>
                  </div>

                  <div className="text-slate-350">
                    <span className="text-amber-500 font-semibold mr-1">Tujuan:</span> {n.recipient}
                  </div>
                  <div>
                    <span className="text-amber-500 font-semibold mr-1">Pesan:</span> "{n.message}"
                  </div>

                  <div className="flex items-center justify-between text-[9px] mt-1 text-slate-500">
                    <span>Gateway status: HTTPS 200 OK</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-1 rounded border border-emerald-500/20">Success dispatched</span>
                  </div>
                </div>
              );
            })}

            {notifications.length === 0 && (
              <div className="text-center py-12 text-xs text-slate-500">
                Belum ada notifikasi keluar yang terkirim. Cobalah melunasi pesanan pada POS atau membuat pesanan pelanggan!
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
