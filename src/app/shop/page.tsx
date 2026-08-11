import type { Metadata } from "next";
import ShopView from "./shop-view";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse all FandomWear oversized tees — filter by universe, category, price, size, and color.",
  openGraph: {
    title: "Shop All Products · FandomWear",
    description: "Browse all FandomWear oversized tees across 7 fandom universes.",
  },
};

export default function ShopPage() {
  return <ShopView />;
}
