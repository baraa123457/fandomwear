"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useCatalog } from "@/context/catalog-context";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export default function WishlistPage() {
  const { ids, isLoading } = useWishlist();
  const { user } = useAuth();
  const { addItem, open } = useCart();
  const { toast } = useToast();
  const { products } = useCatalog();
  const items = products.filter((p) => ids.has(p.id));

  const addAllToCart = () => {
    items.forEach((p) => {
      addItem(
        {
          productId: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          size: p.sizes[Math.floor(p.sizes.length / 2)],
          color: p.colors[0].name,
          universe: p.universe,
          artIcon: p.artIcon,
        },
        1
      );
    });
    open();
    toast({ variant: "success", title: `Added ${items.length} items to cart` });
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Wishlist</h1>
          <p className="mt-1.5 text-sm text-ink-faint">
            {items.length} saved {items.length === 1 ? "item" : "items"} — synced to your account
          </p>
        </div>
        {items.length > 0 && (
          <Button onClick={addAllToCart} variant="accent" size="md">
            <ShoppingBag className="h-4 w-4" /> Add all to cart
          </Button>
        )}
      </div>

      {!user ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line py-24 text-center">
          <Heart className="h-9 w-9 text-ink-faint" />
          <p className="mt-4 font-display text-lg font-bold text-ink">Sign in to see your wishlist</p>
          <p className="mt-1.5 max-w-xs text-sm text-ink-faint">
            Your saved items follow your account across devices.
          </p>
          <Button asChild variant="accent" size="sm" className="mt-5">
            <Link href="/account/login">Sign in</Link>
          </Button>
        </div>
      ) : isLoading ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line py-24 text-center">
          <p className="text-sm text-ink-faint">Loading your wishlist...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line py-24 text-center">
          <Heart className="h-9 w-9 text-ink-faint" />
          <p className="mt-4 font-display text-lg font-bold text-ink">Nothing saved yet</p>
          <p className="mt-1.5 max-w-xs text-sm text-ink-faint">
            Tap the heart on any design to save it here for later.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-5">
            <Link href="/shop">Browse the shop</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
