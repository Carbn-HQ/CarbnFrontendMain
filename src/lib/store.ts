// Smart Tailor data layer (offline-first localStorage)
// Models: Customer (with saved measurements) + Order (style + deadline + payments + status).

import { OrderStatus, STATUS_FLOW } from "./constants";

export type Measurements = Record<string, string>;

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  measurements?: Measurements; // saved body profile
  createdAt: number;
}

export interface StatusEvent {
  status: OrderStatus;
  at: number;
}

export type PaymentMethod = "cash" | "momo";

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  at: number;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;     // e.g. "TLR-0001"
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  styleName: string;       // e.g. "Kaba & Slit", "3-piece suit"
  styleNotes?: string;
  photos: string[];        // base64 dataURLs — design references
  measurements: Measurements; // snapshot at time of order
  status: OrderStatus;
  statusHistory: StatusEvent[];
  createdAt: number;
  dueDate?: number;        // deadline
  totalAmount: number;
  payments: Payment[];
  assignedTo?: string;     // staff name (free-text)
}

export interface UserProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  location: string;
  password: string;
}

const CUSTOMERS_KEY = "smarttailor_customers";
const ORDERS_KEY = "smarttailor_orders";
const USER_KEY = "smarttailor_user";
const COUNTER_KEY = "smarttailor_order_counter";
const MIGRATED_KEY = "smarttailor_migrated_v1";

// One-time migration: lift user profile from earlier projects, but drop laundry orders entirely.
(function migrate() {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(MIGRATED_KEY)) return;

  const oldUser = localStorage.getItem("quickwash_user") || localStorage.getItem("quickserve_user");
  if (oldUser && !localStorage.getItem(USER_KEY)) localStorage.setItem(USER_KEY, oldUser);
  const oldLogin = localStorage.getItem("quickwash_logged_in") || localStorage.getItem("quickserve_logged_in");
  if (oldLogin) localStorage.setItem("smarttailor_logged_in", oldLogin);
  const oldTrial = localStorage.getItem("quickwash_trial_start") || localStorage.getItem("quickserve_trial_start");
  if (oldTrial) localStorage.setItem("smarttailor_trial_start", oldTrial);

  // Drop everything else from prior incarnations.
  [
    "quickwash_customers", "quickwash_orders", "quickwash_user", "quickwash_order_counter",
    "quickwash_logged_in", "quickwash_trial_start", "quickwash_migrated_v1",
    "quickserve_services", "quickserve_entries", "quickserve_customers", "quickserve_user",
    "quickserve_logged_in", "quickserve_trial_start", "quickserve_migrated_v1",
    "quicksell_products", "quicksell_sales", "quicksell_user", "quicksell_logged_in", "quicksell_trial_start",
  ].forEach((k) => localStorage.removeItem(k));

  localStorage.setItem(MIGRATED_KEY, "1");
})();

// ---- User ----
export function getUserProfile(): UserProfile | null {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}
export function saveUserProfile(p: UserProfile) {
  localStorage.setItem(USER_KEY, JSON.stringify(p));
}

// ---- Customers ----
export function getCustomers(): Customer[] {
  return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || "[]");
}
export function saveCustomers(c: Customer[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(c));
}
export function addCustomer(input: { name: string; phone?: string; measurements?: Measurements; notes?: string }): Customer {
  const customers = getCustomers();
  const customer: Customer = {
    id: crypto.randomUUID(),
    name: input.name,
    phone: input.phone,
    notes: input.notes,
    measurements: input.measurements,
    createdAt: Date.now(),
  };
  customers.push(customer);
  saveCustomers(customers);
  return customer;
}
export function updateCustomer(id: string, updates: Partial<Customer>) {
  saveCustomers(getCustomers().map((c) => (c.id === id ? { ...c, ...updates } : c)));
}
export function deleteCustomer(id: string) {
  saveCustomers(getCustomers().filter((c) => c.id !== id));
}
export function ensureCustomerByName(name: string, phone?: string, measurements?: Measurements): Customer {
  const trimmed = name.trim();
  const existing = getCustomers().find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    const patch: Partial<Customer> = {};
    if (phone && !existing.phone) patch.phone = phone;
    if (measurements && Object.keys(measurements).length > 0) {
      // Merge: order's measurements update the saved profile.
      patch.measurements = { ...(existing.measurements ?? {}), ...measurements };
    }
    if (Object.keys(patch).length) {
      updateCustomer(existing.id, patch);
      return { ...existing, ...patch };
    }
    return existing;
  }
  return addCustomer({ name: trimmed, phone, measurements });
}

