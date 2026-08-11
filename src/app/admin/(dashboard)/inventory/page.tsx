"use client";

import { useMemo } from "react";
import { Minus, Plus } from "lucide-react";
import { getInventory } from "@/lib/data/admin";
import { useCatalog } from "@/context/catalog-context";
import { useToast } from "@/context/toast-context";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatPrice, cn } from "@/lib/utils";

export default function AdminInventoryPage() {
  const { products, updateProduct, getUniverse, isLoading } = useCatalog();
  const { toast } = useToast();
  const items = useMemo(() => getInventory(products), [products]);

  const adjust = async (id: string, delta: number) => {
    const current = products.find((p) => p.id === id);
    if (!current) return;
    const { error } = await updateProduct(id, { stock: Math.max(0, current.stock + delta) });
    if (error) toast({ variant: "error", title: "Couldn't update stock", description: error });
  };

  const lowStockCount = items.filter((i) => i.status !== "healthy").length;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Inventory</h1>
      <p className="mt-1 text-sm text-ink-faint">
        {items.length} SKUs · {lowStockCount} need attention
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface text-xs uppercase tracking-wider text-ink-faint">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Universe</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-faint">
                  Loading inventory...
                </td>
              </tr>
            ) : (
              items.map((item) => {
              const universe = getUniverse(item.universe);
              return (
                <tr key={item.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-ink-faint">{item.category}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-ink-dim">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: universe.color }} />
                      {universe.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink">{formatPrice(item.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => adjust(item.id, -5)}
                        aria-label={`Decrease stock for ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-dim hover:text-ink"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className={cn("w-8 text-center font-mono", item.status !== "healthy" && "text-amber-400")}>
                        {item.stock}
                      </span>
                      <button
                        onClick={() => adjust(item.id, 5)}
                        aria-label={`Increase stock for ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-dim hover:text-ink"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
