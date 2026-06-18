import { Category, Product, Ingredient, Supplier, DiningTable, Membership, Voucher, Outlet, Order, Feedback, AppNotification } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-coffee', name: 'Coffee', icon: 'Coffee' },
  { id: 'cat-non-coffee', name: 'Non Coffee', icon: 'CupSoda' },
  { id: 'cat-tea', name: 'Tea', icon: 'Leaf' },
  { id: 'cat-snack', name: 'Snack', icon: 'Cookie' },
  { id: 'cat-dessert', name: 'Dessert', icon: 'Cake' },
  { id: 'cat-promo', name: 'Promo', icon: 'Percent' }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Coffee
  {
    id: 'prod-espresso',
    name: 'Espresso Double Shot',
    categoryId: 'cat-coffee',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1510707577719-0d158351c502?q=80&w=300&auto=format&fit=crop',
    description: 'Ekstrak murni biji kopi Arabica pilihan dengan crema tebal beraroma kuat.',
    isAvailable: true,
    estimationMinutes: 2
  },
  {
    id: 'prod-americano',
    name: 'Classic Americano',
    categoryId: 'cat-coffee',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1551046713-bc351f261a20?q=80&w=300&auto=format&fit=crop',
    description: 'Espresso double shot yang dilarutkan ke dalam air panas, segar dan berenergi.',
    isAvailable: true,
    estimationMinutes: 3
  },
  {
    id: 'prod-cappuccino',
    name: 'Creamy Cappuccino',
    categoryId: 'cat-coffee',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=300&auto=format&fit=crop',
    description: 'Kombinasi merata antara espresso, susu hangat frothed, dan foam tebal di atasnya.',
    isAvailable: true,
    estimationMinutes: 4
  },
  {
    id: 'prod-latte',
    name: 'Signature Cafe Latte',
    categoryId: 'cat-coffee',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop',
    description: 'Espresso dengan steamed milk lembut dan sentuhan latte art cantik di atasnya.',
    isAvailable: true,
    estimationMinutes: 4
  },
  
  // Non Coffee
  {
    id: 'prod-matcha',
    name: 'Uji Matcha Latte',
    categoryId: 'cat-non-coffee',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=300&auto=format&fit=crop',
    description: 'Teh hijau Jepang Uji berkualitas dicampur dengan steamed milk manis dan lembut.',
    isAvailable: true,
    estimationMinutes: 4
  },
  {
    id: 'prod-chocolate',
    name: 'Belgian Hot Chocolate',
    categoryId: 'cat-non-coffee',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=300&auto=format&fit=crop',
    description: 'Cokelat Belgia premium cair disajikan hangat menyelubungi lidah dengan manis pas.',
    isAvailable: true,
    estimationMinutes: 4
  },

  // Tea
  {
    id: 'prod-lemon-tea',
    name: 'Iced Lemon Tea',
    categoryId: 'cat-tea',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&auto=format&fit=crop',
    description: 'Teh hitam segar diseduh dengan perasaan jeruk lemon asli dan es batu melimpah.',
    isAvailable: true,
    estimationMinutes: 2
  },
  {
    id: 'prod-earl-grey',
    name: 'Premium Earl Grey',
    categoryId: 'cat-tea',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop',
    description: 'Seduhan teh hitam beraroma minyak bergamot citrus yang menenangkan.',
    isAvailable: true,
    estimationMinutes: 3
  },

  // Snack
  {
    id: 'prod-croissant',
    name: 'Butter Croissant',
    categoryId: 'cat-snack',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop',
    description: 'Pastry mentega khas Perancis yang renyah di luar, lembut berlapis di dalam.',
    isAvailable: true,
    estimationMinutes: 5
  },
  {
    id: 'prod-donut',
    name: 'Chocolate Glazed Donut',
    categoryId: 'cat-snack',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=300&auto=format&fit=crop',
    description: 'Donat kentang empuk dibalut cokelat beku mengkilap yang lezat.',
    isAvailable: true,
    estimationMinutes: 1
  },
  {
    id: 'prod-fries',
    name: 'Truffle French Fries',
    categoryId: 'cat-snack',
    price: 24000,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=300&auto=format&fit=crop',
    description: 'Kentang goreng gurih beraroma minyak truffle mewah disajikan dengan saus cocolan.',
    isAvailable: true,
    estimationMinutes: 7
  },

  // Dessert
  {
    id: 'prod-waffle',
    name: 'Croffle with Maple Syrup',
    categoryId: 'cat-dessert',
    price: 26000,
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=300&auto=format&fit=crop',
    description: 'Croissant panggang waffle gurih manis bertabur es krim vanilla dan sirup mapel.',
    isAvailable: true,
    estimationMinutes: 8
  },
  {
    id: 'prod-tiramisu',
    name: 'Classic Espresso Tiramisu',
    categoryId: 'cat-dessert',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=300&auto=format&fit=crop',
    description: 'Kue tiramisu lembut berlapis krim keju mascarpone beraroma kuat espresso espresso arabika.',
    isAvailable: true,
    estimationMinutes: 2
  },

  // Promo
  {
    id: 'prod-promo1',
    name: 'Combo Ngopi Pagi',
    categoryId: 'cat-promo',
    price: 38000, // Latte + Croissant = 53000 normally
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300&auto=format&fit=crop',
    description: 'Sarapan hemat: 1 Kopi Latte Signature hangat dan 1 mentega Butter Croissant renyah.',
    isAvailable: true,
    estimationMinutes: 5
  },
  {
    id: 'prod-promo2',
    name: 'Combo Nongki Berdua',
    categoryId: 'cat-promo',
    price: 65000, // 2x Americano + Fries = 68000 normally
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop',
    description: 'Hemat berdua: 2 Americano Es dingin dipadukan bersama 1 porsi Kentang Truffle renyah.',
    isAvailable: true,
    estimationMinutes: 7
  }
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-coffee-bean',
    name: 'Biji Kopi Arabica (Lintong)',
    stock: 5200, // in Grams
    minimumStock: 1000,
    unit: 'Gram',
    alertTriggered: false,
    histories: [
      { id: 'h-1', date: '2026-06-15', type: 'in', qty: 10000, unit: 'Gram', notes: 'Restock bulanan' },
      { id: 'h-2', date: '2026-06-16', type: 'out', qty: 2400, unit: 'Gram', notes: 'Penggunaan harian barista' },
      { id: 'h-3', date: '2026-06-17', type: 'out', qty: 2400, unit: 'Gram', notes: 'Penggunaan harian barista' }
    ]
  },
  {
    id: 'ing-milk',
    name: 'Susu Segar Greenfield',
    stock: 14000, // in mL
    minimumStock: 4000,
    unit: 'mL',
    alertTriggered: false,
    histories: [
      { id: 'h-4', date: '2026-06-16', type: 'in', qty: 20000, unit: 'mL', notes: 'Masuk kiriman supplier' },
      { id: 'h-5', date: '2026-06-17', type: 'out', qty: 6000, unit: 'mL', notes: 'Pembuatan Latte/Cappuccino' }
    ]
  },
  {
    id: 'ing-sugar',
    name: 'Gula Cair Fruktosa',
    stock: 800, // in Grams -> Low Stock Alert!
    minimumStock: 1500,
    unit: 'Gram',
    alertTriggered: true,
    histories: [
      { id: 'h-6', date: '2026-06-15', type: 'in', qty: 5000, unit: 'Gram', notes: 'Pembelian langsung kas' },
      { id: 'h-7', date: '2026-06-16', type: 'out', qty: 2200, unit: 'Gram', notes: 'Pemanis minuman' },
      { id: 'h-8', date: '2026-06-17', type: 'out', qty: 2000, unit: 'Gram', notes: 'Pemanis minuman' }
    ]
  },
  {
    id: 'ing-vanilla',
    name: 'Sirup Vanilla Toffin',
    stock: 3500, // in mL
    minimumStock: 1000,
    unit: 'mL',
    alertTriggered: false,
    histories: [
      { id: 'h-9', date: '2026-06-14', type: 'in', qty: 5000, unit: 'mL', notes: 'Stok awal Toffin' },
      { id: 'h-10', date: '2026-06-16', type: 'out', qty: 1500, unit: 'mL', notes: 'Mixology vanilla blends' }
    ]
  },
  {
    id: 'ing-chocolate',
    name: 'Cokelat Bubuk Belgia',
    stock: 3000, // in Gram
    minimumStock: 800,
    unit: 'Gram',
    alertTriggered: false,
    histories: [
      { id: 'h-11', date: '2026-06-15', type: 'in', qty: 4000, unit: 'Gram', notes: 'Gudang pusat' },
      { id: 'h-12', date: '2026-06-17', type: 'out', qty: 1000, unit: 'Gram', notes: 'Minuman chocolate' }
    ]
  },
  {
    id: 'ing-matcha',
    name: 'Teh Matcha Bubuk Uji',
    stock: 450, // in Gram -> Alert!
    minimumStock: 500,
    unit: 'Gram',
    alertTriggered: true,
    histories: [
      { id: 'h-13', date: '2026-06-15', type: 'in', qty: 1000, unit: 'Gram', notes: 'Beli online' },
      { id: 'h-14', date: '2026-06-17', type: 'out', qty: 550, unit: 'Gram', notes: 'Matcha lattes' }
    ]
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-java',
    name: 'PT Java Bean Roasted',
    address: 'Jl. Pegangsaan Dua No.17, Jakarta Utara',
    phone: '021-4569871',
    email: 'sales@javabeanroasted.co.id',
    purchases: [
      { id: 'p-1', date: '2026-06-01', itemName: 'Biji Arabika Lintong (20kg)', qty: 20000, totalPrice: 3200000, status: 'Lunas' },
      { id: 'p-2', date: '2026-06-15', itemName: 'Biji Toraja Sapan (10kg)', qty: 10000, totalPrice: 1800000, status: 'Lunas' }
    ]
  },
  {
    id: 'sup-greenfield',
    name: 'CV Greenfield Fresh Diary',
    address: 'Kawasan Industri Sentul, Bogor, Jawa Barat',
    phone: '0812-9988-7766',
    email: 'order@greenfieldfresh.com',
    purchases: [
      { id: 'p-3', date: '2026-06-10', itemName: 'Susu Fresh Greenfield Carton (40L)', qty: 40000, totalPrice: 1100000, status: 'Lunas' },
      { id: 'p-4', date: '2026-06-16', itemName: 'Susu Fresh Greenfield Carton (20L)', qty: 20000, totalPrice: 560000, status: 'Lunas' }
    ]
  },
  {
    id: 'sup-toffin',
    name: 'Toffin Syrup & Mixology Indonesia',
    address: 'Kawasan Plaza Indonesia, Menteng, Jakarta Pusat',
    phone: '021-3988220',
    email: 'info@toffin.co.id',
    purchases: [
      { id: 'p-5', date: '2026-06-05', itemName: 'Sirup Vanilla (6 Botol)', qty: 6000, totalPrice: 580000, status: 'Lunas' },
      { id: 'p-6', date: '2026-06-18', itemName: 'Sirup Caramel & Hazelnut (12 Botol)', qty: 12000, totalPrice: 1160000, status: 'Menunggu' }
    ]
  }
];

