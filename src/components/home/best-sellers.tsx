"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCatalog } from "@/context/catalog-context";
import { ProductCard } from "@/components/shared/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons";
import { Reveal } from "@/components/shared/reveal";

export function BestSellers() {
  const { getBestSellers, isLoading, products } = useCatalog();
  const items = getBestSellers(8);
  if (!isLoading && products.length > 0 && items.length === 0) return null;
  return (
    <section className="border-b border-line bg-void py-20 sm:py-28">
      <Reveal className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent-red">
              Proven favorites
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Best sellers
            </h2>
          </div>
          <Link
            href="/shop?sort=best"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-ink-dim transition-colors hover:text-ink sm:flex"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading ? <ProductGridSkeleton count={4} /> : items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Reveal>
    </section>
  );
}