// ---- Orders ----
function nextOrderNumber(): string {
  const n = parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10) + 1;
  localStorage.setItem(COUNTER_KEY, String(n));
  return `TLR-${String(n).padStart(4, "0")}`;
}

export function getOrders(): Order[] {
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
}
export function saveOrders(o: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(o));
}

export function createOrder(input: {
  customerName: string;
  customerPhone?: string;
  styleName: string;
  styleNotes?: string;
  photos?: string[];
  measurements: Measurements;
  saveMeasurementsToProfile?: boolean;
  totalAmount: number;
  deposit?: number;
  depositMethod?: PaymentMethod;
  dueDate?: number;
  assignedTo?: string;
}): Order {
  const customer = ensureCustomerByName(
    input.customerName,
    input.customerPhone,
    input.saveMeasurementsToProfile ? input.measurements : undefined,
  );
  const now = Date.now();
  const payments: Payment[] = [];
  if (input.deposit && input.deposit > 0) {
    payments.push({
      id: crypto.randomUUID(),
      amount: input.deposit,
      method: input.depositMethod ?? "cash",
      at: now,
      note: "Deposit",
    });
  }
  const order: Order = {
    id: crypto.randomUUID(),
    orderNumber: nextOrderNumber(),
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    styleName: input.styleName,
    styleNotes: input.styleNotes,
    photos: input.photos ?? [],
    measurements: input.measurements,
    status: "pending",
    statusHistory: [{ status: "pending", at: now }],
    createdAt: now,
    dueDate: input.dueDate,
    totalAmount: input.totalAmount,
    payments,
    assignedTo: input.assignedTo,
  };
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  return order;
}

export function updateOrder(id: string, updates: Partial<Order>) {
  saveOrders(getOrders().map((o) => (o.id === id ? { ...o, ...updates } : o)));
}

export function advanceOrderStatus(id: string, status: OrderStatus) {
  const orders = getOrders();
  const updated = orders.map((o) => {
    if (o.id !== id) return o;
    if (o.status === status) return o;
    return { ...o, status, statusHistory: [...o.statusHistory, { status, at: Date.now() }] };
  });
  saveOrders(updated);
}

export function deleteOrder(id: string) {
  saveOrders(getOrders().filter((o) => o.id !== id));
}

export function addPayment(orderId: string, payment: { amount: number; method: PaymentMethod; note?: string }) {
  const orders = getOrders();
  saveOrders(orders.map((o) => o.id === orderId ? {
    ...o,
    payments: [...o.payments, { id: crypto.randomUUID(), at: Date.now(), ...payment }],
  } : o));
}

export function deletePayment(orderId: string, paymentId: string) {
  const orders = getOrders();
  saveOrders(orders.map((o) => o.id === orderId ? {
    ...o, payments: o.payments.filter((p) => p.id !== paymentId),
  } : o));
}

// ---- Helpers ----
export const paidAmount = (o: Order) => o.payments.reduce((a, p) => a + p.amount, 0);
export const balanceOf = (o: Order) => Math.max(0, o.totalAmount - paidAmount(o));
export const isOverdue = (o: Order) =>
  !!o.dueDate && o.status !== "completed" && o.dueDate < Date.now();
