import React, { useState, useEffect } from 'react';
import { UserRole, Category, Product, Ingredient, Supplier, DiningTable, Membership, Voucher, Order, Feedback, AppNotification, Outlet, PurchaseHistory, Reservation } from './types';
import { 
  INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_INGREDIENTS, INITIAL_SUPPLIERS, 
  INITIAL_TABLES, INITIAL_OUTLETS, INITIAL_VOUCHERS, INITIAL_MEMBERSHIPS, 
  INITIAL_FEEDBACKS, INITIAL_NOTIFICATIONS, INITIAL_ORDERS 
} from './data/initialData';

import HeaderSwitcher from './components/HeaderSwitcher';
import Dashboard from './components/Dashboard';
import POSKasir from './components/POSKasir';
import KitchenKDS from './components/KitchenKDS';
import CustomerQRMenu from './components/CustomerQRMenu';
import InventoryManager from './components/InventoryManager';
import OrderTracker from './components/OrderTracker';
import LoginScreen from './components/LoginScreen';

import { 
  Settings, ShoppingBag, Plus, Sparkles, Check, Trash2, 
  RefreshCw, SlidersHorizontal, BookOpen, ToggleLeft, ToggleRight, LogOut
} from 'lucide-react';
import { formatRupiah } from './utils/helpers';

