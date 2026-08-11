"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { mapProductRow, mapUniverseRow, PRODUCT_SELECT, slugifyLabel, ProductRowWithCategory } from "@/lib/data/product-mapper";
import { resolveUniverse } from "@/lib/data/universes";
import { products as staticSeedProducts } from "@/lib/data/products";
import { universes as staticSeedUniverses } from "@/lib/data/universes";
import { Product, Size, UniverseInfo } from "@/lib/types";

export interface NewProductInput {
  name: string;
  category: string; // display label — resolved to/created in categories table
  universe: string; // universe id, must already exist
  price: number;
  stock: number;
  artIcon: string;
  image?: string;
  sizes?: Size[];
}

interface CatalogContextValue {
  products: Product[];
  universes: UniverseInfo[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addProduct: (input: NewProductInput) => Promise<{ error: string | null }>;
  updateProduct: (id: string, patch: Partial<NewProductInput>) => Promise<{ error: string | null }>;
  deleteProduct: (id: string) => Promise<{ error: string | null }>;
  addUniverse: (universe: UniverseInfo) => Promise<{ error: string | null }>;
  removeUniverse: (id: string) => Promise<{ error: string | null }>;
  addCategory: (label: string) => Promise<{ error: string | null }>;
  removeCategory: (label: string) => Promise<{ error: string | null }>;
  importProducts: (products: Product[]) => Promise<{ errors: string[] }>;
  resetToSeed: () => Promise<{ error: string | null }>;
  uploadProductImage: (file: File) => Promise<{ url: string | null; error: string | null }>;
  getUniverse: (id: string) => UniverseInfo;
  getProductBySlug: (slug: string) => Product | undefined;
  getNewArrivals: (limit?: number) => Product[];
  getBestSellers: (limit?: number) => Product[];
  getFeatured: (limit?: number) => Product[];
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [universes, setUniverses] = useState<UniverseInfo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    setError(null);
    const [productsRes, universesRes, categoriesRes] = await Promise.all([
      supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false }),
      supabase.from("universes").select("*").order("label"),
      supabase.from("categories").select("label").order("label"),
    ]);

    if (productsRes.error || universesRes.error || categoriesRes.error) {
      setError(
        productsRes.error?.message ??
          universesRes.error?.message ??
          categoriesRes.error?.message ??
          "Failed to load catalog"
      );
      return;
    }

    setProducts((productsRes.data as ProductRowWithCategory[]).map(mapProductRow));
    setUniverses(universesRes.data.map(mapUniverseRow));
    setCategories(categoriesRes.data.map((c) => c.label));
  }, [supabase]);

  useEffect(() => {
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addProduct = useCallback(
    async (input: NewProductInput) => {
      const categoryId = slugifyLabel(input.category);
      // Category may be brand new (typed into the admin form) — ensure it exists.
      const { error: categoryError } = await supabase
        .from("categories")
        .upsert({ id: categoryId, label: input.category }, { onConflict: "id" });
      if (categoryError) return { error: categoryError.message };

      const slug = slugifyLabel(input.name);
      const { error } = await supabase.from("products").insert({
        name: input.name,
        slug,
        category_id: categoryId,
        universe_id: input.universe,
        price: input.price,
        stock: input.stock,
        art_icon: input.artIcon,
        image_url: input.image ?? null,
        description: `${input.name} — an original fan-inspired graphic tee.`,
        material: "100% heavyweight cotton",
        sizes: input.sizes ?? ["S", "M", "L", "XL", "XXL"],
        colors: [{ name: "Void Black", hex: "#0a0a0a" }],
      });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [supabase, refresh]
  );

  const updateProduct = useCallback(
    async (id: string, patch: Partial<NewProductInput>) => {
      const update: Record<string, unknown> = {};
      if (patch.name !== undefined) {
        update.name = patch.name;
        update.slug = slugifyLabel(patch.name);
      }
      if (patch.price !== undefined) update.price = patch.price;
      if (patch.stock !== undefined) update.stock = patch.stock;
      if (patch.sizes !== undefined) update.sizes = patch.sizes;
      if (patch.artIcon !== undefined) update.art_icon = patch.artIcon;
      if (patch.image !== undefined) update.image_url = patch.image ?? null;
      if (patch.universe !== undefined) update.universe_id = patch.universe;
      if (patch.category !== undefined) {
        const categoryId = slugifyLabel(patch.category);
        const { error: categoryError } = await supabase
          .from("categories")
          .upsert({ id: categoryId, label: patch.category }, { onConflict: "id" });
        if (categoryError) return { error: categoryError.message };
        update.category_id = categoryId;
      }

      const { error } = await supabase.from("products").update(update).eq("id", id);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [supabase, refresh]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [supabase, refresh]
  );

  const addUniverse = useCallback(
    async (universe: UniverseInfo) => {
      const { error } = await supabase.from("universes").insert({
        id: universe.id,
        label: universe.label,
        tagline: universe.tagline,
        color: universe.color,
        icon: universe.icon,
      });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [supabase, refresh]
  );

  const removeUniverse = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("universes").delete().eq("id", id);
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [supabase, refresh]
  );

  const addCategory = useCallback(
    async (label: string) => {
      const { error } = await supabase
        .from("categories")
        .insert({ id: slugifyLabel(label), label });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [supabase, refresh]
  );

  const removeCategory = useCallback(
    async (label: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", slugifyLabel(label));
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [supabase, refresh]
  );

  const importProducts = useCallback(
    async (imported: Product[]) => {
      const errors: string[] = [];
      const knownUniverses = new Set(universes.map((u) => u.id));

      for (const p of imported) {
        if (!knownUniverses.has(p.universe)) {
          errors.push(`Skipped "${p.name}": universe "${p.universe}" doesn't exist — add it first.`);
          continue;
        }
        const categoryId = slugifyLabel(p.category);
        const { error: categoryError } = await supabase
          .from("categories")
          .upsert({ id: categoryId, label: p.category }, { onConflict: "id" });
        if (categoryError) {
          errors.push(`Skipped "${p.name}": ${categoryError.message}`);
          continue;
        }

        const { error: productError } = await supabase.from("products").upsert(
          {
            slug: p.slug || slugifyLabel(p.name),
            name: p.name,
            universe_id: p.universe,
            category_id: categoryId,
            price: p.price,
            compare_at_price: p.compareAtPrice ?? null,
            stock: p.stock,
            rating: p.rating,
            review_count: p.reviewCount,
            material: p.material,
            sizes: p.sizes,
            colors: p.colors,
            tags: p.tags,
            art_icon: p.artIcon,
            description: p.description,
            // Deliberately NOT touching image_url here — CSV never carries real
            // photo data (see productsToCSV), so importing must never blow away
            // a product's existing uploaded photo.
          },
          { onConflict: "slug" }
        );
        if (productError) errors.push(`Skipped "${p.name}": ${productError.message}`);
      }

      await refresh();
      return { errors };
    },
    [supabase, refresh, universes]
  );

  const resetToSeed = useCallback(async () => {
    // Destructive — wipes the current catalog and restores the original
    // seed data. Reviews/wishlist entries pointing at deleted products are
    // cascade-deleted by the DB; past orders keep their product snapshot
    // (order_items.product_id is ON DELETE SET NULL) so order history
    // survives intact.
    const deleteProducts = await supabase.from("products").delete().not("id", "is", null);
    if (deleteProducts.error) return { error: deleteProducts.error.message };
    const deleteCategories = await supabase.from("categories").delete().not("id", "is", null);
    if (deleteCategories.error) return { error: deleteCategories.error.message };
    const deleteUniverses = await supabase.from("universes").delete().not("id", "is", null);
    if (deleteUniverses.error) return { error: deleteUniverses.error.message };

    const { error: universesError } = await supabase.from("universes").insert(
      staticSeedUniverses.map((u) => ({
        id: u.id,
        label: u.label,
        tagline: u.tagline,
        color: u.color,
        icon: u.icon,
      }))
    );
    if (universesError) return { error: universesError.message };

    const categoryLabels = Array.from(new Set(staticSeedProducts.map((p) => p.category)));
    const { error: categoriesError } = await supabase
      .from("categories")
      .insert(categoryLabels.map((label) => ({ id: slugifyLabel(label), label })));
    if (categoriesError) return { error: categoriesError.message };

    const { error: productsError } = await supabase.from("products").insert(
      staticSeedProducts.map((p) => ({
        slug: p.slug,
        name: p.name,
        description: p.description,
        material: p.material,
        universe_id: p.universe,
        category_id: slugifyLabel(p.category),
        price: p.price,
        compare_at_price: p.compareAtPrice ?? null,
        sizes: p.sizes,
        colors: p.colors,
        stock: p.stock,
        rating: p.rating,
        review_count: p.reviewCount,
        tags: p.tags,
        art_icon: p.artIcon,
        image_url: p.image ?? null,
        created_at: p.createdAt,
      }))
    );
    if (productsError) return { error: productsError.message };

    await refresh();
    return { error: null };
  }, [supabase, refresh]);

  const uploadProductImage = useCallback(
    async (file: File) => {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) return { url: null, error: error.message };
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      return { url: data.publicUrl, error: null };
    },
    [supabase]
  );

  const getUniverse = useCallback((id: string) => resolveUniverse(universes, id), [universes]);

  const getProductBySlug = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [products]
  );

  const getNewArrivals = useCallback(
    (limit = 8) =>
      [...products].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, limit),
    [products]
  );

  const getBestSellers = useCallback(
    (limit = 8) => products.filter((p) => p.tags.includes("bestseller")).slice(0, limit),
    [products]
  );

  const getFeatured = useCallback(
    (limit = 8) => [...products].sort((a, b) => b.rating - a.rating).slice(0, limit),
    [products]
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      universes,
      categories,
      isLoading,
      error,
      refresh,
      addProduct,
      updateProduct,
      deleteProduct,
      addUniverse,
      removeUniverse,
      addCategory,
      removeCategory,
      importProducts,
      resetToSeed,
      uploadProductImage,
      getUniverse,
      getProductBySlug,
      getNewArrivals,
      getBestSellers,
      getFeatured,
    }),
    [
      products,
      universes,
      categories,
      isLoading,
      error,
      refresh,
      addProduct,
      updateProduct,
      deleteProduct,
      addUniverse,
      removeUniverse,
      addCategory,
      removeCategory,
      importProducts,
      resetToSeed,
      uploadProductImage,
      getUniverse,
      getProductBySlug,
      getNewArrivals,
      getBestSellers,
      getFeatured,
    ]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