export const isDueSoon = (o: Order, hours = 48) =>
  !!o.dueDate && o.status !== "completed" && o.dueDate >= Date.now() && o.dueDate < Date.now() + hours * 3600_000;

// ---- Selectors ----
function startOfToday() { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); }
function startOfWeek()  { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-6); return d.getTime(); }
function startOfMonth() { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d.getTime(); }

export function getRevenue() {
  const orders = getOrders();
  const today = startOfToday(), week = startOfWeek(), month = startOfMonth();
  const sumPaid = (list: Order[]) =>
    list.reduce((a, o) => a + o.payments.filter((p) => p.at >= 0).reduce((b, p) => b + p.amount, 0), 0);
  const sumPaidWindow = (since: number) =>
    orders.reduce((a, o) => a + o.payments.filter((p) => p.at >= since).reduce((b, p) => b + p.amount, 0), 0);
  return {
    today: sumPaidWindow(today),
    week:  sumPaidWindow(week),
    month: sumPaidWindow(month),
    todayCount: orders.filter((o) => o.createdAt >= today).length,
    totalPaid: sumPaid(orders),
  };
}

export function getActiveOrders(): Order[] {
  return getOrders().filter((o) => o.status !== "completed");
}

export function getOrdersByStatus(): Record<OrderStatus, Order[]> {
  const map: Record<OrderStatus, Order[]> = { pending: [], cutting: [], sewing: [], fitting: [], completed: [] };
  getOrders().forEach((o) => map[o.status].push(o));
  return map;
}

export function getOutstandingBalances() {
  const list = getOrders().filter((o) => balanceOf(o) > 0);
  return { orders: list, count: list.length, total: list.reduce((a, o) => a + balanceOf(o), 0) };
}

export function getUpcomingDeadlines(days = 7): Order[] {
  const until = Date.now() + days * 24 * 3600_000;
  return getOrders()
    .filter((o) => o.status !== "completed" && o.dueDate && o.dueDate <= until)
    .sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0));
}

export function getOverdueOrders(): Order[] {
  return getOrders().filter(isOverdue).sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0));
}

export interface CustomerStats extends Customer {
  visitCount: number;   // = order count
  totalSpent: number;   // = paid only
  lastVisit: number | null;
  outstanding: number;
}

export function getCustomerStats(): CustomerStats[] {
  const customers = getCustomers();
  const orders = getOrders();
  return customers.map((c) => {
    const mine = orders.filter((o) => o.customerId === c.id);
    return {
      ...c,
      visitCount: mine.length,
      totalSpent: mine.reduce((a, o) => a + paidAmount(o), 0),
      outstanding: mine.reduce((a, o) => a + balanceOf(o), 0),
      lastVisit: mine.length ? Math.max(...mine.map((o) => o.createdAt)) : null,
    };
  });
}
export function getFrequentCustomers(minVisits = 3): CustomerStats[] {
  return getCustomerStats().filter((c) => c.visitCount >= minVisits).sort((a, b) => b.visitCount - a.visitCount);
}
export function getInactiveCustomers(daysSince = 30): CustomerStats[] {
  const cutoff = Date.now() - daysSince * 24 * 3600 * 1000;
  return getCustomerStats().filter((c) => c.lastVisit !== null && c.lastVisit < cutoff)
    .sort((a, b) => (a.lastVisit ?? 0) - (b.lastVisit ?? 0));
}
export function getTopCustomer(): CustomerStats | null {
  const s = getCustomerStats().sort((a, b) => b.visitCount - a.visitCount);
  return s[0] && s[0].visitCount > 0 ? s[0] : null;
}

// Past style photos for a given customer (for "design archive / reorder").
export function getCustomerStyleHistory(customerId: string): Order[] {
  return getOrders()
    .filter((o) => o.customerId === customerId && o.photos.length > 0)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export { STATUS_FLOW };
