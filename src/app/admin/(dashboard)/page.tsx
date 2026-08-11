"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { createClient } from "@/lib/supabase/client";
import { useCatalog } from "@/context/catalog-context";
import { formatPrice } from "@/lib/utils";

interface OrderForAnalytics {
  total: number;
  created_at: string;
  order_items: { universe_id: string | null; unit_price: number; quantity: number }[];
}

export default function AdminDashboardPage() {
  const { getUniverse } = useCatalog();
  const supabase = createClient();
  const [orders, setOrders] = useState<OrderForAnalytics[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("orders").select("total, created_at, order_items(universe_id, unit_price, quantity)"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    ]).then(([ordersRes, customersRes]) => {
      setOrders((ordersRes.data as unknown as OrderForAnalytics[]) ?? []);
      setTotalCustomers(customersRes.count ?? 0);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + Number(o.total), 0), [orders]);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const revenueByMonth = useMemo(() => {
    const buckets = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(d.toLocaleDateString("en-US", { month: "short" }), 0);
    }
    for (const o of orders) {
      const label = new Date(o.created_at).toLocaleDateString("en-US", { month: "short" });
      if (buckets.has(label)) buckets.set(label, (buckets.get(label) ?? 0) + Number(o.total));
    }
    return Array.from(buckets.entries()).map(([month, revenue]) => ({ month, revenue }));
  }, [orders]);

  const pieData = useMemo(() => {
    const totals = new Map<string, number>();
    let grandTotal = 0;
    for (const o of orders) {
      for (const item of o.order_items) {
        const key = item.universe_id ?? "other";
        const amount = Number(item.unit_price) * item.quantity;
        totals.set(key, (totals.get(key) ?? 0) + amount);
        grandTotal += amount;
      }
    }
    return Array.from(totals.entries()).map(([universeId, amount]) => {
      const universe = getUniverse(universeId);
      return {
        universe: universe.label,
        value: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
        color: universe.color,
      };
    });
  }, [orders, getUniverse]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-faint">Store performance at a glance.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total revenue" value={formatPrice(totalRevenue)} icon={DollarSign} />
        <StatCard label="Orders" value={String(totalOrders)} icon={ShoppingCart} />
        <StatCard label="Customers" value={String(totalCustomers)} icon={Users} />
        <StatCard label="Avg. order value" value={formatPrice(avgOrderValue)} icon={TrendingUp} />
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-ink-faint">Loading analytics...</p>
      ) : totalOrders === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line py-16 text-center">
          <p className="text-sm text-ink-faint">No orders yet — charts will fill in once customers start checking out.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Revenue trend</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByMonth}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#7C5CFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a30" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b6b73" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b6b73" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ background: "#131316", border: "1px solid #2a2a30", borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: "#f5f5f2" }}
                    formatter={(value) => [formatPrice(Number(value)), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#7C5CFF" strokeWidth={2} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Sales by universe</h2>
            <div className="mt-4 h-72">
              {pieData.length === 0 ? (
                <p className="text-sm text-ink-faint">Not enough data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="universe" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {pieData.map((entry) => (
                        <Cell key={entry.universe} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#131316", border: "1px solid #2a2a30", borderRadius: 12, fontSize: 12 }}
                      formatter={(value, name) => [`${value}%`, String(name)]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: "#a3a3ab" }}
                      formatter={(value: string) => <span style={{ color: "#a3a3ab" }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
