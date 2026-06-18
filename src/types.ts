/**
 * Typings for the Coffee Shop POS & Order Management System
 */

export type UserRole = 'admin' | 'kasir' | 'barista' | 'pelayan' | 'customer';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  image: string;
  description: string;
  isAvailable: boolean;
  estimationMinutes: number;
}

export interface StockHistoryItem {
  id: string;
  date: string;
  type: 'in' | 'out';
  qty: number;
  unit: string;
  notes: string;
}

export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  minimumStock: number;
  unit: string;
  alertTriggered: boolean;
  histories: StockHistoryItem[];
}

export interface PurchaseHistory {
  id: string;
  date: string;
  itemName: string;
  qty: number;
  totalPrice: number;
  status: 'Lunas' | 'Menunggu';
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  purchases: PurchaseHistory[];
}

export interface DiningTable {
  id: string;
  code: string;
  status: 'Kosong' | 'Terisi' | 'Reservasi';
  currentOrderId?: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  tableId: string;
  date: string;
  time: string;
  status: 'Booked' | 'Cancelled' | 'Selesai';
}

export interface Membership {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  cashback: number;
  joinsAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  type: 'percentage' | 'nominal' | 'buy1get1';
  value: number; // For % e.g. 15, for nominal e.g. 10000
  minPurchase: number;
  endsAt: string;
  description: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
  notes?: string;
  customizations?: string[]; // e.g. ["Less Sugar", "Extra Shot"]
}

export interface Order {
  id: string;
  code: string; // e.g., "#COF-1001"
  outletId: string;
  outletName: string;
  tableId?: string; // empty means Takeaway or Delivery
  tableCode?: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalOriginal: number;
  discount: number;
  tax: number;
  totalPayable: number;
  paymentMethod?: 'Cash' | 'Debit' | 'Kredit' | 'QRIS' | 'E-Wallet';
  paymentStatus: 'Belum Bayar' | 'Lunas';
  orderType: 'Dine-In' | 'Takeaway' | 'Delivery';
  status: 'Menunggu' | 'Diproses' | 'Sedang Dibuat' | 'Siap Diantar' | 'Selesai';
  deliveryStatus?: 'Menunggu Driver' | 'Diambil Driver' | 'Dalam Pengiriman' | 'Selesai';
  createdTime: string;
  completedTime?: string;
  baristaAssigned?: string;
  feedback?: {
    rating: number;
    categories: string[]; // e.g., ["Rasa", "Pelayanan"]
    comments: string;
  };
}

export interface Feedback {
  id: string;
  date: string;
  orderId: string;
  orderCode: string;
  customerName: string;
  rating: number;
  categories: string[];
  comments: string;
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface AppNotification {
  id: string;
  time: string;
  title: string;
  message: string;
  channel: 'WhatsApp' | 'Telegram' | 'In-App';
  recipient: string;
  status: 'Success' | 'Pending';
}
