"use client";

import { Product } from "@/lib/types";
import { useCatalog } from "@/context/catalog-context";
import { ProductCard } from "@/components/shared/product-card";

export function RelatedProducts({ current }: { current: Product }) {
  const { products, getUniverse } = useCatalog();
  const related = products
    .filter((p) => p.universe === current.universe && p.id !== current.id)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
        More from {getUniverse(current.universe)?.label}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
