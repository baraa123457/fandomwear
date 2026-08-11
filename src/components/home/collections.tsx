"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useCatalog } from "@/context/catalog-context";
import { resolveIcon } from "@/lib/icon-map";

export function Collections() {
  const { universes } = useCatalog();
  return (
    <section id="collections" className="border-b border-line bg-void py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent-cyan">
              Pick your universe
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Seven worlds. One drop.
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-ink-dim transition-colors hover:text-ink sm:flex"
          >
            View all products <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {universes.map((u, i) => {
            const Icon = resolveIcon(u.icon);
            const featured = i === 0;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: "easeOut" }}
                className={featured ? "col-span-2 row-span-2" : ""}
              >
                <Link
                  href={`/shop?universe=${u.id}`}
                  className="group relative flex h-full min-h-[168px] flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-5 transition-all duration-300 hover:border-transparent"
                  style={{ ["--glow" as string]: u.color }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle at 30% 20%, ${u.color}2e, transparent 60%)`,
                      boxShadow: `inset 0 0 0 1px ${u.color}66, 0 0 40px -10px ${u.color}55`,
                    }}
                    aria-hidden
                  />
                  <div className="relative flex items-start justify-between">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${u.color}22`, color: u.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-ink-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="relative">
                    <h3 className="font-display text-lg font-bold text-ink">{u.label}</h3>
                    <p className="mt-1 text-xs text-ink-faint">{u.tagline}</p>
                    <p className="mt-3 font-mono text-[11px] text-ink-faint">
                      {u.productCount} designs
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
