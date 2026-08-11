"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { useCatalog } from "@/context/catalog-context";
import { TeeArt } from "@/components/shared/tee-art";
import { formatPrice } from "@/lib/utils";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { products, getUniverse } = useCatalog();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (open) {
      setQuery("");
      // Focus after the enter animation starts so mobile keyboards behave.
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.universe.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, products]);

  const goToFullResults = () => {
    if (!query.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-void/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            role="dialog"
            aria-label="Search products"
            className="fixed left-1/2 top-20 z-[95] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goToFullResults();
              }}
              className="flex items-center gap-3 border-b border-line px-5 py-4"
            >
              <Search className="h-4.5 w-4.5 shrink-0 text-ink-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search designs, universes, categories..."
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </form>

            {query.trim() && (
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
                {results.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-ink-faint">
                    No designs match &ldquo;{query}&rdquo;.
                  </p>
                ) : (
                  <>
                    <ul className="flex flex-col gap-1">
                      {results.map((p) => {
                        const universe = getUniverse(p.universe)!;
                        return (
                          <li key={p.id}>
                            <Link
                              href={`/product/${p.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-ink/5"
                            >
                              <TeeArt
                                color={universe.color}
                                icon={p.artIcon}
                                label={p.name}
                                className="h-12 w-10 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                                <p className="text-xs text-ink-faint">{universe.label}</p>
                              </div>
                              <span className="font-mono text-xs text-ink-dim">
                                {formatPrice(p.price)}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      onClick={goToFullResults}
                      className="mt-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-accent-cyan transition-colors hover:bg-ink/5"
                    >
                      See all results for &ldquo;{query}&rdquo;
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
