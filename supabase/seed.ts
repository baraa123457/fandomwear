/**
 * Seeds a fresh Supabase project with the app's existing static data, so
 * the storefront isn't empty after migration. Idempotent — safe to run
 * more than once (uses upsert on stable keys, never duplicates rows).
 *
 * Usage:
 *   1. Fill in .env.local with NEXT_PUBLIC_SUPABASE_URL and
 *      SUPABASE_SERVICE_ROLE_KEY (Project Settings → API in the dashboard).
 *   2. Run the SQL migrations first (supabase/migrations/*.sql), via the
 *      Supabase SQL editor or `supabase db push` — see SUPABASE_SETUP.md.
 *   3. npm run db:seed
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { products as seedProducts } from "../src/lib/data/products";
import { universes as seedUniverses } from "../src/lib/data/universes";
import { discountCodes as seedCoupons } from "../src/lib/data/admin";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.\n" +
      "Add them to .env.local (see .env.example), then re-run `npm run db:seed`."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  console.log(`Seeding ${seedUniverses.length} universes...`);
  const { error: universesError } = await supabase.from("universes").upsert(
    seedUniverses.map((u) => ({
      id: u.id,
      label: u.label,
      tagline: u.tagline,
      color: u.color,
      icon: u.icon,
    })),
    { onConflict: "id" }
  );
  if (universesError) throw universesError;

  const categoryLabels = Array.from(new Set(seedProducts.map((p) => p.category)));
  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  console.log(`Seeding ${categoryLabels.length} categories...`);
  const { error: categoriesError } = await supabase.from("categories").upsert(
    categoryLabels.map((label) => ({ id: slugify(label), label })),
    { onConflict: "id" }
  );
  if (categoriesError) throw categoriesError;

  console.log(`Seeding ${seedProducts.length} products...`);
  const { error: productsError } = await supabase.from("products").upsert(
    seedProducts.map((p) => ({
      // Deterministic UUID-free stable key: use slug as the natural key for
      // upsert-on-conflict, letting Postgres generate the real uuid id on
      // first insert.
      slug: p.slug,
      name: p.name,
      description: p.description,
      material: p.material,
      universe_id: p.universe,
      category_id: slugify(p.category),
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
      featured: p.tags.includes("bestseller"),
      created_at: p.createdAt,
    })),
    { onConflict: "slug" }
  );
  if (productsError) throw productsError;

  console.log(`Seeding ${seedCoupons.length} coupons...`);
  const { error: couponsError } = await supabase.from("coupons").upsert(
    seedCoupons.map((c) => ({
      code: c.code,
      discount_type: c.type,
      discount_value: c.value,
      active: c.active,
      usage_limit: c.maxUses,
      uses: c.uses,
      expires_at: c.expires,
    })),
    { onConflict: "code" }
  );
  if (couponsError) throw couponsError;

  console.log("\nSeed complete.");
  console.log(
    "Reviews and customers are NOT seeded from static data — reviews come from real users " +
      "going forward, and customers come from real signups (Supabase Auth)."
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
