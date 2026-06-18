import React, { useState } from 'react';
import { Product, Category, Order, OrderItem, DiningTable, Membership, Voucher, Outlet } from '../types';
import { formatRupiah, getQRCodeUrl } from '../utils/helpers';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, Tag, UserPlus, 
  CreditCard, Check, Ticket, ChevronRight, Layers, Receipt, Award, Landmark, MapPin,
  Printer, Copy
} from 'lucide-react';

interface POSKasirProps {
  products: Product[];
  categories: Category[];
  tables: DiningTable[];
  memberships: Membership[];
  vouchers: Voucher[];
  activeOutlet: Outlet;
  onAddOrder: (order: Order) => void;
  onUpdateTableStatus: (tableId: string, status: 'Kosong' | 'Terisi' | 'Reservasi') => void;
}

export default function POSKasir({
  products,
  categories,
  tables,
  memberships,
  vouchers,
  activeOutlet,
  onAddOrder,
  onUpdateTableStatus
}: POSKasirProps) {
  // POS States
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [currentOrderType, setCurrentOrderType] = useState<'Dine-In' | 'Takeaway' | 'Delivery'>('Dine-In');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Membership & Voucher coupling
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [appliedVoucherId, setAppliedVoucherId] = useState<string>('');
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherError, setVoucherError] = useState('');
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Debit' | 'Kredit' | 'QRIS' | 'E-Wallet'>('Cash');
  const [cashFromCustomer, setCashFromCustomer] = useState<number>(0);
  
  // Modals & Panels
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [savedLastOrder, setSavedLastOrder] = useState<Order | null>(null);

  // Split bill helper state
  const [splitCount, setSplitCount] = useState<number>(2);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory && p.isAvailable;
  });

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        qty: 1,
        price: product.price,
        customizations: [],
        notes: ''
      }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean) as OrderItem[];
    });
  };

  const handleUpdateNotes = (productId: string, notes: string) => {
    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, notes } : item
    ));
  };

  const handleToggleCustomization = (productId: string, opt: string) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const customizations = item.customizations || [];
        const hasOpt = customizations.includes(opt);
        return {
          ...item,
          customizations: hasOpt 
            ? customizations.filter(c => c !== opt) 
            : [...customizations, opt]
        };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  // Voucher evaluation
  const voucherObj = vouchers.find(v => v.id === appliedVoucherId);
  let discount = 0;
  if (voucherObj && subtotal >= voucherObj.minPurchase) {
    if (voucherObj.type === 'percentage') {
      discount = Math.round((subtotal * voucherObj.value) / 100);
    } else if (voucherObj.type === 'nominal') {
      discount = voucherObj.value;
    } else if (voucherObj.type === 'buy1get1') {
      // Find eligible items (e.g., drinks)
      const eligibleItem = cart.find(i => i.price >= 15000);
      if (eligibleItem) {
        discount = eligibleItem.price; // Give one free of its value
      }
    }
  }

  const tax = Math.round((subtotal - discount) * 0.1); // Standard 10% tax
  const grandTotal = Math.max(0, subtotal - discount + tax);

  const applyVoucherCode = () => {
    const code = voucherCodeInput.trim().toUpperCase();
    const found = vouchers.find(v => v.code === code);
    if (!found) {
      setVoucherError('Kode voucher tidak ditemukan');
      setAppliedVoucherId('');
      return;
    }
    if (subtotal < found.minPurchase) {
      setVoucherError(`Min purchase untuk voucher ini: ${formatRupiah(found.minPurchase)}`);
      setAppliedVoucherId('');
      return;
    }
    setVoucherError('');
    setAppliedVoucherId(found.id);
  };

  // Quick select customer member details
  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    const mObj = memberships.find(m => m.id === memberId);
    if (mObj) {
      setCustomerName(mObj.name);
      setCustomerPhone(mObj.phone);
    }
  };

  // Submit complete order
  const handleCheckoutSubmit = () => {
    if (cart.length === 0) return;
    if (currentOrderType === 'Dine-In' && !selectedTableId) {
      alert('Pilih nomor meja terlebih dahulu untuk tipe makan di tempat!');
      return;
    }
    if (!customerName) {
      alert('Masukkan nama pelanggan!');
      return;
    }

    const tCode = tables.find(t => t.id === selectedTableId)?.code;
    const orderCode = `#COF-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-pos-${Date.now()}`,
      code: orderCode,
      outletId: activeOutlet.id,
      outletName: activeOutlet.name,
      customerName,
      customerPhone,
      tableId: currentOrderType === 'Dine-In' ? selectedTableId : undefined,
      tableCode: currentOrderType === 'Dine-In' ? tCode : undefined,
      items: [...cart],
      totalOriginal: subtotal,
      discount,
      tax,
      totalPayable: grandTotal,
      paymentMethod,
      paymentStatus: 'Lunas', // Kasir inputs are immediately considered settled
      orderType: currentOrderType,
      status: 'Menunggu', // Kitchen starts preparing
      createdTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    // Trigger parent callback to append and raise notifications
    onAddOrder(newOrder);

    // If Dine-in, assign table status to Terisi
    if (currentOrderType === 'Dine-In' && selectedTableId) {
      onUpdateTableStatus(selectedTableId, 'Terisi');
    }

    // Capture order details to preview on receipt printer modal
    setSavedLastOrder(newOrder);
    setCashFromCustomer(grandTotal); // default cash to absolute amount
    setShowInvoiceModal(true);

    // Reset fields
    setCart([]);
    setSelectedTableId('');
    setCustomerName('');
    setCustomerPhone('');
    setSelectedMemberId('');
    setAppliedVoucherId('');
    setVoucherCodeInput('');
  };

  // Direct High-Fidelity Receipt isolated print via dynamic hidden iframe
  const handlePrintReceipt = () => {
    const receiptElement = document.getElementById('thermal-receipt');
    if (!receiptElement) {
      alert('Struk tidak ditemukan!');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const fontLink = `<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Inter:wght@400;500;700&display=swap" rel="stylesheet">`;
    const styles = `
      <style>
        body {
          font-family: 'JetBrains Mono', monospace;
          padding: 15px;
          margin: 0;
          width: 72mm; /* Fits both 58mm and 80mm roll printer settings */
          color: #1e293b;
          font-size: 11px;
          line-height: 1.4;
          box-sizing: border-box;
          background-color: #ffffff;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .font-black { font-weight: 800; }
        .font-bold { font-weight: 700; }
        .font-extrabold { font-weight: 800; }
        .text-xs { font-size: 9px; }
        .text-[10px] { font-size: 10px; }
        .text-[11px] { font-size: 11px; }
        .text-slate-500 { color: #64748b; }
        .text-slate-400 { color: #94a3b8; }
        .text-rose-600 { color: #e11d48; }
        .text-amber-700 { color: #b45309; }
        .italic { font-style: italic; }
        .mt-5 { margin-top: 1.25rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .space-y-0.5 > * + * { margin-top: 0.125rem; }
        .space-y-1 > * + * { margin-top: 0.25rem; }
        .space-y-1.5 > * + * { margin-top: 0.375rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .border-t { border-top: 1px dashed #64748b; padding-top: 5px; }
        .border-dashed { border-style: dashed; }
        .pt-2 { padding-top: 0.5rem; }
        .pb-2 { padding-bottom: 0.5rem; }
        .w-full { width: 100%; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .max-w-[120px] { max-width: 120px; }
        .max-w-[170px] { max-width: 170px; }
        .absolute { display: none !important; } /* Hide decoration scissor line */
        .qr-print-container {
          margin-top: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px dashed #cbd5e1;
          padding: 8px;
          background: white;
        }
        .qr-img {
          width: 80px;
          height: 80px;
        }
      </style>
    `;

    const content = receiptElement.innerHTML;

    doc.open();
    doc.write('<html><head><title>Struk Pembayaran</title>' + fontLink + styles + '</head><body>');
    doc.write('<div style="width: 100%; max-width: 100%;">' + content + '</div>');
    doc.write('</body></html>');
    doc.close();

    // Trigger printing inside iframe
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print iframe error:', err);
      }
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 400);
  };

  // Plaintext ASCII receipt exporter for copy-pasting to mobile apps
  const handleCopyTextReceipt = () => {
    if (!savedLastOrder) return;
    const divider = '--------------------------------\\n';
    const doubleDivider = '================================\\n';
    
    let txt = '';
    txt += '       KOPI SENJA COFFEE        \\n';
    txt += `  \${activeOutlet.address.substring(0, 26).padEnd(26)}  \\n`;
    txt += `     Telp: \${activeOutlet.phone}     \\n`;
    txt += divider;
    txt += `No Trans : \${savedLastOrder.code}\\n`;
    txt += `Waktu    : \${savedLastOrder.createdTime}\\n`;
    if (savedLastOrder.tableCode) {
      txt += `Meja     : \${savedLastOrder.tableCode}\\n`;
    }
    txt += `Pelanggan: \${savedLastOrder.customerName.substring(0, 18)}\\n`;
    txt += `Tipe     : \${savedLastOrder.orderType}\\n`;
    txt += divider;
    
    savedLastOrder.items.forEach(i => {
      const itemTotal = formatRupiah(i.price * i.qty);
      txt += `\${i.productName.substring(0, 22).padEnd(22)} \${itemTotal.padStart(9)}\\n`;
      txt += `  \${i.qty} x \${formatRupiah(i.price)}\\n`;
      if (i.customizations && i.customizations.length > 0) {
        txt += `  * \${i.customizations.join(', ')}\\n`;
      }
      if (i.notes) {
        txt += `  * Note: \${i.notes}\\n`;
      }
    });
    
    txt += divider;
    txt += `Subtotal  : \${formatRupiah(savedLastOrder.totalOriginal).padStart(18)}\\n`;
    if (savedLastOrder.discount > 0) {
      txt += `Diskon    : -\${formatRupiah(savedLastOrder.discount).padStart(17)}\\n`;
    }
    txt += `Pajak 10% : \${formatRupiah(savedLastOrder.tax).padStart(18)}\\n`;
    txt += doubleDivider;
    txt += `TOTAL NETT: \${formatRupiah(savedLastOrder.totalPayable).padStart(18)}\\n`;
    txt += `Metode    : \${savedLastOrder.paymentMethod.padStart(18)}\\n`;
    txt += doubleDivider;
    txt += '      TERIMA KASIH BANYAK       \\n';
    txt += '     ATAS KUNJUNGAN ANDA        \\n';
    txt += '   🌱 Kopi Kenangan Senja 🌱    \\n';
    
    navigator.clipboard.writeText(txt)
      .then(() => alert('Teks struk berhasil disalin ke clipboard! Siap dipaste ke Bluetooth Printer.'))
      .catch((err) => {
        console.error('Failed to copy text:', err);
        alert('Gagal menyalin teks ke clipboard.');
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* LEFT PANE: PRODUCT MENU GRID (7 COLS) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Category filtering & Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari menu kopi, matcha, croissant, teh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Categories flex bubble */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto max-w-full pb-1">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition ${
                selectedCategoryId === 'all'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Semua Menu
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition flex items-center space-x-1 ${
                  selectedCategoryId === cat.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredProducts.map((p) => {
            const qtyInCart = cart.find(item => item.productId === p.id)?.qty || 0;
            return (
              <div 
                key={p.id}
                onClick={() => handleAddToCart(p)}
                className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 cursor-pointer transition flex flex-col justify-between relative overflow-hidden group"
              >
                {qtyInCart > 0 && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm z-10">
                    {qtyInCart}
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="h-28 rounded-lg overflow-hidden relative">
                    <img 
                      src={p.image} 
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Est. {p.estimationMinutes} mnt
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1 group-hover:text-amber-600 transition">
                      {p.name}
                    </h3>
                    <p className="text-slate-400 text-[10px] line-clamp-2 mt-0.5">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-slate-800 text-xs md:text-sm">
                    {formatRupiah(p.price)}
                  </span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold group-hover:bg-amber-600 group-hover:text-white transition">
                    + Tambah
                  </span>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-405 font-medium">
              Menu tidak ditemukan. Coba ketik kata kunci lain!
            </div>
          )}
        </div>

      </div>

      {/* RIGHT PANE: BASKET, CUSTOMER, CHECKOUT CONFIGS (5 COLS) */}
      <div className="lg:col-span-5 bg-white rounded-xl border border-slate-205 shadow-sm p-4 space-y-4">
        
        {/* Shopping Cart Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-800">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-base">Keranjang Pesanan ({cart.reduce((a, b) => a + b.qty, 0)})</h2>
          </div>
          {cart.length > 0 && (
            <button 
              onClick={() => { if(confirm('Kosongkan keranjang?')) setCart([]); }}
              className="text-rose-600 text-xs font-semibold flex items-center space-x-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          )}
        </div>

        {/* Selected Items Scroll Area */}
        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {cart.map((item) => (
            <div key={item.productId} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-700 text-xs">{item.productName}</h4>
                  <span className="text-[11px] font-bold text-slate-500">{formatRupiah(item.price)}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white border rounded">
                  <button onClick={() => handleUpdateQty(item.productId, -1)} className="p-1 hover:bg-slate-100 transition"><Minus className="w-3 h-3 text-slate-600" /></button>
                  <span className="font-mono text-xs font-bold text-slate-800 w-4 text-center">{item.qty}</span>
                  <button onClick={() => handleAddToCart(products.find(p => p.id === item.productId)!)} className="p-1 hover:bg-slate-100 transition"><Plus className="w-3 h-3 text-slate-600" /></button>
                </div>
              </div>

              {/* Advanced Customizations Selector for Latte/Cappuccino/Coffee drinks */}
              <div className="pt-1.5 border-t border-dashed border-slate-200 flex flex-wrap gap-1 items-center">
                <span className="text-[9px] text-slate-400 font-bold mr-1 uppercase">Opsi:</span>
                {['Less Sugar', 'Extra Shot', 'Oatmilk (+Rp5k)'].map((opt) => {
                  const active = item.customizations?.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => handleToggleCustomization(item.productId, opt)}
                      className={`text-[9px] py-0.5 px-2 rounded-full font-bold transition ${
                        active 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Cooking Notes Input */}
              <div>
                <input
                  type="text"
                  placeholder="Tambah catatan (Contoh: tidak pakai es)"
                  value={item.notes || ''}
                  onChange={(e) => handleUpdateNotes(item.productId, e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded text-[10px] py-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center gap-2">
              <ShoppingCart className="w-8 h-8 text-slate-300" />
              <span>Keranjang masih kosong. Klik salah satu menu di kiri.</span>
            </div>
          )}
        </div>

        {/* CUSTOMER PROFILE & ORDER SYSTEM (Dine-in / Takeaway / Delivery) */}
        <div className="border-t border-slate-100 pt-3 space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Metode & Profil Pelanggan</h3>
          
          {/* Order Type Toggle buttons */}
          <div className="grid grid-cols-3 gap-1">
            {(['Dine-In', 'Takeaway', 'Delivery'] as const).map(type => (
              <button
                key={type}
                onClick={() => {
                  setCurrentOrderType(type);
                  if (type !== 'Dine-In') setSelectedTableId('');
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition uppercase ${
                  currentOrderType === type
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Dine-In Table Picker */}
            {currentOrderType === 'Dine-In' && (
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pilih Nomor Meja</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs md:text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none font-semibold text-slate-700"
                >
                  <option value="">-- Pilih Meja --</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id} className={t.status === 'Terisi' ? 'text-amber-600 font-bold' : ''}>
                      {t.code} ({t.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Loyalty Member Picker */}
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Membership Loyalty</label>
              <select
                value={selectedMemberId}
                onChange={(e) => handleSelectMember(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs md:text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium text-slate-700"
              >
                <option value="">-- Non Member / Pelanggan Umum --</option>
                {memberships.map(m => (
                  <option key={m.id} value={m.id}>
                    👤 {m.name} ({m.phone}) - {m.points} Points
                  </option>
                ))}
              </select>
            </div>

            {/* Custom customer details input */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Customer</label>
              <input
                type="text"
                placeholder="cth: Budi Santoso"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-705 font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nomor Telepon</label>
              <input
                type="text"
                placeholder="cth: 0812xxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* PROMO VOUCHERS SYSTEM */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Kupon Voucher Diskon</h3>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Masukkan kode voucher (cth: DISKON10)"
              value={voucherCodeInput}
              onChange={(e) => setVoucherCodeInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs uppercase focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
            <button
              onClick={applyVoucherCode}
              disabled={cart.length === 0}
              className="bg-slate-700 hover:bg-slate-850 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              Pasang
            </button>
          </div>

          {voucherError && <p className="text-rose-500 text-[10px] font-semibold">{voucherError}</p>}
          {appliedVoucherId && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs">
              <span className="font-bold text-amber-800 font-mono flex items-center">
                <Ticket className="w-3.5 h-3.5 mr-1" />
                Voucher {vouchers.find(v => v.id === appliedVoucherId)?.code} Aktif
              </span>
              <button 
                onClick={() => { setAppliedVoucherId(''); setVoucherCodeInput(''); }}
                className="text-amber-800 hover:text-amber-950 underline font-bold"
              >
                Hapus
              </button>
            </div>
          )}
        </div>

        {/* PAYMENT CHANNELS SELECTOR */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Pilih Saluran Pembayaran</h3>
          <div className="grid grid-cols-5 gap-1 text-[11px]">
            {([
              { key: 'Cash', label: 'Cash / Tunai' },
              { key: 'Debit', label: 'Debit' },
              { key: 'Kredit', label: 'Kredit' },
              { key: 'QRIS', label: 'QRIS Gopay' },
              { key: 'E-Wallet', label: 'OVO/E-Wal' }
            ] as const).map(pm => (
              <button
                key={pm.key}
                onClick={() => setPaymentMethod(pm.key)}
                className={`py-1 px-0.5 rounded border font-bold transition flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === pm.key
                    ? 'border-amber-600 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span>{pm.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ACCUMULATED BILL CHARGES */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 font-mono text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-bold">{formatRupiah(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-rose-600 font-semibold">
              <span>Potongan Voucher:</span>
              <span>-{formatRupiah(discount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Pajak Resto (10%):</span>
            <span>{formatRupiah(tax)}</span>
          </div>

          <div className="flex justify-between items-center border-t border-dashed border-slate-300 pt-2 text-slate-800">
            <span className="font-bold text-sm">TOTAL PESANAN:</span>
            <span className="text-base font-extrabold text-amber-600">{formatRupiah(grandTotal)}</span>
          </div>
        </div>

        {/* CHECKOUT SUBMIT BUTTON & SPLIT BILL ACCESS */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowSplitBillModal(true)}
            disabled={cart.length === 0}
            className="border border-slate-250 hover:bg-slate-100 font-bold text-slate-600 text-xs px-3 rounded-lg transition flex items-center justify-center"
            title="Split Bill (Hitung Pisah Tagihan)"
          >
            <Layers className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleCheckoutSubmit}
            disabled={cart.length === 0}
            className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
          >
            <Receipt className="w-4.5 h-4.5" />
            <span>Kirim Pesanan & Cetak Struk</span>
          </button>
        </div>

      </div>

      {/* MODAL 1: THERMAL REALTIME STRUK PREVIEW (58mm/80mm style) */}
      {showInvoiceModal && savedLastOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl relative border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center">
                <Receipt className="w-4 h-4 mr-1.5 text-amber-600" />
                Resi Thermal Printer
              </h3>
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Close
              </button>
            </div>

            {/* Crumpled Thermal Bill Frame */}
            <div id="thermal-receipt" className="bg-yellow-50/50 p-4 rounded-lg border border-slate-300 shadow-inner text-slate-800 font-mono text-[11px] leading-relaxed relative spill-paper">
              {/* Receipt cut styling top */}
              <div className="absolute top-0 inset-x-0 h-1 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,#ccc_4px,#ccc_8px)] no-print" />

              <div className="text-center space-y-1 mb-4 pt-2">
                <span className="font-black text-xs block tracking-widest uppercase">KOPI SENJA COFFEE</span>
                <span className="text-[10px] text-slate-500 block">{activeOutlet.address}</span>
                <span className="text-[10px] text-slate-500 block">Telp: {activeOutlet.phone}</span>
                <span className="text-[9px] block text-slate-400">--------------------------------</span>
              </div>

              <div className="space-y-1.5 mb-3 text-[10px]">
                <div className="flex justify-between">
                  <span>No Trans:</span>
                  <span>{savedLastOrder.code}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{savedLastOrder.createdTime}</span>
                </div>
                {savedLastOrder.tableCode && (
                  <div className="flex justify-between">
                    <span>Meja:</span>
                    <span className="font-extrabold">{savedLastOrder.tableCode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="truncate max-w-[120px]">{savedLastOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Tipe:</span>
                  <span>{savedLastOrder.orderType}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-400 pt-2 mb-3 space-y-2">
                {savedLastOrder.items.map((i, index) => (
                  <div key={index} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold truncate max-w-[170px]">{i.productName}</span>
                      <span>{formatRupiah(i.price * i.qty)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>{i.qty} x {formatRupiah(i.price)}</span>
                    </div>
                    {i.customizations && i.customizations.length > 0 && (
                      <div className="text-[8.5px] text-amber-700 italic">
                        * {i.customizations.join(', ')}
                      </div>
                    )}
                    {i.notes && (
                      <div className="text-[8.5px] text-rose-700 italic">
                        Note: "{i.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-400 pt-2 space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(savedLastOrder.totalOriginal)}</span>
                </div>
                {savedLastOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Voucher Diskon:</span>
                    <span>-{formatRupiah(savedLastOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Pajak (10%):</span>
                  <span>{formatRupiah(savedLastOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-xs font-black border-t border-slate-300 pt-1 text-slate-800">
                  <span>TOTAL NETT:</span>
                  <span>{formatRupiah(savedLastOrder.totalPayable)}</span>
                </div>
              </div>

              {/* Dynamic QR code print simulation */}
              <div className="mt-5 flex flex-col items-center justify-center space-y-1 bg-white p-2 rounded border border-slate-200">
                <img 
                  src={getQRCodeUrl(savedLastOrder.code)} 
                  alt="QR Bill" 
                  referrerPolicy="no-referrer"
                  className="w-24 h-24"
                />
                <span className="text-[8px] text-slate-400 font-bold">Scan untuk validasi struk / feedback</span>
              </div>

              <div className="text-center text-[9px] text-slate-400 mt-5 pt-2 border-t border-dashed border-slate-400">
                🌱 Terima Kasih Atas Kunjungan Anda 🌱
                <span className="block mt-1 font-sans font-bold text-slate-500">Kopi Kenangan Senja Group</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 no-print">
              <button
                onClick={handlePrintReceipt}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-lg shadow-sm transition flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Receipt (Thermal 58/80mm)</span>
              </button>

              <button
                onClick={handleCopyTextReceipt}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 px-4 rounded-lg transition flex items-center justify-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Teks Struk (Bluetooth App)</span>
              </button>

              <button
                onClick={() => window.print()}
                className="w-full border border-slate-300 hover:bg-slate-100 text-slate-650 font-bold text-xs py-1.5 px-4 rounded-lg transition flex items-center justify-center space-x-1.5"
              >
                <span>Cetak Seluruh Layar (Manual Fallback)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE SPLIT BILL (PECAH TAGIHAN) CALCULATOR */}
      {showSplitBillModal && cart.length > 0 && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-22l border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-105 pb-2">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center">
                <Layers className="w-5 h-5 mr-2 text-amber-600" />
                Pecah Tagihan (Split Bill Analyzer)
              </h3>
              <button onClick={() => setShowSplitBillModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">
                Kembali
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Jumlah Orang Pemisah (Split Count)
                </label>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setSplitCount(prev => Math.max(2, prev - 1))}
                    className="bg-slate-100 hover:bg-slate-200 p-2 rounded text-slate-700 font-bold w-10 text-center"
                  >
                    -
                  </button>
                  <span className="text-base font-extrabold font-mono text-slate-800 w-12 text-center">
                    {splitCount}
                  </span>
                  <button 
                    onClick={() => setSplitCount(prev => prev + 1)}
                    className="bg-slate-100 hover:bg-slate-200 p-2 rounded text-slate-700 font-bold w-10 text-center"
                  >
                    +
                  </button>
                  <span className="text-slate-400 text-xs">orang</span>
                </div>
              </div>

              {/* Split options showcase */}
              <div className="space-y-3.5 pt-3 border-t border-slate-100">
                <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-100">
                  <h4 className="font-bold text-emerald-800 text-xs uppercase mb-1">Opsi A: Bayar Rata (Equal Splits)</h4>
                  <p className="text-[11px] text-slate-500 mb-3">Tagihan dibagi sama rata oleh {splitCount} konsumen.</p>
                  
                  <div className="flex justify-between text-xs font-mono font-bold text-slate-700">
                    <span>Masing-masing Bayar (Nett):</span>
                    <span className="text-amber-500 text-sm font-extrabold">
                      {formatRupiah(Math.round(grandTotal / splitCount))}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-700 text-xs uppercase mb-1">Opsi B: Sesuai Item Dipesan (Itemized Splits)</h4>
                  <p className="text-[11px] text-slate-400 mb-3">Rincian item untuk di-check tersendiri per porsi.</p>
                  
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {cart.map(item => (
                      <div key={item.productId} className="flex justify-between text-xs font-mono">
                        <span className="text-slate-600 truncate max-w-[200px]">{item.qty}x {item.productName}</span>
                        <span className="font-bold text-slate-800">{formatRupiah(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Pembayaran dicatat berpisah! Kasir akan menerima sejumlah ${splitCount} kali pemrosesan mesin ATM.`);
                setShowSplitBillModal(false);
              }}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 rounded-lg transition"
            >
              Konfirmasi Pemisahan Bill (Lunas)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