export const INITIAL_TABLES: DiningTable[] = [
  { id: 't1', code: 'Meja 01', status: 'Terisi' },
  { id: 't2', code: 'Meja 02', status: 'Kosong' },
  { id: 't3', code: 'Meja 03', status: 'Terisi' },
  { id: 't4', code: 'Meja 04', status: 'Kosong' },
  { id: 't5', code: 'Meja 05', status: 'Reservasi' },
  { id: 't6', code: 'Meja 06', status: 'Kosong' },
  { id: 't7', code: 'Meja 07', status: 'Kosong' },
  { id: 't8', code: 'Meja 08', status: 'Terisi' },
  { id: 't9', code: 'Meja 09', status: 'Kosong' },
  { id: 't10', code: 'Meja 10', status: 'Kosong' }
];

export const INITIAL_OUTLETS: Outlet[] = [
  { id: 'out-sudirman', name: 'Kopi Kenangan - Sudirman Office', address: 'Sudirman Central Business District Kav. 52, Jakarta', phone: '0812-1111-2222' },
  { id: 'out-kemang', name: 'Kopi Kenangan - Kemang Sanctuary', address: 'Jl. Kemang Raya No. 45, Mampang, Jakarta Selatan', phone: '0812-3333-4444' },
  { id: 'out-dago', name: 'Kopi Kenangan - Dago Vista', address: 'Jl. Ir. H. Juanda No. 120, Dago, Bandung', phone: '0812-5555-6666' }
];

