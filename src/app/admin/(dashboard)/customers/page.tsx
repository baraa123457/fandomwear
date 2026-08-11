import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  // Real registered users (Supabase Auth → profiles), not seed data. Orders
  // are aggregated client-side here rather than with a SQL view/RPC to keep
  // this migration pass simple — fine at this data scale, worth revisiting
  // (a Postgres view) if the customer list grows large.
  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false }),
    supabase.from("orders").select("user_id, total"),
  ]);

  const stats = new Map<string, { orders: number; totalSpent: number }>();
  for (const o of orders ?? []) {
    const entry = stats.get(o.user_id) ?? { orders: 0, totalSpent: 0 };
    entry.orders += 1;
    entry.totalSpent += Number(o.total);
    stats.set(o.user_id, entry);
  }

  const customers = (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.full_name || p.email.split("@")[0],
    email: p.email,
    joined: p.created_at,
    orders: stats.get(p.id)?.orders ?? 0,
    totalSpent: stats.get(p.id)?.totalSpent ?? 0,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Customers</h1>
      <p className="mt-1 text-sm text-ink-faint">{customers.length} customers</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface text-xs uppercase tracking-wider text-ink-faint">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total spent</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-ink-faint">
                  No customers have signed up yet.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{c.name}</p>
                    <p className="text-xs text-ink-faint">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-dim">{c.orders}</td>
                  <td className="px-4 py-3 font-mono text-ink">{formatPrice(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-ink-dim">
                    {new Date(c.joined).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