export default function App() {
  // 1. Core Session States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('senja_logged_in') === 'true';
  });
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('senja_active_role') as UserRole) || 'customer';
  });
  const [selectedOutletId, setSelectedOutletId] = useState<string>('out-sudirman');
  const [selectedTableId, setSelectedTableId] = useState<string>('t1');

  // Handle Login and Logout Sessions
  const handleLogin = (userRole: UserRole) => {
    setRole(userRole);
    setIsLoggedIn(true);
    localStorage.setItem('senja_logged_in', 'true');
    localStorage.setItem('senja_active_role', userRole);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('senja_logged_in');
    localStorage.removeItem('senja_active_role');
  };

  // Datasets loaded from localStorage to ensure rich durable cloud-like persistence simulation
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [tables, setTables] = useState<DiningTable[]>(INITIAL_TABLES);
  const [outlets, setOutlets] = useState<Outlet[]>(INITIAL_OUTLETS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [memberships, setMemberships] = useState<Membership[]>(INITIAL_MEMBERSHIPS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [reservations, setReservations] = useState<any[]>([]);

  // Admin sub-tab toggler
  const [adminTab, setAdminTab] = useState<'analytics' | 'products' | 'inventory' | 'kasir'>('analytics');

  // Master product creation form fields
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('cat-coffee');
  const [newProdPrice, setNewProdPrice] = useState(25000);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdEst, setNewProdEst] = useState(5);
  const [newProdImg, setNewProdImg] = useState('https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop');

  // 2. Load and Sync LocalStorage key
  useEffect(() => {
    const cachedOrders = localStorage.getItem('senja_orders');
    const cachedIngredients = localStorage.getItem('senja_ingredients');
    const cachedProducts = localStorage.getItem('senja_products');
    const cachedMemberships = localStorage.getItem('senja_memberships');
    const cachedFeedbacks = localStorage.getItem('senja_feedbacks');
    const cachedSuppliers = localStorage.getItem('senja_suppliers');
    const cachedTables = localStorage.getItem('senja_tables');
    const cachedNotifications = localStorage.getItem('senja_notifications');

    if (cachedOrders) setOrders(JSON.parse(cachedOrders));
    if (cachedIngredients) setIngredients(JSON.parse(cachedIngredients));
    if (cachedProducts) setProducts(JSON.parse(cachedProducts));
    if (cachedMemberships) setMemberships(JSON.parse(cachedMemberships));
    if (cachedFeedbacks) setFeedbacks(JSON.parse(cachedFeedbacks));
    if (cachedSuppliers) setSuppliers(JSON.parse(cachedSuppliers));
    if (cachedTables) setTables(JSON.parse(cachedTables));
    if (cachedNotifications) setNotifications(JSON.parse(cachedNotifications));
  }, []);

  const saveAllToCache = (updatedOrders: Order[], updatedIng: Ingredient[], updatedProd: Product[], updatedMem: Membership[], updatedFb: Feedback[], updatedSup: Supplier[], updatedTbl: DiningTable[], updatedNotif: AppNotification[]) => {
    localStorage.setItem('senja_orders', JSON.stringify(updatedOrders));
    localStorage.setItem('senja_ingredients', JSON.stringify(updatedIng));
    localStorage.setItem('senja_products', JSON.stringify(updatedProd));
    localStorage.setItem('senja_memberships', JSON.stringify(updatedMem));
    localStorage.setItem('senja_feedbacks', JSON.stringify(updatedFb));
    localStorage.setItem('senja_suppliers', JSON.stringify(updatedSup));
    localStorage.setItem('senja_tables', JSON.stringify(updatedTbl));
    localStorage.setItem('senja_notifications', JSON.stringify(updatedNotif));
  };

  // Reset simulation to vanilla initialData
  const handleResetData = () => {
    if (confirm('Atur ulang seluruh database simulasi ke pengaturan awal pabrik?')) {
      localStorage.clear();
      setOrders(INITIAL_ORDERS);
      setIngredients(INITIAL_INGREDIENTS);
      setProducts(INITIAL_PRODUCTS);
      setMemberships(INITIAL_MEMBERSHIPS);
      setFeedbacks(INITIAL_FEEDBACKS);
      setSuppliers(INITIAL_SUPPLIERS);
      setTables(INITIAL_TABLES);
      setNotifications(INITIAL_NOTIFICATIONS);
      setReservations([]);
      alert('Simulasi POS dikembalikan ke data awal!');
    }
  };

  // Active contextual elements
  const activeOutlet = outlets.find(o => o.id === selectedOutletId) || outlets[0];
  const activeTable = tables.find(t => t.id === selectedTableId) || tables[0];

  // 3. REACTIVE EVENT HANDLERS

  // Add order + dispatch live notification alarms
  const handleAddNewOrder = (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    // Dynamic points award for logged-in Member (Rp10.000 = 1 Poin)
    let updatedMem = [...memberships];
    if (newOrder.customerPhone || newOrder.customerName) {
      const match = memberships.find(m => m.phone === newOrder.customerPhone || m.name === newOrder.customerName);
      if (match) {
        const pointsEarned = Math.floor(newOrder.totalPayable / 10000);
        const cashbackEarned = Math.round(newOrder.totalPayable * 0.05); // 5% cashback
        updatedMem = memberships.map(m => 
          m.id === match.id 
            ? { ...m, points: m.points + pointsEarned, cashback: m.cashback + cashbackEarned }
            : m
        );
        setMemberships(updatedMem);
      }
    }

    // Trigger ingredient depletion mock calculation
    let updatedIng = [...ingredients];
    newOrder.items.forEach(item => {
      // Espresso/Late uses Coffee Beans & Milk
      if (item.productName.includes('Latte') || item.productName.includes('Cappuccino')) {
        updatedIng = updatedIng.map(i => {
          if (i.id === 'ing-coffee-bean') return { ...i, stock: Math.max(0, i.stock - (20 * item.qty)) };
          if (i.id === 'ing-milk') return { ...i, stock: Math.max(0, i.stock - (150 * item.qty)) };
          return i;
        });
      } else if (item.productName.includes('Americano')) {
        updatedIng = updatedIng.map(i => {
          if (i.id === 'ing-coffee-bean') return { ...i, stock: Math.max(0, i.stock - (20 * item.qty)) };
          return i;
        });
      } else if (item.productName.includes('Matcha')) {
        updatedIng = updatedIng.map(i => {
          if (i.id === 'ing-matcha') return { ...i, stock: Math.max(0, i.stock - (15 * item.qty)) };
          if (i.id === 'ing-milk') return { ...i, stock: Math.max(0, i.stock - (150 * item.qty)) };
          return i;
        });
      } else if (item.productName.includes('Chocolate')) {
        updatedIng = updatedIng.map(i => {
          if (i.id === 'ing-chocolate') return { ...i, stock: Math.max(0, i.stock - (20 * item.qty)) };
          if (i.id === 'ing-milk') return { ...i, stock: Math.max(0, i.stock - (150 * item.qty)) };
          return i;
        });
      }
    });
    setIngredients(updatedIng);

    // DISPATCH EXTRANET NOTIFICATIONS LOGS
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const targetWAPhone = newOrder.customerPhone || '08129990123';

    const newWANotif: AppNotification = {
      id: `not-wa-${Date.now()}`,
      time: nowTime,
      title: 'Antrean POS Masuk',
      message: `Pesanan ${newOrder.code} (${newOrder.orderType}) berhasil dibuat! Total: ${formatRupiah(newOrder.totalPayable)}. Barista sedang menyiapkan pesanan Anda.`,
      channel: 'WhatsApp',
      recipient: targetWAPhone,
      status: 'Success'
    };

    const newTGNotif: AppNotification = {
      id: `not-tg-${Date.now()}`,
      time: nowTime,
      title: 'Transaksi Owner Alert',
      message: `[PESANAN BARU] ${newOrder.code} masuk di ${newOrder.outletName.split(' - ')[1]}. Pembayaran: ${newOrder.paymentMethod} (${newOrder.paymentStatus}).`,
      channel: 'Telegram',
      recipient: '@owner_kopi_senja_bot',
      status: 'Success'
    };

    const updatedNotif = [newWANotif, newTGNotif, ...notifications];
    setNotifications(updatedNotif);

    saveAllToCache(updatedOrders, updatedIng, products, updatedMem, feedbacks, suppliers, tables, updatedNotif);
  };

  // Update order status under KDS or Waiter Serve
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;

    const updatedOrders = orders.map(o => 
      o.id === orderId 
        ? { ...o, status, completedTime: status === 'Selesai' ? '2026-06-18 09:14' : undefined }
        : o
    );
    setOrders(updatedOrders);

    // Dispatch WhatsApp status confirmation alert
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    let waMessage = '';
    if (status === 'Sedang Dibuat') {
      waMessage = `Halo ${target.customerName}! Pesanan cangkir kopi ${target.code} milikmu sekarang [SEDANG DIBUAT] hangat oleh Barista KDS kami.`;
    } else if (status === 'Siap Diantar') {
      waMessage = `Pesanan ${target.code} [SIAP DIJEMPUT / DIANTAR]! Silakan kunjungi meja saji, cangkir kopi Anda frothed cantik.`;
    } else {
      waMessage = `Terima kasih banyak ${target.customerName}! Transaksi cangkir kopi ${target.code} Anda dinyatakan [SELESAI/LUNAS] sepenuhnya. Datang kembali ya.`;
    }

    const newWANotif: AppNotification = {
      id: `not-wa-up-${Date.now()}`,
      time: nowTime,
      title: 'Update Status Saji',
      message: waMessage,
      channel: 'WhatsApp',
      recipient: target.customerPhone || '08129990123',
      status: 'Success'
    };

    const updatedNotif = [newWANotif, ...notifications];
    setNotifications(updatedNotif);

    saveAllToCache(updatedOrders, ingredients, products, memberships, feedbacks, suppliers, tables, updatedNotif);
  };

  // Assign Barista to recipe task KDS
  const handleAssignBarista = (orderId: string, baristaName: string) => {
    const updated = orders.map(o => 
      o.id === orderId ? { ...o, baristaAssigned: baristaName } : o
    );
    setOrders(updated);
    saveAllToCache(updated, ingredients, products, memberships, feedbacks, suppliers, tables, notifications);
  };

  // Update Delivery Driver Status
  const handleUpdateDeliveryStatus = (orderId: string, deliveryStatus: Order['deliveryStatus']) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;

    const updated = orders.map(o => 
      o.id === orderId ? { ...o, deliveryStatus } : o
    );
    setOrders(updated);

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newWANotif: AppNotification = {
      id: `not-wa-del-${Date.now()}`,
      time: nowTime,
      title: 'Driver Courier Alert',
      message: `Driver Gosend/GrabFood mengonfirmasi status pesanan cangkir kopi ${target.code} Anda sekarang: [${deliveryStatus?.toUpperCase()}].`,
      channel: 'WhatsApp',
      recipient: target.customerPhone || '08129990123',
      status: 'Success'
    };

    const updatedNotif = [newWANotif, ...notifications];
    setNotifications(updatedNotif);

    saveAllToCache(updated, ingredients, products, memberships, feedbacks, suppliers, tables, updatedNotif);
  };

  // Vacate table or reserve table harian
  const handleUpdateTableStatus = (tableId: string, status: DiningTable['status']) => {
    const updated = tables.map(t => 
      t.id === tableId ? { ...t, status } : t
    );
    setTables(updated);
    saveAllToCache(orders, ingredients, products, memberships, feedbacks, suppliers, updated, notifications);
  };

  // Add Stock (Restock Gudang)
  const handleAddStock = (ingId: string, amount: number) => {
    const updated = ingredients.map(ing => {
      if (ing.id === ingId) {
        const histories = [
          {
            id: `h-add-${Date.now()}`,
            date: '2026-06-18',
            type: 'in' as const,
            qty: amount,
            unit: ing.unit,
            notes: 'Restock bahan baku gudang harian'
          },
          ...ing.histories
        ];
        return {
          ...ing,
          stock: ing.stock + amount,
          alertTriggered: (ing.stock + amount) <= ing.minimumStock,
          histories
        };
      }
      return ing;
    });

    setIngredients(updated);
    saveAllToCache(orders, updated, products, memberships, feedbacks, suppliers, tables, notifications);
  };

  // Deduct Stock
  const handleDeductStock = (ingId: string, amount: number) => {
    const updated = ingredients.map(ing => {
      if (ing.id === ingId) {
        const histories = [
          {
            id: `h-ded-${Date.now()}`,
            date: '2026-06-18',
            type: 'out' as const,
            qty: amount,
            unit: ing.unit,
            notes: 'Penyesuaian manual stock keluar/limbah'
          },
          ...ing.histories
        ];
        return {
          ...ing,
          stock: Math.max(0, ing.stock - amount),
          alertTriggered: Math.max(0, ing.stock - amount) <= ing.minimumStock,
          histories
        };
      }
      return ing;
    });

    setIngredients(updated);
    saveAllToCache(orders, updated, products, memberships, feedbacks, suppliers, tables, notifications);
  };

  // Register Supplier
  const handleRegisterSupplier = (supplier: Supplier) => {
    const updated = [...suppliers, supplier];
    setSuppliers(updated);
    saveAllToCache(orders, ingredients, products, memberships, feedbacks, updated, tables, notifications);
  };

  // Add Purchase PO Item
  const handleAddPurchase = (supplierId: string, purchase: PurchaseHistory) => {
    const updated = suppliers.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          purchases: [purchase, ...s.purchases]
        };
      }
      return s;
    });
    setSuppliers(updated);
    saveAllToCache(orders, ingredients, products, memberships, feedbacks, updated, tables, notifications);
  };

  // Create products (Admin)
  const handleCreateNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      alert('Isi nama produk menu!');
      return;
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      categoryId: newProdCategory,
      price: newProdPrice,
      image: newProdImg,
      description: newProdDesc || 'Minuman barista segar diracik khusus untuk menyegarkan hari kerja Anda.',
      isAvailable: true,
      estimationMinutes: newProdEst
    };

    const updated = [...products, newProd];
    setProducts(updated);
    setShowAddProductModal(false);

    setNewProdName('');
    setNewProdDesc('');
    setNewProdEst(5);
    setNewProdPrice(25000);
    alert(`Menu kopi baru "${newProdName}" sukses dimasukkan ke dalam bursa produk!`);

    saveAllToCache(orders, ingredients, updated, memberships, feedbacks, suppliers, tables, notifications);
  };

  // Toggle product availability Admin
  const handleToggleProductAvail = (pId: string) => {
    const updated = products.map(p => 
      p.id === pId ? { ...p, isAvailable: !p.isAvailable } : p
    );
    setProducts(updated);
    saveAllToCache(orders, ingredients, updated, memberships, feedbacks, suppliers, tables, notifications);
  };

  // If not authenticated, force the custom LoginScreen selector
  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLogin}
        tables={tables}
        selectedTableId={selectedTableId}
        onTableChange={setSelectedTableId}
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20 font-sans">
      
      {/* 1. Header & Switcher */}
      <HeaderSwitcher 
        currentRole={role}
        onRoleChange={setRole}
        outlets={outlets}
        selectedOutletId={selectedOutletId}
        onOutletChange={setSelectedOutletId}
        tables={tables}
        selectedTableId={selectedTableId}
        onTableChange={setSelectedTableId}
        onLogout={handleLogout}
      />

      {/* 2. Admin Hub Subtabs Header (Renders only if in Admin mode) */}
      {role === 'admin' && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setAdminTab('analytics')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
                  adminTab === 'analytics'
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📊 Dashboard Analytics
              </button>
              
              <button
                onClick={() => setAdminTab('products')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center space-x-1.5 ${
                  adminTab === 'products'
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>☕ Master Produk</span>
                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => setAdminTab('inventory')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
                  adminTab === 'inventory'
                    ? 'bg-slate-900 text-white shadow shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📦 Bahan Baku & Gudang
              </button>

              <button
                onClick={() => setAdminTab('kasir')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center space-x-1.5 ${
                  adminTab === 'kasir'
                    ? 'bg-slate-900 text-white shadow shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>💵 Kasir & Cetak Struk (POS)</span>
              </button>
            </div>

            <button
              onClick={handleResetData}
              className="flex items-center space-x-1 border border-rose-250 text-rose-600 hover:bg-rose-50 text-xs font-bold py-1.5 px-3 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Simulasi (Data Awal)</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. CONDITIONAL MODULE VIEWPORT DISPATCHER */}

      {/* VIEW A: ADMIN (Contains subtabs) */}
      {role === 'admin' && (
        <>
          {adminTab === 'analytics' && (
            <Dashboard 
              orders={orders}
              products={products}
              ingredients={ingredients}
              suppliers={suppliers}
              feedbacks={feedbacks}
              notifications={notifications}
              outlets={outlets}
              onAddStock={handleAddStock}
              onRefreshData={() => alert('Seluruh matrix database POS ter-update secara real-time!')}
            />
          )}

          {adminTab === 'products' && (
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-800">Master Data Menu (Coffee & Snacks)</h1>
                  <p className="text-slate-500 text-xs">Tambah varietas biji kopi baru, atur harga, deskripsi saji, dan ketersediaan menu.</p>
                </div>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-2 px-4 rounded-xl shadow transition"
                >
                  + Tambah Kopi / Menu Baru
                </button>
              </div>

              {/* Master Products Listing Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Gambar</th>
                      <th className="px-6 py-3.5">Nama Menu</th>
                      <th className="px-6 py-3.5">Kategori</th>
                      <th className="px-6 py-3.5">Harga Jual</th>
                      <th className="px-6 py-3.5 text-center">Kecepatan Saji</th>
                      <th className="px-6 py-3.5 text-center">Status Tersedia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5">
                          <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded-lg" />
                        </td>
                        <td className="px-6 py-3.5 font-bold text-slate-800">
                          <div>
                            <span>{p.name}</span>
                            <span className="text-[10px] text-slate-400 block font-normal mt-0.5 line-clamp-1">{p.description}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-slate-500">
                          {categories.find(c => c.id === p.categoryId)?.name || 'Lainnya'}
                        </td>
                        <td className="px-6 py-3.5 font-black text-slate-700">{formatRupiah(p.price)}</td>
                        <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-500">{p.estimationMinutes} mnt</td>
                        <td className="px-6 py-3.5 text-center">
                          <button
                            onClick={() => handleToggleProductAvail(p.id)}
                            className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition ${
                              p.isAvailable 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            }`}
                          >
                            {p.isAvailable ? 'Sedia' : 'Kosong'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MODAL: Tambah produk */}
              {showAddProductModal && (
                <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
                  <form onSubmit={handleCreateNewProductSubmit} className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 text-xs text-slate-700">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h3 className="font-extrabold text-slate-800 text-sm flex items-center">
                        <SlidersHorizontal className="w-5 h-5 mr-1 text-amber-500" />
                        Tambah Menu Cangkir Baru
                      </h3>
                      <button 
                        type="button"
                        onClick={() => setShowAddProductModal(false)}
                        className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                      >
                        Close
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="font-bold text-slate-500 block mb-1">Nama Kopi / Snack</label>
                        <input 
                          type="text" 
                          placeholder="contoh: Iced Caramel Macchiato" 
                          required
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-500 block mb-1">Kategori Menu</label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => setNewProdCategory(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 font-semibold"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-500 block mb-1">Harga Jual (IDR)</label>
                          <input 
                            type="number" 
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(Math.max(1000, Number(e.target.value)))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-500 block mb-1">Deskripsi Resep</label>
                        <input 
                          type="text" 
                          placeholder="Komposisi espresso shot, sirup caramel, susu frothed..." 
                          value={newProdDesc}
                          onChange={(e) => setNewProdDesc(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-500 block mb-1">Estimasi Dapur (m)</label>
                          <input 
                            type="number" 
                            value={newProdEst}
                            onChange={(e) => setNewProdEst(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none font-bold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-500 block mb-1">URL Foto (Unsplash)</label>
                          <input 
                            type="text" 
                            value={newProdImg}
                            onChange={(e) => setNewProdImg(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:light-none font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2 rounded-lg transition"
                    >
                      Daftarkan Menu Saji
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}

          {adminTab === 'inventory' && (
            <InventoryManager 
              ingredients={ingredients}
              suppliers={suppliers}
              onAddStock={handleAddStock}
              onDeductStock={handleDeductStock}
              onRegisterSupplier={handleRegisterSupplier}
              onAddPurchase={handleAddPurchase}
            />
          )}

          {adminTab === 'kasir' && (
            <POSKasir 
              products={products}
              categories={categories}
              tables={tables}
              memberships={memberships}
              vouchers={vouchers}
              activeOutlet={activeOutlet}
              onAddOrder={handleAddNewOrder}
              onUpdateTableStatus={handleUpdateTableStatus}
            />
          )}
        </>
      )}

      {/* VIEW B: CASHIER (POSKasir) */}
      {role === 'kasir' && (
        <POSKasir 
          products={products}
          categories={categories}
          tables={tables}
          memberships={memberships}
          vouchers={vouchers}
          activeOutlet={activeOutlet}
          onAddOrder={handleAddNewOrder}
          onUpdateTableStatus={handleUpdateTableStatus}
        />
      )}

      {/* VIEW C: BARISTA (Kitchen Display System - KDS) */}
      {role === 'barista' && (
        <KitchenKDS 
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onAssignedBarista={handleAssignBarista}
        />
      )}

      {/* VIEW D: WAITER / COURIER (OrderTracker) */}
      {role === 'pelayan' && (
        <OrderTracker 
          orders={orders}
          tables={tables}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
          onUpdateTableStatus={handleUpdateTableStatus}
        />
      )}

      {/* VIEW E: CUSTOMER (CustomerQRMenu phone layout) */}
      {role === 'customer' && (
        <CustomerQRMenu 
          products={products}
          categories={categories}
          tables={tables}
          selectedTable={activeTable}
          memberships={memberships}
          onAddOrder={handleAddNewOrder}
          onAddMember={(m) => setMemberships([m, ...memberships])}
          onAddReservation={(r) => setReservations([r, ...reservations])}
          onAddFeedback={(f) => setFeedbacks([f, ...feedbacks])}
          onUpdateTableStatus={handleUpdateTableStatus}
        />
      )}

    </div>
  );
}
