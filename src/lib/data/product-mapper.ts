import { Product, Size, UniverseInfo } from "@/lib/types";
import { Database } from "@/lib/supabase/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type UniverseRow = Database["public"]["Tables"]["universes"]["Row"];

/** products.category_id joined with categories.label in the select(). */
export type ProductRowWithCategory = ProductRow & { categories: { label: string } | null };

export function mapProductRow(row: ProductRowWithCategory): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    universe: row.universe_id,
    category: row.categories?.label ?? row.category_id,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    description: row.description,
    material: row.material,
    sizes: row.sizes as Size[],
    colors: row.colors as { name: string; hex: string }[],
    rating: Number(row.rating),
    reviewCount: row.review_count,
    stock: row.stock,
    tags: row.tags as Product["tags"],
    artIcon: row.art_icon,
    image: row.image_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapUniverseRow(row: UniverseRow): UniverseInfo {
  return {
    id: row.id,
    label: row.label,
    tagline: row.tagline,
    color: row.color,
    icon: row.icon,
    productCount: 0, // computed client-side where needed; not worth a join for a display-only count
  };
}

export const PRODUCT_SELECT = "*, categories(label)";

export function slugifyLabel(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
