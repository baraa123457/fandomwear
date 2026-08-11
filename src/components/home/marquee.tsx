"use client";

import { useCatalog } from "@/context/catalog-context";

export function UniverseMarquee() {
  const { universes } = useCatalog();
  const items = [...universes, ...universes];
  return (
    <div className="overflow-hidden border-b border-line bg-surface py-4">
      <div className="flex w-max animate-marquee gap-10">
        {[0, 1].map((set) => (
          <div key={set} className="flex shrink-0 items-center gap-10" aria-hidden={set === 1}>
            {items.map((u, i) => (
              <span
                key={`${set}-${u.id}-${i}`}
                className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-ink-faint"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: u.color }} />
                {u.label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
