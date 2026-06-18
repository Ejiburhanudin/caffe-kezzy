import React, { useState } from 'react';
import { Product, Category, DiningTable, Order, Membership, Reservation, Feedback } from '../types';
import { formatRupiah, getQRCodeUrl } from '../utils/helpers';
import { 
  Search, ShoppingBasket, Plus, Minus, CheckCircle, Smartphone, 
  MapPin, Star, Calendar, Clock, Smile, Award, Sparkles, Send, Gift, Coffee,
  Receipt, Printer
} from 'lucide-react';

interface CustomerQRMenuProps {
  products: Product[];
  categories: Category[];
  tables: DiningTable[];
  selectedTable: DiningTable; // Simulated QR Code Table context
  memberships: Membership[];
  onAddOrder: (order: Order) => void;
  onAddMember: (member: Membership) => void;
  onAddReservation: (res: Reservation) => void;
  onAddFeedback: (fb: Feedback) => void;
  onUpdateTableStatus: (tableId: string, status: DiningTable['status']) => void;
}

export default function CustomerQRMenu({
  products,
  categories,
  tables,
  selectedTable,
  memberships,
  onAddOrder,
  onAddMember,
  onAddReservation,
  onAddFeedback,
  onUpdateTableStatus
}: CustomerQRMenuProps) {
  // Mobile UI screens
  const [activeTab, setActiveTab] = useState<'menu' | 'booking' | 'membership' | 'feedback'>('menu');
  
  // Search & Cart states
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [customerCart, setCustomerCart] = useState<{ productId: string, productName: string, qty: number, price: number, customizations: string[], notes: string }[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment_method' | 'processing' | 'success'>('cart');
  const [customerMockPayment, setCustomerMockPayment] = useState<'Kasir' | 'QRIS' | 'E-Wallet'>('Kasir');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerPhoneInput, setCustomerPhoneInput] = useState('');
  const [latestSubmittedOrderCode, setLatestSubmittedOrderCode] = useState('');
  const [customerLastOrder, setCustomerLastOrder] = useState<Order | null>(null);
  const [showCustomerReceiptModal, setShowCustomerReceiptModal] = useState(false);

  // Table reservation fields
  const [reservedDate, setReservedDate] = useState('2026-06-18');
  const [reservedTime, setReservedTime] = useState('14:00');
  const [reserveTableId, setReserveTableId] = useState('');
  const [reserveCustomerName, setReserveCustomerName] = useState('');
  const [reserveCustomerPhone, setReserveCustomerPhone] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState(false);

  // Membership lookup fields
  const [memberRegName, setMemberRegName] = useState('');
  const [memberRegEmail, setMemberRegEmail] = useState('');
  const [memberRegPhone, setMemberRegPhone] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [matchedMember, setMatchedMember] = useState<Membership | null>(null);

  // Customer Feedback Fields
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackCats, setFeedbackCats] = useState<string[]>(['Rasa']);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Filter products for customer
  const filteredProducts = products.filter(p => {
    const sMatch = p.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
                   p.description.toLowerCase().includes(customerSearchQuery.toLowerCase());
    const cMatch = selectedCatId === 'all' || p.categoryId === selectedCatId;
    return sMatch && cMatch && p.isAvailable;
  });

  // Basket alterations
  const handleAddToCart = (p: Product) => {
    setCustomerCart(prev => {
      const existing = prev.find(item => item.productId === p.id);
      if (existing) {
        return prev.map(item => 
          item.productId === p.id 
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, {
        productId: p.id,
        productName: p.name,
        qty: 1,
        price: p.price,
        customizations: [],
        notes: ''
      }];
    });
  };

  const handleUpdateQty = (pId: string, delta: number) => {
    setCustomerCart(prev => {
      return prev.map(item => {
        if (item.productId === pId) {
          const nQty = item.qty + delta;
          return nQty > 0 ? { ...item, qty: nQty } : null;
        }
        return item;
      }).filter(Boolean) as any[];
    });
  };

  const handleToggleOption = (pId: string, opt: string) => {
    setCustomerCart(prev => prev.map(item => {
      if (item.productId === pId) {
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

  const handleUpdateNotes = (pId: string, notes: string) => {
    setCustomerCart(prev => prev.map(item => 
      item.productId === pId ? { ...item, notes } : item
    ));
  };

  const subtotal = customerCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + tax;

  // Direct High-Fidelity Receipt isolated print via dynamic hidden iframe for clients
  const handlePrintCustomerReceipt = () => {
    const receiptElement = document.getElementById('customer-thermal-receipt');
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

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    const styleHtml = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    doc.write(`
      <html>
        <head>
          <title>Cetak Resi Kopi Senja</title>
          ${styleHtml}
          <style>
            body { font-family: monospace; padding: 10px; width: 300px; margin: 0 auto; background: white; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body onload="window.print(); setTimeout(() => { window.parent.document.body.removeChild(window.frameElement); }, 500);">
          <div>
            ${receiptElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();
  };

  // Submit Self-Ordering Order
  const handleCustomerCheckout = () => {
    if (customerCart.length === 0) return;
    if (!customerNameInput.trim()) {
      alert('Tulis nama Anda untuk pemesanan!');
      return;
    }

    setCheckoutStep('processing');

    setTimeout(() => {
      const orderCode = `#COF-${Math.floor(1001 + Math.random() * 8000)}`;
      
      const newOrder: Order = {
        id: `ord-cust-${Date.now()}`,
        code: orderCode,
        outletId: 'out-sudirman', // Default simulated outlet
        outletName: 'Kopi Kenangan - Sudirman Office',
        customerName: customerNameInput,
        customerPhone: customerPhoneInput,
        tableId: selectedTable.id,
        tableCode: selectedTable.code,
        items: [...customerCart],
        totalOriginal: subtotal,
        discount: 0,
        tax,
        totalPayable: grandTotal,
        paymentMethod: customerMockPayment as any,
        paymentStatus: customerMockPayment === 'Kasir' ? 'Belum Bayar' : 'Lunas',
        orderType: 'Dine-In',
        status: 'Menunggu',
        createdTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      onAddOrder(newOrder);
      
      // Update Table Status to Terisi
      onUpdateTableStatus(selectedTable.id, 'Terisi');

      setLatestSubmittedOrderCode(orderCode);
      setCustomerLastOrder(newOrder);
      setCheckoutStep('success');
      setCustomerCart([]);
    }, 1500); // simulate 1.5s server-side processing
  };

  // Submit Reservation
  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveCustomerName || !reserveTableId) {
      alert('Isi detail nama dan pilih meja!');
      return;
    }

    const tCode = tables.find(t => t.id === reserveTableId)?.code || 'Meja';
    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      customerName: reserveCustomerName,
      phone: reserveCustomerPhone,
      tableId: reserveTableId,
      date: reservedDate,
      time: reservedTime,
      status: 'Booked'
    };

    onAddReservation(newRes);
    onUpdateTableStatus(reserveTableId, 'Reservasi');

    setReservationSuccess(true);
    setTimeout(() => {
      setReservationSuccess(false);
      setReserveCustomerName('');
      setReserveCustomerPhone('');
      setReserveTableId('');
    }, 3000);
  };

  // Register Member
  const handleRegisterMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberRegName || !memberRegPhone) {
      alert('Nama dan Nomor HP wajib diisi!');
      return;
    }

    const newMember: Membership = {
      id: `m-${Date.now()}`,
      name: memberRegName,
      email: memberRegEmail,
      phone: memberRegPhone,
      points: 10, // 10 welcome points!
      cashback: 0,
      joinsAt: '2026-06-18'
    };

    onAddMember(newMember);
    setRegSuccessMsg(`Selamat! ${memberRegName} terdaftar sebagai loyalty member. Bonus 10 Points masuk!`);
    
    setMemberRegName('');
    setMemberRegEmail('');
    setMemberRegPhone('');
    
    setTimeout(() => setRegSuccessMsg(''), 5000);
  };

  // Search Member details
  const handleLookupMember = () => {
    const found = memberships.find(m => m.phone === lookupPhone || m.email === lookupPhone);
    if (found) {
      setMatchedMember(found);
    } else {
      alert('Data member tidak ditemukan. Silakan daftarkan baru!');
      setMatchedMember(null);
    }
  };

  // Submit Customer Feedback Form
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNotes.trim()) {
      alert('Tulis kritik atau saran Anda!');
      return;
    }

    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      date: '2026-06-18 09:14',
      orderId: 'o-past-1',
      orderCode: `#C-CUST`,
      customerName: customerNameInput || 'Pelanggan Meja ' + selectedTable.code,
      rating: ratingVal,
      categories: feedbackCats,
      comments: feedbackNotes
    };

    onAddFeedback(newFeedback);
    setFeedbackSuccess(true);
    setFeedbackNotes('');
    
    setTimeout(() => {
      setFeedbackSuccess(false);
    }, 4000);
  };

  const handleToggleFeedbackCat = (cat: string) => {
    setFeedbackCats(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat) 
        : [...prev, cat]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: STATIC SMARTPHONE SIMULATOR CONTAINER (9 COLS ON MOBILE SCREEN) */}
        <div className="lg:col-span-8 bg-white p-3 rounded-3xl border-4 border-slate-700 shadow-2xl relative max-w-xl mx-auto w-full">
          
          {/* Smartphone Speaker notch accent */}
          <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-700 rounded-b-2xl z-20 flex items-center justify-center">
            <span className="block w-12 h-1 bg-slate-600 rounded-full" />
          </div>

          <div className="bg-slate-50 min-h-[640px] rounded-2xl flex flex-col justify-between overflow-hidden relative border border-slate-205 z-10 pt-6">
            
            {/* Phone Internal Header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black tracking-widest text-slate-100 uppercase">Kopi Senja Menu</span>
              </div>
              <div className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                🍽️ {selectedTable.code}
              </div>
            </div>

            {/* APP VIEWPORTS COUPLING */}
            <div className="flex-1 overflow-y-auto p-3 max-h-[500px]">
              
              {/* TAB 1: SELF-ORDER MENU LIST */}
              {activeTab === 'menu' && (
                <div className="space-y-4">
                  
                  {checkoutStep === 'cart' && (
                    <>
                      {/* Promo greeting */}
                      <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-4 rounded-xl text-white shadow-sm flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-wider">Promo Hemat 30%</h4>
                          <p className="text-[10px] text-amber-100">Beli Combo Ngopi Pagi cuma Rp38.000!</p>
                        </div>
                        <Gift className="w-8 h-8 text-amber-100" />
                      </div>

                      {/* Custom Search field inside phone */}
                      <div className="relative">
                        <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Cari cangkir kopimu..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      {/* Categories flexible picker inside phone */}
                      <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
                        <button
                          onClick={() => setSelectedCatId('all')}
                          className={`px-3 py-1 bg-white border text-[10px] font-bold rounded-lg ${
                            selectedCatId === 'all' ? 'text-amber-600 border-amber-400 bg-amber-50' : 'text-slate-500'
                          }`}
                        >
                          Semua
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCatId(cat.id)}
                            className={`px-3 py-1 bg-white border text-[10px] font-bold rounded-lg whitespace-nowrap ${
                              selectedCatId === cat.id ? 'text-amber-600 border-amber-400 bg-amber-50' : 'text-slate-500'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>

                      {/* Customer menu grid */}
                      <div className="space-y-2">
                        {filteredProducts.map((p) => {
                          const itemQty = customerCart.find(it => it.productId === p.id)?.qty || 0;
                          return (
                            <div key={p.id} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex gap-3 items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={p.image} 
                                  alt={p.name} 
                                  referrerPolicy="no-referrer"
                                  className="w-14 h-14 object-cover rounded-lg"
                                />
                                <div>
                                  <h4 className="font-bold text-slate-800 text-xs">{p.name}</h4>
                                  <p className="text-slate-450 text-[9.5px] line-clamp-1 max-w-[160px] ">{p.description}</p>
                                  <span className="font-extrabold text-amber-600 text-xs block mt-0.5">{formatRupiah(p.price)}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1.5">
                                {itemQty > 0 ? (
                                  <div className="flex items-center bg-slate-100 rounded border">
                                    <button onClick={() => handleUpdateQty(p.id, -1)} className="p-1 text-slate-600 font-extrabold text-xs">-</button>
                                    <span className="font-bold text-xs px-1 text-slate-700">{itemQty}</span>
                                    <button onClick={() => handleAddToCart(p)} className="p-1 text-slate-600 font-extrabold text-xs">+</button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleAddToCart(p)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] py-1 px-3.5 rounded-lg transition"
                                  >
                                    Pesan
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Customer Checkout step - Payment selection inside phone */}
                  {checkoutStep === 'payment_method' && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-250 pb-2">
                        <h3 className="font-extrabold text-slate-700 text-xs">Pilih Saluran & Profil Pembayaran Anda</h3>
                        <p className="text-[10px] text-slate-400">Pembayaran aman, tanpa antre lama!</p>
                      </div>

                      <div className="space-y-3">
                        {/* Profile input */}
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Nama Anda (Atas Nama Pesanan)</label>
                          <input 
                            type="text" 
                            placeholder="cth: Rangga"
                            value={customerNameInput}
                            onChange={(e) => setCustomerNameInput(e.target.value)}
                            className="w-full bg-white border border-slate-205 py-1.5 px-3 rounded-lg text-xs font-semibold focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Nomor HP WhatsApp (Pemberitahuan KDS)</label>
                          <input 
                            type="text" 
                            placeholder="cth: 0812xxxx"
                            value={customerPhoneInput}
                            onChange={(e) => setCustomerPhoneInput(e.target.value)}
                            className="w-full bg-white border border-slate-205 py-1.5 px-3 rounded-lg text-xs focus:outline-none"
                          />
                        </div>

                        {/* Payment choice */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Pilih Opsi Bayar</label>
                          <div className="space-y-1.5">
                            <button
                              onClick={() => setCustomerMockPayment('Kasir')}
                              className={`w-full p-2.5 rounded-lg border text-left flex justify-between items-center ${
                                customerMockPayment === 'Kasir' ? 'border-amber-500 bg-amber-50/60' : 'border-slate-200'
                              }`}
                            >
                              <div>
                                <span className="font-bold text-slate-700 text-xs block">Bayar di Kasir (Tunai / Debit)</span>
                                <span className="text-[9px] text-slate-400">Selesaikan pembayaran langsung ke petugas kasir.</span>
                              </div>
                            </button>

                            <button
                              onClick={() => setCustomerMockPayment('QRIS')}
                              className={`w-full p-2.5 rounded-lg border text-left flex justify-between items-center ${
                                customerMockPayment === 'QRIS' ? 'border-amber-500 bg-amber-50/60' : 'border-slate-200'
                              }`}
                            >
                              <div>
                                <span className="font-bold text-slate-700 text-xs block">Simulasi QRIS Dompet Digital</span>
                                <span className="text-[9px] text-slate-400">Pindai kode QRIS instan melalui layar handphone.</span>
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="bg-amber-50 p-2.5 rounded-lg border text-[11px] font-mono leading-tight space-y-1">
                          <div className="flex justify-between">
                            <span>Subtotal Menu:</span>
                            <span>{formatRupiah(subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pajak (10%):</span>
                            <span>{formatRupiah(tax)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-amber-700 text-xs border-t border-dashed border-amber-200 pt-1">
                            <span>Total Billing:</span>
                            <span>{formatRupiah(grandTotal)}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setCheckoutStep('cart')}
                            className="w-1/3 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs text-slate-600 font-bold"
                          >
                            Keranjang
                          </button>
                          <button
                            onClick={handleCustomerCheckout}
                            className="flex-grow bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 rounded-lg transition"
                          >
                            Konfirmasi & Bayar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Processing loader */}
                  {checkoutStep === 'processing' && (
                    <div className="py-24 text-center space-y-3.5">
                      <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <h4 className="font-bold text-slate-700 text-sm">Menghubungkan Ke Webhook Kasir...</h4>
                      <p className="text-slate-400 text-xs">Pesanan Anda dikirim langsung ke Kitchen Display baristas.</p>
                    </div>
                  )}

                  {/* Success Checkout */}
                  {checkoutStep === 'success' && (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-800">☕ Pemesanan Berhasil!</h4>
                        <span className="font-mono text-xs text-amber-600 font-black block mt-1">{latestSubmittedOrderCode}</span>
                        <p className="text-[11px] text-slate-450 mt-1 max-w-xs mx-auto">
                          Sukses! Barista KDS telah menerima pesanan Anda. Notifikasi progress pengerjaan akan terpantau live.
                        </p>
                      </div>

                      <div className="bg-slate-100 hover:bg-slate-150 p-2.5 rounded border border-slate-200 text-xs font-mono max-w-xs mx-auto">
                        <span>Antrean Meja Anda: </span>
                        <span className="font-extrabold font-sans text-amber-600">DINE-IN ({selectedTable.code})</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-xs mx-auto">
                        <button
                          onClick={() => setShowCustomerReceiptModal(true)}
                          className="bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-1.5"
                        >
                          <Receipt className="w-4 h-4 text-amber-400" />
                          <span>Lihat & Cetak Struk</span>
                        </button>

                        <button
                          onClick={() => setCheckoutStep('cart')}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl transition shadow flex items-center justify-center gap-1.5"
                        >
                          <Coffee className="w-4 h-4" />
                          <span>Pesan Menu Lagi</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: TABLE RESERVATION FORM */}
              {activeTab === 'booking' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-extrabold text-slate-700 text-xs">Pesan Meja Resto (Table Reservation)</h3>
                    <p className="text-[10px] text-slate-400">Pilih meja favorit, booking instan dalam 2 menit.</p>
                  </div>

                  {reservationSuccess ? (
                    <div className="p-12 text-center space-y-3.5 bg-green-50 rounded-xl border border-green-200">
                      <Calendar className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                      <h4 className="font-black text-emerald-800 text-sm">Reservasi Meja Sukses Terjadwal!</h4>
                      <p className="text-[10px] text-emerald-600">Data booking telah diautentikasi oleh asisten pelayan kami harian Kopi Senja.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReservationSubmit} className="space-y-3 text-xs text-slate-705">
                      <div>
                        <label className="font-bold text-slate-500 block mb-1">Nama Pemesan</label>
                        <input 
                          type="text" 
                          placeholder="Nama lengkap Anda..."
                          value={reserveCustomerName}
                          onChange={(e) => setReserveCustomerName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-500 block mb-1">Nomor WhatsApp HP</label>
                        <input 
                          type="text" 
                          placeholder="Nomor ponsel aktif..."
                          value={reserveCustomerPhone}
                          onChange={(e) => setReserveCustomerPhone(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-500 block mb-1">Meja Kopi Pilihan</label>
                          <select
                            value={reserveTableId}
                            onChange={(e) => setReserveTableId(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-semibold"
                          >
                            <option value="">-- Pilih --</option>
                            {tables.map(t => (
                              <option key={t.id} value={t.id}>{t.code} ({t.status})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-500 block mb-1">Jam Booking</label>
                          <input 
                            type="time" 
                            value={reservedTime}
                            onChange={(e) => setReservedTime(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 font-semibold"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2 rounded-lg transition text-center mt-3"
                      >
                        Konfirmasi Booking Meja (Offline)
                      </button>
                    </form>
                  )}

                </div>
              )}

              {/* TAB 3: MEMBER LOYALTY CARD CHECKER / REGISTRY */}
              {activeTab === 'membership' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-extrabold text-slate-700 text-xs">Membership Card & Points Checker</h3>
                    <p className="text-[10px] text-slate-400">Registrasi member instan gratis dan tukarkan loyalty points seru.</p>
                  </div>

                  {/* Register Block */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2.5">
                    <h4 className="font-black text-amber-800 text-[11px] flex items-center">
                      <Award className="w-4 h-4 mr-1 text-amber-500" />
                      A: Daftarkan Membership Baru
                    </h4>
                    
                    {regSuccessMsg && <p className="text-emerald-600 font-bold text-[10px] bg-emerald-50 p-2.5 rounded border border-emerald-100">{regSuccessMsg}</p>}

                    <form onSubmit={handleRegisterMember} className="space-y-2 text-[11px]">
                      <div className="grid grid-cols-2 gap-1.5">
                        <input 
                          type="text" 
                          placeholder="Nama lengkap" 
                          value={memberRegName}
                          onChange={(e) => setMemberRegName(e.target.value)}
                          className="bg-white border rounded py-1 px-2 focus:outline-none"
                        />
                        <input 
                          type="text" 
                          placeholder="Nomor ponsel" 
                          value={memberRegPhone}
                          onChange={(e) => setMemberRegPhone(e.target.value)}
                          className="bg-white border rounded py-1 px-2 focus:outline-none"
                        />
                      </div>
                      <input 
                        type="email" 
                        placeholder="Alamat email member..." 
                        value={memberRegEmail}
                        onChange={(e) => setMemberRegEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded py-1 px-2 focus:outline-none block"
                      />
                      <button type="submit" className="w-full bg-slate-700 hover:bg-slate-800 text-white font-black py-1 rounded transition text-center uppercase text-[9.5px]">
                        Gabung Loyalty Club
                      </button>
                    </form>
                  </div>

                  {/* Points Lookup block */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5 shadow-sm">
                    <h4 className="font-black text-slate-700 text-[11px] flex items-center">
                      <Gift className="w-4 h-4 mr-1 text-amber-500" />
                      B: Cek Saldo & Cashback Poin Saya
                    </h4>
                    
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        placeholder="Masukkan no ponsel (cth: 08123456789)" 
                        value={lookupPhone}
                        onChange={(e) => setLookupPhone(e.target.value)}
                        className="flex-1 bg-slate-50 border rounded text-[10px] py-1 px-2 focus:outline-none"
                      />
                      <button 
                        onClick={handleLookupMember}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-3.5 rounded transition"
                      >
                        Cek
                      </button>
                    </div>

                    {matchedMember && (
                      <div className="bg-amber-50/50 p-3 rounded border border-amber-205 text-[11px] space-y-2 font-mono">
                        <div className="flex justify-between font-bold border-b border-amber-100 pb-1 text-amber-900">
                          <span>📋 KARTU MEMBER:</span>
                          <span>LEVEL GOLD</span>
                        </div>
                        <div>Pemilik: <span className="font-bold">{matchedMember.name}</span></div>
                        <div className="flex justify-between font-bold">
                          <span>LOYALTY POINTS STREAK:</span>
                          <span className="text-amber-600 text-sm">{matchedMember.points} Pts</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>CASHBACK ACCRUED:</span>
                          <span className="text-emerald-600">{formatRupiah(matchedMember.cashback)}</span>
                        </div>

                        <div className="bg-white p-2 rounded border border-amber-100 text-[9px] text-slate-500 leading-normal">
                          🔥 Syarat hadiah poin: Tukarkan <span className="font-semibold">100 Points</span> Anda dengan Latte Signature gratis dari kasir Kopi Senja!
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 4: CUSTOMER FEEDBACK SURVEY */}
              {activeTab === 'feedback' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-extrabold text-slate-700 text-xs">Saran, Rating & Umpan Balik Layanan</h3>
                    <p className="text-[10px] text-slate-400">Berikan kami kritik positif untuk meningkatkan pelayanan cangkir kopi.</p>
                  </div>

                  {feedbackSuccess ? (
                    <div className="p-12 text-center text-slate-500 bg-slate-100/50 rounded-xl space-y-2 border">
                      <Smile className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
                      <h4 className="font-black text-slate-700 text-xs">Umpan Balik Diterima, Terima Kasih!</h4>
                      <p className="text-[9.5px] text-slate-450 leading-relaxed">Penilaian rasa dan pelayanan Anda telah terdistribusi langsung ke dashboard Owner.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-[11px] text-slate-700">
                      {/* Interactive Stars click */}
                      <div>
                        <label className="font-bold text-slate-400 block mb-1">Beri Rating Penilaian</label>
                        <div className="flex text-amber-400 space-x-1.5 justify-center py-2 bg-slate-50 rounded-lg border">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setRatingVal(num)}
                              className="focus:outline-none transform hover:scale-110 transition"
                            >
                              <Star className={`w-7 h-7 ${num <= ratingVal ? 'fill-amber-400 text-amber-400' : 'text-slate-350'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Select categories of feedback */}
                      <div>
                        <label className="font-bold text-slate-400 block mb-1.5">Penilaian Kategori</label>
                        <div className="flex gap-1.5 justify-center">
                          {['Rasa', 'Pelayanan', 'Kebersihan'].map((cat) => {
                            const isSel = feedbackCats.includes(cat);
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => handleToggleFeedbackCat(cat)}
                                className={`font-bold px-3 py-1 rounded-full text-xs transition ${
                                  isSel ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-400 block mb-1">Tulis Masukan Spesifik Anda</label>
                        <textarea
                          rows={3}
                          placeholder="Rasa cappuccino, kebersihan meja, atau kecepatan penyajian kopi..."
                          value={feedbackNotes}
                          onChange={(e) => setFeedbackNotes(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2 rounded-lg transition flex items-center justify-center space-x-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Feedback Penilaian</span>
                      </button>
                    </form>
                  )}

                </div>
              )}

            </div>

            {/* Smart Cart Summary Bar inside phone (Overlay) */}
            {activeTab === 'menu' && customerCart.length > 0 && checkoutStep === 'cart' && (
              <div className="bg-white p-3 border-t border-slate-200 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Cart ({customerCart.reduce((a, b) => a + b.qty, 0)})</span>
                  <span className="font-black text-amber-600 text-xs">{formatRupiah(grandTotal)}</span>
                </div>
                <button
                  onClick={() => setCheckoutStep('payment_method')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-black text-[11px] py-1.5 px-4 rounded-lg flex items-center space-x-1 shadow"
                >
                  <ShoppingBasket className="w-3.5 h-3.5" />
                  <span>Bayar Sekarang</span>
                </button>
              </div>
            )}

            {/* Phone Internal Navigation menu */}
            <div className="bg-slate-900 border-t border-slate-800 grid grid-cols-4 p-1.5 gap-1 text-[9px] font-bold text-center text-slate-400">
              <button 
                onClick={() => { setActiveTab('menu'); setCheckoutStep('cart'); }} 
                className={`py-1.5 flex flex-col items-center justify-center gap-1 ${activeTab === 'menu' ? 'text-amber-500' : 'hover:text-slate-200'}`}
              >
                <Coffee className="w-4.5 h-4.5" />
                <span>Pesan Menu</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('booking')}
                className={`py-1.5 flex flex-col items-center justify-center gap-1 ${activeTab === 'booking' ? 'text-amber-500' : 'hover:text-slate-200'}`}
              >
                <Calendar className="w-4.5 h-4.5" />
                <span>Reservasi</span>
              </button>

              <button 
                onClick={() => setActiveTab('membership')}
                className={`py-1.5 flex flex-col items-center justify-center gap-1 ${activeTab === 'membership' ? 'text-amber-500' : 'hover:text-slate-200'}`}
              >
                <Award className="w-4.5 h-4.5" />
                <span>Member</span>
              </button>

              <button 
                onClick={() => setActiveTab('feedback')}
                className={`py-1.5 flex flex-col items-center justify-center gap-1 ${activeTab === 'feedback' ? 'text-amber-500' : 'hover:text-slate-200'}`}
              >
                <Smile className="w-4.5 h-4.5" />
                <span>Feedback</span>
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: DIRECT QR TABLE GENERATOR ACCENTS & INFORMATION (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-slate-800 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Simulasi Dine-In Meja
              </span>
              <h3 className="font-extrabold text-slate-800 text-sm md:text-base mt-2">QR Code Self-Ordering Table</h3>
              <p className="text-slate-400 text-xs mt-0.5">Setiap meja dilengkapi dengan kode QR kopi sensorik.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              {/* Actual QR render */}
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                <img 
                  src={getQRCodeUrl(`https://coffee-app.com/order/${selectedTable.id}`)} 
                  alt="Simulated Meja QR" 
                  className="w-40 h-40"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="mt-4 space-y-1">
                <span className="font-mono text-xs font-bold text-slate-800 block uppercase">QR SCAN TARGET:</span>
                <span className="text-amber-600 font-mono text-[10px] break-all block px-2 py-1 bg-white rounded border select-all">
                  https://coffee-app.com/order/{selectedTable.id}
                </span>
                <span className="text-[10px] text-slate-400 block pt-1">(Simulated scan context: <span className="font-bold text-slate-650">{selectedTable.code}</span>)</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-slate-500 leading-relaxed font-sans">
              💡 <span className="font-semibold text-slate-700">Manfaat Pelanggan:</span> Tanpa perlu mengunduh aplikasi lokal Android / iOS, pelanggan cukup scan QR di atas meja untuk memesan Americano favorit mereka, memeriksa cangkir kopi dalam keranjang belanja, dan membayar online secara praktis.
            </div>
          </div>

          {/* Quick Table layout list status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-slate-850">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 block">Bagan Tata Letak Meja Kopi</h4>
            <div className="grid grid-cols-5 gap-2 text-center text-[10.5px]">
              {tables.map(tb => (
                <div 
                  key={tb.id} 
                  className={`p-1.5 rounded-lg border flex flex-col items-center justify-between transition-all ${
                    tb.id === selectedTable.id ? 'ring-2 ring-amber-500 scale-105 shadow font-extrabold' : ''
                  } ${
                    tb.status === 'Terisi' ? 'bg-amber-100 border-amber-200 text-amber-800' :
                    tb.status === 'Reservasi' ? 'bg-rose-100 border-rose-200 text-rose-800' :
                    'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span className="block">{tb.code.split(' ')[1]}</span>
                  <span className="text-[8px] opacity-75">{tb.status === 'Kosong' ? 'OK' : tb.status === 'Terisi' ? 'USED' : 'BK'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* THERMAL STRUK POPUP MODAL FOR CUSTOMER */}
      {showCustomerReceiptModal && customerLastOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl relative border border-slate-100 flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-500" />
                📄 Struk Belanja Digital Anda
              </h3>
              <button 
                onClick={() => setShowCustomerReceiptModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Close
              </button>
            </div>

            {/* Crumpled Thermal Bill Frame */}
            <div id="customer-thermal-receipt" className="bg-yellow-50/50 p-4 rounded-lg border border-slate-300 shadow-inner text-slate-800 font-mono text-[11px] leading-relaxed relative">
              <div className="text-center space-y-1 mb-4 pt-2">
                <span className="font-black text-xs block tracking-widest uppercase">KOPI SENJA COFFEE</span>
                <span className="text-[10px] text-slate-500 block">Cabang Sudirman Office Jakarta</span>
                <span className="text-[10px] text-slate-500 block">Telp: 0812-7000-9900</span>
                <span className="text-[9px] block text-slate-400">--------------------------------</span>
              </div>

              <div className="space-y-1.5 mb-3 text-[10px]">
                <div className="flex justify-between">
                  <span>No Trans:</span>
                  <span>{customerLastOrder.code}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{customerLastOrder.createdTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Meja:</span>
                  <span className="font-extrabold">{customerLastOrder.tableCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="truncate max-w-[120px]">{customerLastOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode:</span>
                  <span className="font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded text-[9px]">{customerLastOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-400 pt-2 mb-3 space-y-2">
                {customerLastOrder.items.map((i, index) => (
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
                  <span>{formatRupiah(customerLastOrder.totalOriginal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak (10%):</span>
                  <span>{formatRupiah(customerLastOrder.tax)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-slate-300 pt-1.5 text-slate-900 font-bold text-xs">
                  <span>GRAND TOTAL:</span>
                  <span className="text-amber-700">{formatRupiah(customerLastOrder.totalPayable)}</span>
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-400 mt-5 leading-tight">
                <span>TERIMA KASIH ATAS KUNJUNGAN ANDA!</span>
                <span className="block mt-1 uppercase text-[8px] tracking-widest text-amber-600">Terbuka untuk masukan via feedback</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handlePrintCustomerReceipt}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk (PDF / Printer)</span>
              </button>
              <button
                onClick={() => setShowCustomerReceiptModal(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-lg transition"
              >
                Tutup Resi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