export const INITIAL_VOUCHERS: Voucher[] = [
  { id: 'v-1', code: 'DISKON10', type: 'percentage', value: 10, minPurchase: 30000, endsAt: '2026-12-31', description: 'Diskon 10% untuk transaksi minimal Rp30.000' },
  { id: 'v-2', code: 'MANTAP50K', type: 'nominal', value: 50000, minPurchase: 150000, endsAt: '2026-08-30', description: 'Potongan instan Rp50.000 untuk minimal transaksi Rp150.000' },
  { id: 'v-3', code: 'BUY1GET1', type: 'buy1get1', value: 100, minPurchase: 50000, endsAt: '2026-10-15', description: 'Beli 1 gratis 1 untuk produk kopi pilihan, minimal order Rp50.000' },
  { id: 'v-4', code: 'MAUMURAH', type: 'percentage', value: 20, minPurchase: 40000, endsAt: '2026-07-31', description: 'Diskon 20% tanpa batas, spesial opening cabang baru.' }
];

export const INITIAL_MEMBERSHIPS: Membership[] = [
  { id: 'm-1', name: 'Budi Santoso', email: 'budi@gmail.com', phone: '08123456789', points: 140, cashback: 15000, joinsAt: '2026-01-10' },
  { id: 'm-2', name: 'Siti Aminah', email: 'siti@yahoo.com', phone: '08573215663', points: 80, cashback: 5000, joinsAt: '2026-03-24' },
  { id: 'm-3', name: 'Andi Wijaya', email: 'andi@wijaya.me', phone: '08112233445', points: 340, cashback: 35000, joinsAt: '2025-11-15' },
  { id: 'm-4', name: 'Dian Permata', email: 'dian@gmail.com', phone: '08139887112', points: 15, cashback: 0, joinsAt: '2026-05-02' }
];

