import { Product, Size, Universe } from "@/lib/types";
import { products as seedProducts } from "@/lib/data/products";

export type SortKey = "featured" | "new" | "best" | "price-asc" | "price-desc" | "rating";

export interface ShopFilters {
  universe?: Universe;
  categories: string[];
  sizes: Size[];
  colors: string[];
  priceMin?: number;
  priceMax?: number;
  inStockOnly: boolean;
  search: string;
  sort: SortKey;
  page: number;
}

export const PAGE_SIZE = 12;

// Kept as static fallbacks for anything that can't reach CatalogContext.
// Prefer deriveCategories/deriveColors/derivePriceBounds against the live
// `products` list from useCatalog() wherever a component has access to it.
export const allCategories = Array.from(new Set(seedProducts.map((p) => p.category)));
export const allColors = Array.from(
  new Set(seedProducts.flatMap((p) => p.colors.map((c) => c.name)))
);
export const allSizes: Size[] = ["S", "M", "L", "XL", "XXL"];
export const priceBounds = {
  min: Math.floor(Math.min(...seedProducts.map((p) => p.price))),
  max: Math.ceil(Math.max(...seedProducts.map((p) => p.price))),
};

export function deriveCategories(products: Product[]): string[] {
  return Array.from(new Set(products.map((p) => p.category)));
}

export function deriveColors(products: Product[]): string[] {
  return Array.from(new Set(products.flatMap((p) => p.colors.map((c) => c.name))));
}

export function derivePriceBounds(products: Product[]) {
  if (products.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.floor(Math.min(...products.map((p) => p.price))),
    max: Math.ceil(Math.max(...products.map((p) => p.price))),
  };
}

export function filterAndSortProducts(products: Product[], filters: ShopFilters): Product[] {
  let result = [...products];

  if (filters.universe) {
    result = result.filter((p) => p.universe === filters.universe);
  }
  if (filters.categories.length) {
    result = result.filter((p) => filters.categories.includes(p.category));
  }
  if (filters.sizes.length) {
    result = result.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)));
  }
  if (filters.colors.length) {
    result = result.filter((p) => p.colors.some((c) => filters.colors.includes(c.name)));
  }
  if (typeof filters.priceMin === "number") {
    result = result.filter((p) => p.price >= filters.priceMin!);
  }
  if (typeof filters.priceMax === "number") {
    result = result.filter((p) => p.price <= filters.priceMax!);
  }
  if (filters.inStockOnly) {
    result = result.filter((p) => p.stock > 0);
  }
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.universe.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  switch (filters.sort) {
    case "new":
      result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      break;
    case "best":
      result.sort(
        (a, b) => Number(b.tags.includes("bestseller")) - Number(a.tags.includes("bestseller"))
      );
      break;
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break; // "featured" = catalog order
  }

  return result;
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    page: safePage,
    totalItems: items.length,
  };
}
