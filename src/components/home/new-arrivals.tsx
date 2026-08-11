"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCatalog } from "@/context/catalog-context";
import { ProductCard } from "@/components/shared/product-card";
import { Skeleton } from "@/components/shared/skeletons";
import { Reveal } from "@/components/shared/reveal";
import { ScrollRow } from "@/components/shared/scroll-row";

export function NewArrivals() {
  const { getNewArrivals, isLoading, products } = useCatalog();
  const items = getNewArrivals(8);
  if (!isLoading && products.length > 0 && items.length === 0) return null;
  return (
    <section className="border-b border-line bg-surface/40 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent-cyan">
              Just dropped
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              New arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=new"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-ink-dim transition-colors hover:text-ink sm:flex"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10">
          <ScrollRow>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[220px] shrink-0 snap-start sm:w-[240px]">
                    <Skeleton className="aspect-[4/5] w-full" />
                  </div>
                ))
              : items.map((p) => (
                  <div key={p.id} className="w-[220px] shrink-0 snap-start sm:w-[240px]">
                    <ProductCard product={p} />
                  </div>
                ))}
          </ScrollRow>
        </div>
      </Reveal>
    </section>
  );
}
