"use client";

import { useState, Fragment } from "react";
import { ChevronDown, Download, PackageOpen } from "lucide-react";
import { useOrders, OrderStatus } from "@/context/orders-context";
import { StatusBadge } from "@/components/admin/status-badge";
import { Dropdown } from "@/components/shared/dropdown";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { formatPrice, cn } from "@/lib/utils";
import { downloadCSV, ordersToCSV } from "@/lib/csv";

const statusOptions: OrderStatus[] = ["processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const { orders, isLoading, updateOrderStatus } = useOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await updateOrderStatus(id, status);
    if (error) {
      toast({ variant: "error", title: "Couldn't update order", description: error });
      return;
    }
    toast({ variant: "success", title: "Order updated", description: `${id} → ${status}` });
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast({ variant: "error", title: "No orders to export yet" });
      return;
    }
    downloadCSV(`fandomwear-orders-${new Date().toISOString().slice(0, 10)}.csv`, ordersToCSV(orders));
    toast({ variant: "success", title: "Orders exported", description: `${orders.length} orders` });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>
          <p className="mt-1 text-sm text-ink-faint">{orders.length} orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-line py-16 text-center">
          <p className="text-sm text-ink-dim">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-line py-16 text-center">
          <PackageOpen className="h-6 w-6 text-ink-faint" />
          <p className="text-sm text-ink-dim">No orders yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-xs uppercase tracking-wider text-ink-faint">
                <th className="w-8 px-4 py-3" />
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const expanded = expandedId === o.id;
                const itemCount = o.items.reduce((sum, i) => sum + i.quantity, 0);
                return (
                  <Fragment key={o.id}>
                    <tr className="border-b border-line/60 last:border-0">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : o.id)}
                          aria-label={expanded ? `Collapse ${o.id}` : `Expand ${o.id}`}
                          aria-expanded={expanded}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink"
                        >
                          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-ink">{o.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-ink">{o.shippingAddress.fullName}</p>
                        <p className="text-xs text-ink-faint">{o.email}</p>
                      </td>
                      <td className="px-4 py-3 text-ink-dim">
                        {new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-ink-dim">{itemCount}</td>
                      <td className="px-4 py-3 font-mono text-ink">{formatPrice(o.total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={o.status} />
                          <Dropdown
                            compact
                            ariaLabel={`Update status for ${o.id}`}
                            value={o.status}
                            options={statusOptions.map((s) => ({ value: s, label: s }))}
                            onChange={(status) => updateStatus(o.id, status)}
                          />
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="border-b border-line/60 bg-surface/50 last:border-0">
                        <td />
                        <td colSpan={6} className="px-4 py-3">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-ink-faint">
                                <th className="py-1 pr-4 font-medium">Product</th>
                                <th className="py-1 pr-4 font-medium">Size</th>
                                <th className="py-1 pr-4 font-medium">Color</th>
                                <th className="py-1 pr-4 font-medium">Qty</th>
                                <th className="py-1 pr-4 font-medium">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items.map((item, idx) => (
                                <tr key={`${item.productId}-${item.size}-${idx}`}>
                                  <td className="py-1 pr-4 text-ink-dim">{item.name}</td>
                                  <td className="py-1 pr-4">
                                    <span className="rounded-full border border-line bg-void px-2 py-0.5 font-semibold text-ink">
                                      {item.size}
                                    </span>
                                  </td>
                                  <td className="py-1 pr-4 text-ink-dim">{item.color}</td>
                                  <td className="py-1 pr-4 text-ink-dim">{item.quantity}</td>
                                  <td className="py-1 pr-4 font-mono text-ink-dim">{formatPrice(item.price)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
