"use client";

import { useRecentlyViewed } from "@/context/recently-viewed-context";
import { useCatalog } from "@/context/catalog-context";
import { ProductCard } from "@/components/shared/product-card";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { ids } = useRecentlyViewed();
  const { products } = useCatalog();
  const items = ids
    .filter((id) => id !== excludeId)
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl border-t border-line px-5 py-16 sm:px-8">
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Recently viewed</h2>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