export const INITIAL_FEEDBACKS: Feedback[] = [
  { id: 'fb-1', date: '2026-06-18 08:30', orderId: 'o-past-1', orderCode: '#COF-5491', customerName: 'Fajar Nugraha', rating: 5, categories: ['Rasa', 'Pelayanan'], comments: 'Rasa kopi Americano-nya strong banget dan croissant hangatnya juara! Server ramah banget.' },
  { id: 'fb-2', date: '2026-06-17 19:45', orderId: 'o-past-2', orderCode: '#COF-5483', customerName: 'Rini Astuti', rating: 4, categories: ['Kebersihan'], comments: 'Tempatnya bersih, tapi antrian kasir pas jam 7 malam agak panjang. Lattenya dapet art angsa bagus.' },
  { id: 'fb-3', date: '2026-06-17 14:10', orderId: 'o-past-3', orderCode: '#COF-5470', customerName: 'Santi Marpaung', rating: 3, categories: ['Pelayanan'], comments: 'Minuman chocolate enak, tapi fries-nya agak kelamaan datangnya. Kemungkinan antrian di dapur padat.' }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 'n-1', time: '09:05', title: 'Pesanan Berhasil Dibuat', message: 'Pesanan #COF-1002 (Meja 03) sedang diproses oleh Barista.', channel: 'WhatsApp', recipient: '08123456789', status: 'Success' },
  { id: 'n-2', time: '09:00', title: 'Pesanan Baru Masuk!', message: 'Pelanggan Meja 03 memesan 2x Signature Cafe Latte melalui QR Code.', channel: 'Telegram', recipient: '@owner_coffee_bot', status: 'Success' },
  { id: 'n-3', time: '08:45', title: 'Notifikasi Stock Harian', message: '⚠️ PERINGATAN: Bahan baku Guna Cair Fruktosa dan Teh Matcha Bubuk Uji mendekati minimum stock!', channel: 'In-App', recipient: 'Admin & Store Manager', status: 'Success' }
];

