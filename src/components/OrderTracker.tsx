import React from 'react';
import { Order, DiningTable } from '../types';
import { formatRupiah } from '../utils/helpers';
import { 
  Bell, Car, Check, User, MapPin, Search, ArrowRight, Eye, Sparkles, MessageSquare, Star, Clock
} from 'lucide-react';

interface OrderTrackerProps {
  orders: Order[];
  tables: DiningTable[];
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  onUpdateDeliveryStatus: (id: string, deliveryStatus: Order['deliveryStatus']) => void;
  onUpdateTableStatus: (tableId: string, status: DiningTable['status']) => void;
}

export default function OrderTracker({
  orders,
  tables,
  onUpdateOrderStatus,
  onUpdateDeliveryStatus,
  onUpdateTableStatus
}: OrderTrackerProps) {
  // Filters
  const readyForWaiter = orders.filter(o => o.status === 'Siap Diantar' && o.orderType === 'Dine-In');
  const deliveryOrders = orders.filter(o => o.orderType === 'Delivery' && o.status !== 'Selesai');
  const allOrdersSorted = orders.slice().sort((a, b) => b.createdTime.localeCompare(a.createdTime));

  const handleWaiterServe = (order: Order) => {
    onUpdateOrderStatus(order.id, 'Selesai');
    // If table selected, vacate
    if (order.tableId) {
      onUpdateTableStatus(order.tableId, 'Kosong');
    }
    alert(`Pesanan ${order.code} disajikan ke ${order.tableCode}! Meja kembali siap digunakan.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 font-sans text-slate-800">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight">Manajemen Pelayanan & Delivery</h1>
        <p className="text-slate-500 text-sm mt-1">
          Halaman kerja untuk pelayan resto (Dine-In dispatcher) dan kurir antar (Delivery driver coordinator).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL A: PELAYAN DISPATCHER (Dine-In Waiter list) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center">
              <Bell className="w-5 h-5 mr-1.5 text-amber-600" />
              Drink Dispatcher (Tugas Antar Pelayan)
            </h3>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">
              LIVE WAITER FEED
            </span>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {readyForWaiter.map(o => (
              <div key={o.id} className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg flex justify-between items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-xs md:text-sm">{o.code}</span>
                    <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.2 rounded">
                      {o.tableCode} (Dine-In)
                    </span>
                  </div>
                  <p className="text-slate-450 text-[10px]">Atas nama: <span className="font-bold text-slate-650">{o.customerName}</span></p>
                  
                  {/* Item descriptions */}
                  <div className="text-xs text-slate-600 pt-1.5 border-t border-dashed border-amber-205">
                    {o.items.map((it, idx) => (
                      <span key={idx} className="block font-bold">
                        • {it.qty}x {it.productName} {it.customizations ? `(${it.customizations.join(', ')})` : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleWaiterServe(o)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 px-4 rounded-lg shadow-sm transition whitespace-nowrap"
                >
                  Sajikan Ke Meja
                </button>
              </div>
            ))}

            {readyForWaiter.length === 0 && (
              <div className="text-center py-20 text-slate-400 text-xs leading-normal">
                ☕ Antrean saji segar kosong. Menunggu barista melunasi frothed drinks di KDS!
              </div>
            )}
          </div>
        </div>

        {/* PANEL B: DELIVERY COURIER (Ojek Online Driver Coordinator) */}
        <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center">
              <Car className="w-5 h-5 mr-1.5 text-amber-600" />
              Delivery Drivers (Kurir Antar Lokasi)
            </h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
              Gosend / Grab / Shopee
            </span>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {deliveryOrders.map(o => {
              const dStatus = o.deliveryStatus || 'Menunggu Driver';
              return (
                <div key={o.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-700 text-xs md:text-sm">{o.code}</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-1.5 rounded uppercase">
                          DELIVERY LINKED
                        </span>
                      </div>
                      <p className="text-slate-400 text-[10px] mt-0.5">Alamat: Jl. Sudirman Central Blok C no. 4, Jakarta</p>
                    </div>

                    <span className="text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                      {dStatus}
                    </span>
                  </div>

                  <div className="flex gap-2.5">
                    {dStatus === 'Menunggu Driver' && (
                      <button
                        onClick={() => onUpdateDeliveryStatus(o.id, 'Diambil Driver')}
                        className="flex-grow bg-slate-700 hover:bg-slate-800 text-white text-[10.5px] font-bold py-1.5 rounded-lg transition"
                      >
                        Tugaskan Driver Kurir
                      </button>
                    )}

                    {dStatus === 'Diambil Driver' && (
                      <button
                        onClick={() => onUpdateDeliveryStatus(o.id, 'Dalam Pengiriman')}
                        className="flex-grow bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-bold py-1.5 rounded-lg transition"
                      >
                        Driver Meluncur Ke Alamat (Kirim)
                      </button>
                    )}

                    {dStatus === 'Dalam Pengiriman' && (
                      <button
                        onClick={() => {
                          onUpdateDeliveryStatus(o.id, 'Selesai');
                          onUpdateOrderStatus(o.id, 'Selesai');
                          alert(`Pesanan Delivery ${o.code} selesai diantar kurir!`);
                        }}
                        className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold py-1.5 rounded-lg transition"
                      >
                        Tandai Selesai Diterima Customer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {deliveryOrders.length === 0 && (
              <div className="text-center py-20 text-slate-400 text-xs border-dashed border-2 border-slate-100 rounded-lg">
                Tidak ada pesanan delivery aktif saat ini.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ALL OVERALL ORDERS HISTORY LOG TABLE */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 text-sm md:text-base border-b border-slate-105 pb-3">
          Histori Seluruh Transaksi Penjualan
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 font-mono">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest border-b">
              <tr>
                <th className="px-4 py-2.5">Kode Transaksi</th>
                <th className="px-4 py-2.5">Nama Customer</th>
                <th className="px-4 py-2.5">Tipe Saji</th>
                <th className="px-4 py-2.5">Detail Gelas</th>
                <th className="px-4 py-2.5 text-right">Total Billing</th>
                <th className="px-4 py-2.5 text-center">Status Masak</th>
                <th className="px-4 py-2.5 text-right">Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allOrdersSorted.map(o => (
                <tr key={o.id} className="hover:bg-slate-55/40">
                  <td className="px-4 py-3 font-bold text-amber-700">{o.code}</td>
                  <td className="px-4 py-3 font-semibold text-slate-805">{o.customerName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.orderType === 'Dine-In' ? 'bg-amber-100 text-amber-800' :
                      o.orderType === 'Takeaway' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {o.orderType} {o.tableCode ? `(${o.tableCode})` : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 truncate max-w-[200px] text-slate-500 font-sans">
                    {o.items.map(it => `${it.qty}x ${it.productName}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-slate-800">{formatRupiah(o.totalPayable)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      o.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                      o.status === 'Siap Diantar' ? 'bg-blue-150 text-blue-800 animate-pulse' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      o.paymentStatus === 'Lunas' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {o.paymentMethod || 'Cash'} ({o.paymentStatus})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
