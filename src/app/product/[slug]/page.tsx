import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow, PRODUCT_SELECT, ProductRowWithCategory } from "@/lib/data/product-mapper";
import { ProductPageContent } from "@/components/product/product-page-content";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Products change in the database at any time (admin edits price/stock,
// new products get added) — this route is fully dynamic rather than
// statically generated, so it always reflects the current DB state
// instead of whatever was true at the last build.
export const dynamic = "force-dynamic";

async function fetchProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).single();
  return data ? mapProductRow(data as ProductRowWithCategory) : null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} · FandomWear`,
      description: product.description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} · FandomWear`,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) notFound();

  return <ProductPageContent product={product} />;
}