export const INITIAL_ORDERS: Order[] = [
  // Finished orders to feed the graphs
  {
    id: 'o-past-1',
    code: '#COF-5491',
    outletId: 'out-sudirman',
    outletName: 'Kopi Kenangan - Sudirman Office',
    tableId: 't1',
    tableCode: 'Meja 01',
    customerName: 'Fajar Nugraha',
    customerPhone: '08129998881',
    items: [
      { productId: 'prod-americano', productName: 'Classic Americano', qty: 1, price: 22000, customizations: ['Less Sugar'] },
      { productId: 'prod-croissant', productName: 'Butter Croissant', qty: 1, price: 25000 }
    ],
    totalOriginal: 47000,
    discount: 4700, // DISKON10
    tax: 4230,
    totalPayable: 46530,
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas',
    orderType: 'Dine-In',
    status: 'Selesai',
    createdTime: '2026-06-18 08:15',
    completedTime: '2026-06-18 08:30',
    feedback: { rating: 5, categories: ['Rasa', 'Pelayanan'], comments: 'Rasa kopi Americano-nya strong banget dan croissant hangatnya juara! Server ramah.' }
  },
  {
    id: 'o-past-2',
    code: '#COF-5483',
    outletId: 'out-sudirman',
    outletName: 'Kopi Kenangan - Sudirman Office',
    tableId: 't3',
    tableCode: 'Meja 03',
    customerName: 'Rini Astuti',
    customerPhone: '08125555444',
    items: [
      { productId: 'prod-latte', productName: 'Signature Cafe Latte', qty: 2, price: 28000, customizations: ['Double Shot'] },
      { productId: 'prod-donut', productName: 'Chocolate Glazed Donut', qty: 2, price: 15000 }
    ],
    totalOriginal: 86000,
    discount: 0,
    tax: 8600,
    totalPayable: 94600,
    paymentMethod: 'Debit',
    paymentStatus: 'Lunas',
    orderType: 'Dine-In',
    status: 'Selesai',
    createdTime: '2026-06-17 19:15',
    completedTime: '2026-06-17 19:40',
    feedback: { rating: 4, categories: ['Kebersihan'], comments: 'Tempatnya bersih, tapi antrian kasir pas jam 7 malam agak panjang.' }
  },
  {
    id: 'o-past-3',
    code: '#COF-5470',
    outletId: 'out-kemang',
    outletName: 'Kopi Kenangan - Kemang Sanctuary',
    tableId: 't8',
    tableCode: 'Meja 08',
    customerName: 'Santi Marpaung',
    customerPhone: '08139988221',
    items: [
      { productId: 'prod-chocolate', productName: 'Belgian Hot Chocolate', qty: 1, price: 30000 },
      { productId: 'prod-fries', productName: 'Truffle French Fries', qty: 1, price: 24000 }
    ],
    totalOriginal: 54000,
    discount: 5400, // DISKON10
    tax: 4860,
    totalPayable: 53460,
    paymentMethod: 'Cash',
    paymentStatus: 'Lunas',
    orderType: 'Dine-In',
    status: 'Selesai',
    createdTime: '2026-06-17 13:30',
    completedTime: '2026-06-17 14:05',
    feedback: { rating: 3, categories: ['Pelayanan'], comments: 'Minuman chocolate enak, tapi fries-nya agak kelamaan datangnya.' }
  },
  // Active Simulated Orders
  {
    id: 'o-active-1',
    code: '#COF-1001',
    outletId: 'out-sudirman',
    outletName: 'Kopi Kenangan - Sudirman Office',
    tableId: 't3',
    tableCode: 'Meja 03',
    customerName: 'Budi Santoso',
    customerPhone: '08123456789',
    items: [
      { productId: 'prod-latte', productName: 'Signature Cafe Latte', qty: 2, price: 28000, customizations: ['Less Sugar'], notes: 'Kopi jangan terlalu manis ya, makasih' },
      { productId: 'prod-espresso', productName: 'Espresso Double Shot', qty: 1, price: 18000 }
    ],
    totalOriginal: 74000,
    discount: 7400, // DISKON10
    tax: 6660,
    totalPayable: 73260,
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas',
    orderType: 'Dine-In',
    status: 'Sedang Dibuat',
    createdTime: '2026-06-18 09:02'
  },
  {
    id: 'o-active-2',
    code: '#COF-1002',
    outletId: 'out-sudirman',
    outletName: 'Kopi Kenangan - Sudirman Office',
    tableId: 't1',
    tableCode: 'Meja 01',
    customerName: 'Andi Wijaya',
    customerPhone: '08112233445',
    items: [
      { productId: 'prod-matcha', productName: 'Uji Matcha Latte', qty: 1, price: 30000, customizations: ['Oatmilk (+Rp5k)'] },
      { productId: 'prod-waffle', productName: 'Croffle with Maple Syrup', qty: 1, price: 26000 }
    ],
    totalOriginal: 56000,
    discount: 0,
    tax: 5600,
    totalPayable: 61600,
    paymentMethod: 'QRIS',
    paymentStatus: 'Belum Bayar', // QRIS code waiting on phone
    orderType: 'Dine-In',
    status: 'Menunggu',
    createdTime: '2026-06-18 09:12'
  },
  {
    id: 'o-active-3',
    code: '#COF-1003',
    outletId: 'out-sudirman',
    outletName: 'Kopi Kenangan - Sudirman Office',
    customerName: 'Rendy Kurniadi',
    customerPhone: '08571122334',
    items: [
      { productId: 'prod-cappuccino', productName: 'Creamy Cappuccino', qty: 1, price: 28000, customizations: ['Extra Shot'] }
    ],
    totalOriginal: 28000,
    discount: 0,
    tax: 2800,
    totalPayable: 30800,
    paymentMethod: 'E-Wallet',
    paymentStatus: 'Lunas',
    orderType: 'Takeaway',
    status: 'Siap Diantar', // Ready for customer pick up
    createdTime: '2026-06-18 08:55_AWAITING_PICKUP'
  },
  {
    id: 'o-active-4',
    code: '#COF-1004',
    outletId: 'out-sudirman',
    outletName: 'Kopi Kenangan - Sudirman Office',
    customerName: 'Sinta Bellina',
    customerPhone: '08190011223',
    items: [
      { productId: 'prod-latte', productName: 'Signature Cafe Latte', qty: 1, price: 28000 },
      { productId: 'prod-croissant', productName: 'Butter Croissant', qty: 2, price: 25000 }
    ],
    totalOriginal: 78000,
    discount: 0,
    tax: 7800,
    totalPayable: 85800,
    paymentMethod: 'Kredit',
    paymentStatus: 'Lunas',
    orderType: 'Delivery',
    status: 'Diproses',
    deliveryStatus: 'Menunggu Driver',
    createdTime: '2026-06-18 09:10'
  }
];
