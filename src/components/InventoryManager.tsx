import React, { useState } from 'react';
import { Ingredient, Supplier, PurchaseHistory } from '../types';
import { formatRupiah } from '../utils/helpers';
import { 
  Package, Plus, Minus, AlertTriangle, History, Users, 
  Truck, ArrowUpRight, ArrowDownLeft, Phone, Mail, ShoppingCart, CheckCircle 
} from 'lucide-react';

interface InventoryManagerProps {
  ingredients: Ingredient[];
  suppliers: Supplier[];
  onAddStock: (ingId: string, amount: number) => void;
  onDeductStock: (ingId: string, amount: number) => void;
  onRegisterSupplier: (supplier: Supplier) => void;
  onAddPurchase: (supplierId: string, purchase: PurchaseHistory) => void;
}

export default function InventoryManager({
  ingredients,
  suppliers,
  onAddStock,
  onDeductStock,
  onRegisterSupplier,
  onAddPurchase
}: InventoryManagerProps) {
  // Inventory operations
  const [adjustingIngId, setAdjustingIngId] = useState<string>('');
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustNotes, setAdjustNotes] = useState<string>('Penyesuaian manual');

  // Supplier forms
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');

  // Purchase order forms
  const [showPOModal, setShowPOModal] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poItemName, setPoItemName] = useState('');
  const [poQty, setPoQty] = useState(10);
  const [poTotalPrice, setPoTotalPrice] = useState(150000);

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingIngId) return;

    if (adjustType === 'in') {
      onAddStock(adjustingIngId, adjustAmount);
    } else {
      onDeductStock(adjustingIngId, adjustAmount);
    }

    setAdjustingIngId('');
    setAdjustAmount(100);
    setAdjustNotes('Penyesuaian manual');
    alert('Stok bahan baku berhasil diperbarui!');
  };

  const handleRegisterSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName) {
      alert('Nama Supplier wajib diisi!');
      return;
    }

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: newSupName,
      address: newSupAddress,
      phone: newSupPhone,
      email: newSupEmail,
      purchases: []
    };

    onRegisterSupplier(newSup);
    setShowSupplierModal(false);
    
    setNewSupName('');
    setNewSupAddress('');
    setNewSupPhone('');
    setNewSupEmail('');
    alert('Supplier baru berhasil didaftarkan!');
  };

  const handlePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId || !poItemName) {
      alert('Pilih supplier dan barang PO!');
      return;
    }

    const newPO: PurchaseHistory = {
      id: `po-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      itemName: poItemName,
      qty: poQty,
      totalPrice: poTotalPrice,
      status: 'Menunggu'
    };

    onAddPurchase(poSupplierId, newPO);
    setShowPOModal(false);

    setPoSupplierId('');
    setPoItemName('');
    setPoQty(10);
    setPoTotalPrice(150000);
    alert('Purchase Order (PO) didaftarkan! Tagihan berstatus menunggu.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 font-sans text-slate-800">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Manajemen Inventory & Supplier</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gudang pusat bahan baku, kontrol stok kritis harian, registrasi mitra, dan purchase order (PO).
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition"
          >
            + Mitra Supplier Baru
          </button>
          
          <button
            onClick={() => setShowPOModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition shadow"
          >
            + Buat Purchase Order (PO)
          </button>
        </div>
      </div>

      {/* SECTION 1: MATERIALS GRID (RAW INGREDIENTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live inventory monitor listing */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center">
              <Package className="w-5 h-5 mr-1.5 text-amber-600" />
              Sisa Stok Bahan Baku Fisik
            </h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
              Synced with Kitchen
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ingredients.map(ing => {
              const MathLeft = ing.stock <= ing.minimumStock;
              return (
                <div key={ing.id} className={`p-4 rounded-xl border transition duration-200 ${
                  MathLeft ? 'bg-rose-50/60 border-rose-200 shadow-rose-50/20' : 'bg-slate-50/50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-700 text-xs md:text-sm">{ing.name}</h4>
                      <p className="text-slate-400 text-[10.5px] mt-0.5">Batas Minimum: {ing.minimumStock} {ing.unit}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                      MathLeft ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-green-100 text-green-700'
                    }`}>
                      {MathLeft ? 'LOW STOCK' : 'PREMIUM'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-b border-slate-200 pb-2 mb-2">
                    <span className="text-slate-450 text-[11px]">Sisa di Gudang:</span>
                    <span className="text-lg font-black font-mono text-slate-800">
                      {ing.stock} <span className="text-xs text-slate-400 font-semibold">{ing.unit}</span>
                    </span>
                  </div>

                  {/* Trigger Manual Adjustments panel anchor inline */}
                  <button
                    onClick={() => setAdjustingIngId(ing.id)}
                    className="w-full text-center bg-white border border-slate-250 hover:bg-slate-50 text-slate-600 font-bold text-[10.5px] py-1.5 rounded transition uppercase"
                  >
                    Atur Manual (In / Out)
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Adjustments Form pop out in col 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3 mb-4 flex items-center">
            <History className="w-5 h-5 mr-1.5 text-amber-600" />
            Penyesuaian Stok Cepat
          </h3>

          {adjustingIngId ? (
            <form onSubmit={handleAdjustStockSubmit} className="space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-amber-50 rounded border border-amber-200 text-slate-600 text-[11px] font-semibold leading-relaxed">
                ✏️ Melakukan perbaikan stok fisik untuk: 
                <span className="font-extrabold text-slate-800 block mt-0.5">
                  {ingredients.find(i => i.id === adjustingIngId)?.name}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-400 uppercase block mb-1">Pilih Jenis Operasi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('in')}
                    className={`py-1.5 rounded font-bold uppercase ${
                      adjustType === 'in' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    Stok Masuk (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('out')}
                    className={`py-1.5 rounded font-bold uppercase ${
                      adjustType === 'out' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    Stok Keluar (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-400 uppercase block mb-1">Jumlah Gram / mL / Pcs</label>
                <input 
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs focus:ring-1 focus:ring-amber-500 text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 uppercase block mb-1">Catatan Lokasi / Alasan</label>
                <input 
                  type="text"
                  placeholder="Misal: Tumpah di bar / sisa filter"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingIngId('')}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 rounded-lg py-1.5 font-bold"
                >
                  Batal
                </button>
                
                <button
                  type="submit"
                  className="flex-grow bg-amber-600 hover:bg-amber-700 text-white font-black py-1.5 rounded-lg shadow-sm"
                >
                  Simpan Stok
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-20 text-slate-400 leading-normal">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>Klik <span className="font-semibold text-slate-650">"Atur Manual"</span> pada menu cangkir bahan baku di kiri untuk merubah stok secara langsung.</span>
            </div>
          )}
        </div>

      </div>

      {/* SECTION 2: SUPPLIERS PROFILES & PROCUREMENT HISTORY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Suppliers Contact List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center">
              <Users className="w-5 h-5 mr-1.5 text-amber-600" />
              Daftar Mitra Penyalur (Suppliers Contact)
            </h3>
          </div>

          <div className="space-y-3">
            {suppliers.map(sup => (
              <div key={sup.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-700 text-xs md:text-sm">{sup.name}</h4>
                  <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded">
                    Mitra Utama
                  </span>
                </div>

                <p className="text-slate-405 text-xs font-serif italic">📍 {sup.address}</p>

                <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-500 pt-1 border-t border-slate-150">
                  <span className="flex items-center"><Phone className="w-3.5 h-3.5 text-slate-400 mr-1" /> {sup.phone}</span>
                  <span className="flex items-center"><Mail className="w-3.5 h-3.5 text-slate-400 mr-1 animate-pulse" /> {sup.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase Orders history */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center">
              <Truck className="w-5 h-5 mr-1.5 text-amber-600" />
              Riwayat Pembelian Bahan Baku (Purchase Order - PO)
            </h3>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-600 font-mono">
              <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider border-b">
                <tr>
                  <th className="px-3 py-2">Vendor</th>
                  <th className="px-3 py-2">Barang PO</th>
                  <th className="px-3 py-2 text-center">Jumlah</th>
                  <th className="px-3 py-2 text-right">Tagihan Nett</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.flatMap(s => 
                  s.purchases.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-3 font-semibold text-slate-800 truncate max-w-[110px]">{s.name.split(' ')[1] || s.name}</td>
                      <td className="px-3 py-3 truncate max-w-[120px]">{p.itemName}</td>
                      <td className="px-3 py-3 text-center">{p.qty}</td>
                      <td className="px-3 py-3 text-right text-slate-800 font-bold">{formatRupiah(p.totalPrice)}</td>
                      <td className="px-3 py-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          p.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL 1: Mitra Supplier Registry */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRegisterSupplierSubmit} className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 text-xs text-slate-700">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center">
                <Truck className="w-5 h-5 mr-1 text-amber-600" />
                Registrasi Mitra Supplier Baru
              </h3>
              <button 
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Nama Perusahaan / Supplier</label>
                <input 
                  type="text"
                  placeholder="Contoh: PT Dairy Fresh Indo"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Alamat Gudang / Pusat Penyebaran</label>
                <input 
                  type="text"
                  placeholder="Jl. Raya Perindustrian kav. 12..."
                  value={newSupAddress}
                  onChange={(e) => setNewSupAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Nomor Telepon Kantor</label>
                  <input 
                    type="text"
                    placeholder="021-xxxxxxxx"
                    value={newSupPhone}
                    onChange={(e) => setNewSupPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">Email Sales</label>
                  <input 
                    type="email"
                    placeholder="sales@dairyfresh.com"
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2.5 rounded-lg transition"
            >
              Daftarkan Supplier Resmi
            </button>
          </form>
        </div>
      )}

      {/* MODAL 2: Create Purchase Order (PO) */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
          <form onSubmit={handlePOSubmit} className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 text-xs text-slate-700">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center">
                <ShoppingCart className="w-5 h-5 mr-1 text-amber-600" />
                Buat Purchase Order Restock (PO)
              </h3>
              <button 
                type="button"
                onClick={() => setShowPOModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Pilih Vendor Supplier</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-l py-1.5 px-3 font-semibold"
                >
                  <option value="">-- Pilih --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Nama Barang & Detail Satuan</label>
                <input 
                  type="text"
                  placeholder="cth: Susu Fresh Karton Greenfield (20L)"
                  value={poItemName}
                  onChange={(e) => setPoItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Kuantitas Pemesanan</label>
                  <input 
                    type="number"
                    value={poQty}
                    onChange={(e) => setPoQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">Estimasi Harga (IDR)</label>
                  <input 
                    type="number"
                    value={poTotalPrice}
                    onChange={(e) => setPoTotalPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none font-bold font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2.5 rounded-lg transition"
            >
              Kirim Surat Pemesanan PO (Menunggu Tagihan)
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
