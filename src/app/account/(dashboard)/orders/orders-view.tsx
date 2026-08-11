"use client";

import { useState } from "react";
import { ChevronDown, Package } from "lucide-react";
import { useOrders, OrderStatus } from "@/context/orders-context";
import { useCatalog } from "@/context/catalog-context";
import { TeeArt } from "@/components/shared/tee-art";
import { formatPrice, cn } from "@/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  processing: "bg-accent-purple/15 text-accent-purple",
  shipped: "bg-accent-cyan/15 text-accent-cyan",
  delivered: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-accent-red/15 text-accent-red",
};

export default function OrdersPage() {
  const { orders, isLoading } = useOrders();
  const { getUniverse } = useCatalog();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>
      <p className="mt-1 text-sm text-ink-faint">
        {orders.length} {orders.length === 1 ? "order" : "orders"} on file
      </p>

      {isLoading ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line py-16 text-center">
          <p className="text-sm text-ink-dim">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line py-16 text-center">
          <Package className="h-8 w-8 text-ink-faint" />
          <p className="mt-3 text-sm text-ink-dim">No orders yet.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map((order) => {
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className="rounded-2xl border border-line bg-surface">
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-ink">{order.id}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {new Date(order.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                        statusStyles[order.status]
                      )}
                    >
                      {order.status}
                    </span>
                    <span className="font-mono text-sm font-semibold text-ink">
                      {formatPrice(order.total)}
                    </span>
                    <ChevronDown
                      className={cn("h-4 w-4 text-ink-faint transition-transform", isOpen && "rotate-180")}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-line p-5">
                    <ul className="flex flex-col gap-4">
                      {order.items.map((line) => {
                        const universe = getUniverse(line.universe)!;
                        return (
                          <li key={`${line.productId}-${line.size}`} className="flex gap-3">
                            <TeeArt
                              color={universe.color}
                              icon={line.artIcon}
                              label={line.name}
                              className="h-16 w-13 shrink-0"
                            />
                            <div className="flex-1 text-sm">
                              <p className="font-medium text-ink">{line.name}</p>
                              <p className="text-xs text-ink-faint">
                                {line.size} · {line.color} · Qty {line.quantity}
                              </p>
                            </div>
                            <span className="font-mono text-sm text-ink">
                              {formatPrice(line.price * line.quantity)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-4 border-t border-line pt-4 text-xs text-ink-faint">
                      Shipping to {order.shippingAddress.fullName}, {order.shippingAddress.line1},{" "}
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                    </div>
                    <div className="mt-3 flex flex-col gap-1 text-xs text-ink-faint">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-mono text-ink-dim">{formatPrice(order.subtotal)}</span>
                      </div>
                      {!!order.discount && order.discount > 0 && (
                        <div className="flex justify-between text-accent-cyan">
                          <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                          <span className="font-mono">−{formatPrice(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="font-mono text-ink-dim">
                          {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span className="font-mono text-ink-dim">{formatPrice(order.tax)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
