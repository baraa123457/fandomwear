"use client";

import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { allSizes, deriveCategories, deriveColors, derivePriceBounds, ShopFilters } from "@/lib/shop-utils";
import { useCatalog } from "@/context/catalog-context";
import { formatPrice, cn } from "@/lib/utils";

interface FilterPanelProps {
  filters: ShopFilters;
  onChange: (patch: Partial<ShopFilters>) => void;
  onReset: () => void;
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FilterPanel({ filters, onChange, onReset }: FilterPanelProps) {
  const { products, universes } = useCatalog();
  const allCategories = useMemo(() => deriveCategories(products), [products]);
  const allColors = useMemo(() => deriveColors(products), [products]);
  const priceBounds = useMemo(() => derivePriceBounds(products), [products]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
          Filters
        </h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-ink-faint hover:text-ink"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Universe */}
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
          Universe
        </legend>
        <div className="mt-3 flex flex-col gap-2">
          <button
            onClick={() => onChange({ universe: undefined })}
            className={cn(
              "flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm",
              !filters.universe ? "text-ink font-medium" : "text-ink-faint hover:text-ink"
            )}
          >
            All universes
          </button>
          {universes.map((u) => (
            <button
              key={u.id}
              onClick={() => onChange({ universe: filters.universe === u.id ? undefined : u.id })}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm",
                filters.universe === u.id ? "text-ink font-medium" : "text-ink-faint hover:text-ink"
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: u.color }} />
              {u.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Category */}
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
          Category
        </legend>
        <div className="mt-3 flex flex-col gap-2.5">
          {allCategories.map((cat) => (
            <label key={cat} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-dim">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => onChange({ categories: toggleValue(filters.categories, cat) })}
                className="h-4 w-4 rounded border-line bg-surface accent-accent-purple"
              />
              {cat}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Price */}
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
          Price
        </legend>
        <div className="mt-3">
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={filters.priceMax ?? priceBounds.max}
            onChange={(e) => onChange({ priceMax: Number(e.target.value) })}
            className="w-full accent-accent-purple"
            aria-label="Maximum price"
          />
          <div className="mt-1 flex justify-between font-mono text-xs text-ink-faint">
            <span>{formatPrice(priceBounds.min)}</span>
            <span>{formatPrice(filters.priceMax ?? priceBounds.max)}</span>
          </div>
        </div>
      </fieldset>

      {/* Size */}
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
          Size
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {allSizes.map((size) => (
            <button
              key={size}
              onClick={() => onChange({ sizes: toggleValue(filters.sizes, size) })}
              className={cn(
                "h-9 w-11 rounded-lg border text-xs font-semibold transition-colors",
                filters.sizes.includes(size)
                  ? "border-ink bg-ink text-void"
                  : "border-line text-ink-dim hover:border-ink hover:text-ink"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Color */}
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
          Color
        </legend>
        <div className="mt-3 flex flex-col gap-2.5">
          {allColors.map((color) => (
            <label key={color} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-dim">
              <input
                type="checkbox"
                checked={filters.colors.includes(color)}
                onChange={() => onChange({ colors: toggleValue(filters.colors, color) })}
                className="h-4 w-4 rounded border-line bg-surface accent-accent-purple"
              />
              {color}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Availability */}
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wider text-ink-dim">
          Availability
        </legend>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-ink-dim">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ inStockOnly: e.target.checked })}
            className="h-4 w-4 rounded border-line bg-surface accent-accent-purple"
          />
          In stock only
        </label>
      </fieldset>
    </div>
  );
}
