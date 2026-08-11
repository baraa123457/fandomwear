import { products } from "@/lib/data/products";

export type AdminOrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  total: number;
  status: AdminOrderStatus;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  joined: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  uses: number;
  maxUses: number;
  active: boolean;
  expires: string;
}

const customerNames = [
  "Alex Rivera", "Priya Sharma", "Omar Khalil", "Lena Fischer", "Marcus Thompson",
  "Yuki Nakamura", "Sofia Rossi", "Ben Harrison", "Aisha Bello", "Diego Lopez",
];

export const customers: Customer[] = customerNames.map((name, i) => ({
  id: `c${i + 1}`,
  name,
  email: `${name.toLowerCase().replace(" ", ".")}@email.com`,
  orders: 1 + ((i * 3) % 9),
  totalSpent: Math.round((80 + i * 47.3) * 100) / 100,
  joined: new Date(2026, i % 8, ((i * 5) % 27) + 1).toISOString(),
}));

const statuses: AdminOrderStatus[] = ["processing", "shipped", "delivered", "delivered", "cancelled"];

export const orders: AdminOrder[] = Array.from({ length: 18 }, (_, i) => {
  const customer = customerNames[i % customerNames.length];
  const items = 1 + (i % 3);
  const total = Math.round((items * (30 + (i * 7) % 20)) * 100) / 100;
  return {
    id: `FW-${10400 + i * 13}`,
    customer,
    email: `${customer.toLowerCase().replace(" ", ".")}@email.com`,
    date: new Date(2026, (i % 7) + 1, ((i * 4) % 27) + 1).toISOString(),
    items,
    total,
    status: statuses[i % statuses.length],
  };
});

export const discountCodes: DiscountCode[] = [
  { id: "d1", code: "WELCOME10", type: "percentage", value: 10, uses: 342, maxUses: 1000, active: true, expires: "2026-12-31" },
  { id: "d2", code: "FREESHIP", type: "fixed", value: 5.99, uses: 128, maxUses: 500, active: true, expires: "2026-09-30" },
  { id: "d3", code: "ANIME20", type: "percentage", value: 20, uses: 87, maxUses: 200, active: true, expires: "2026-08-31" },
  { id: "d4", code: "SUMMER25", type: "percentage", value: 25, uses: 500, maxUses: 500, active: false, expires: "2026-07-01" },
  { id: "d5", code: "VIP15", type: "percentage", value: 15, uses: 44, maxUses: 100, active: true, expires: "2026-10-15" },
];

export function getInventory(productList: typeof products = products) {
  return productList.map((p) => ({
    id: p.id,
    name: p.name,
    universe: p.universe,
    category: p.category,
    stock: p.stock,
    price: p.price,
    status: p.stock === 0 ? "out" : p.stock <= 30 ? "low" : "healthy",
  }));
}

export function getAnalytics() {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalRevenue / totalOrders;
  const totalCustomers = customers.length;

  const revenueByMonth = [
    { month: "Feb", revenue: 4200 },
    { month: "Mar", revenue: 5100 },
    { month: "Apr", revenue: 4800 },
    { month: "May", revenue: 6300 },
    { month: "Jun", revenue: 7100 },
    { month: "Jul", revenue: 8450 },
  ];

  const salesByUniverse = [
    { universe: "Anime", value: 32 },
    { universe: "Gaming", value: 28 },
    { universe: "Marvel", value: 18 },
    { universe: "DC", value: 10 },
    { universe: "Potter", value: 7 },
    { universe: "Fantasy", value: 3 },
    { universe: "Movies", value: 2 },
  ];

  return { totalRevenue, totalOrders, avgOrderValue, totalCustomers, revenueByMonth, salesByUniverse };
}
