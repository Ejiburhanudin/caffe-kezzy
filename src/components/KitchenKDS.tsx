import React, { useEffect, useState } from 'react';
import { Order, UserRole } from '../types';
import { ChefHat, Clock, CheckCircle2, Play, Check, AlertCircle, Coffee, Eye } from 'lucide-react';

interface KitchenKDSProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onAssignedBarista: (orderId: string, baristaName: string) => void;
}

export default function KitchenKDS({
  orders,
  onUpdateOrderStatus,
  onAssignedBarista
}: KitchenKDSProps) {
  // We filter to orders that are NOT Finished ('Selesai')
  const activeOrders = orders.filter(o => o.status !== 'Selesai');
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);

  // Simple live timer simulation for elapsed queues
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeSec(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to calculate elapsed minutes based on mock contextual timestamps
  const getElapsedMinutes = (createdTimeString: string) => {
    // Let's extract the time part e.g. "09:12" and calculate delta against 09:14 context
    try {
      const parts = createdTimeString.split(' ');
      const timeStr = parts.length > 1 ? parts[1] : parts[0];
      const [hours, mins] = timeStr.split(':').map(Number);
      
      const creationTotalMinutes = (hours * 60) + mins;
      const currentTotalMinutes = (9 * 60) + 14; // current simulated time matches: 09:14:29

      const delta = currentTotalMinutes - creationTotalMinutes;
      return Math.max(0, delta);
    } catch {
      return 1;
    }
  };

  const getTimerColor = (elapsedMinutes: number) => {
    if (elapsedMinutes >= 10) return 'bg-rose-500 text-white animate-pulse';
    if (elapsedMinutes >= 5) return 'bg-amber-500 text-white animate-pulse';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-sans">
      
      {/* Banner / Aggregations KDS bar */}
      <div className="bg-slate-930 text-white p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-amber-600 rounded-xl text-white">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Kitchen KDS Tracker (Kitchen Display System)</h1>
            <p className="text-slate-400 text-xs">Papan monitor antrean barista kopi & penata porsi snack.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-mono">
          <div className="bg-slate-800 px-4 py-2 rounded-xl text-slate-300">
            Total Antrean: <span className="text-amber-500 font-extrabold text-sm">{activeOrders.length}</span>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-xl text-slate-300">
            Sedang Dibuat: <span className="text-blue-400 font-extrabold text-sm">
              {activeOrders.filter(o => o.status === 'Sedang Dibuat').length}
            </span>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-xl text-slate-300">
            Siap Diantar: <span className="text-emerald-400 font-extrabold text-sm">
              {activeOrders.filter(o => o.status === 'Siap Diantar').length}
            </span>
          </div>
        </div>
      </div>

      {/* KDS ALARM NOTATION */}
      {activeOrders.some(o => getElapsedMinutes(o.createdTime) >= 10) && (
        <div className="bg-rose-50 border border-rose-250 p-3 rounded-lg flex items-center space-x-2 text-rose-600 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 animate-bounce" />
          <span>⚠️ PERINGATAN KDS: Terdapat drink order di antrean selama lebih dari 10 menit! Utamakan layanan cangkir tersebut.</span>
        </div>
      )}

      {/* TICKET COLUMN CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeOrders.map((order) => {
          const elapsed = getElapsedMinutes(order.createdTime);
          const isOverdue = elapsed >= 10;
          const isWarning = elapsed >= 5 && elapsed < 10;

          return (
            <div 
              key={order.id}
              className={`bg-white rounded-xl border-t-4 shadow-sm flex flex-col justify-between overflow-hidden transition duration-200 hover:shadow ${
                order.status === 'Menunggu' ? 'border-t-rose-500' :
                order.status === 'Diproses' ? 'border-t-yellow-500' :
                order.status === 'Sedang Dibuat' ? 'border-t-blue-500 animate-pulse' :
                'border-t-emerald-500'
              } ${isOverdue ? 'ring-2 ring-rose-500 ring-offset-2' : ''}`}
            >
              <div>
                {/* Ticket Header */}
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-800 text-sm">{order.code}</span>
                    <span className="text-[10px] text-slate-400 font-bold block">Ref: {order.outletName.split(' - ')[1]}</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black flex items-center space-x-1 ${getTimerColor(elapsed)}`}>
                    <Clock className="w-3 h-3 mr-0.5" />
                    <span>{elapsed} mnt lalu</span>
                  </div>
                </div>

                {/* Body Meta */}
                <div className="px-3.5 py-2 bg-slate-50 text-[11px] grid grid-cols-2 gap-1.5 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[9px]">Pelanggan</span>
                    <span className="font-extrabold text-slate-700 truncate max-w-[100px] block">{order.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[9px]">Layanan</span>
                    <span className="font-extrabold text-slate-700 flex items-center gap-1">
                      {order.orderType === 'Dine-In' ? (
                        <span className="text-amber-600">🍽️ {order.tableCode}</span>
                      ) : order.orderType === 'Takeaway' ? (
                        <span className="text-blue-500">🛍️ Takeaway</span>
                      ) : (
                        <span className="text-purple-500">🛵 Delivery</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Item List to Prepare */}
                <div className="p-3.5 space-y-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-start justify-between text-xs font-semibold">
                        <div className="flex items-center space-x-1.5">
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 font-extrabold text-[10px] rounded">
                            {it.qty}x
                          </span>
                          <span className="text-slate-800 font-bold">{it.productName}</span>
                        </div>
                      </div>

                      {/* Display Custom Options (Less Sugar / Extra Shot etc) */}
                      {it.customizations && it.customizations.length > 0 && (
                        <div className="flex flex-wrap gap-1 pl-6 pt-0.5">
                          {it.customizations.map(c => (
                            <span key={c} className="bg-amber-100 text-amber-800 text-[8.5px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-tight">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Barista cooking note */}
                      {it.notes && (
                        <p className="text-[9.5px] text-rose-600 font-semibold pl-6 mt-0.5">
                          ✏️ Note: "{it.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Keys */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
                <div className="text-[10px] text-slate-500 flex items-center justify-between font-mono">
                  <span>Assigned Barista:</span>
                  <span className="font-bold text-amber-600">{order.baristaAssigned || 'None 지정'}</span>
                </div>

                {/* State transitioning workflow */}
                <div className="flex gap-1.5">
                  {!order.baristaAssigned && (
                    <button
                      onClick={() => onAssignedBarista(order.id, 'Barista Rangga')}
                      className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition text-center uppercase"
                    >
                      Ambil Pekerjaan
                    </button>
                  )}

                  {order.baristaAssigned && (
                    <>
                      {order.status === 'Menunggu' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'Sedang Dibuat')}
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition text-center uppercase flex items-center justify-center space-x-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Buat (Brew)</span>
                        </button>
                      )}

                      {order.status === 'Sedang Dibuat' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'Siap Diantar')}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition text-center uppercase flex items-center justify-center space-x-1 shadow-sm"
                        >
                          <Coffee className="w-3.5 h-3.5 animate-bounce" />
                          <span>Siap Diantar</span>
                        </button>
                      )}

                      {order.status === 'Siap Diantar' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'Selesai')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition text-center uppercase flex items-center justify-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Serahkan (Done)</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>
          );
        })}

        {activeOrders.length === 0 && (
          <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-24 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-sm">Wah, Dapur Sedang Kosong!</h4>
            <p className="text-xs text-slate-405 mt-1">Belum ada pesanan aktif masuk dari kasir atau QR pelanggan.</p>
          </div>
        )}
      </div>

    </div>
  );
}
