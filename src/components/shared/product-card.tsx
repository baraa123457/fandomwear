"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Plus, Star } from "lucide-react";
import { Product, Size } from "@/lib/types";
import { ProductVisual } from "@/components/shared/product-visual";
import { useCatalog } from "@/context/catalog-context";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useToast } from "@/context/toast-context";
import { formatPrice, cn } from "@/lib/utils";
import { tapScale, tapTransition, togglePop } from "@/lib/motion";

const badgeStyles: Record<string, string> = {
  new: "bg-accent-cyan/15 text-accent-cyan",
  bestseller: "bg-accent-purple/15 text-accent-purple",
  sale: "bg-accent-red/15 text-accent-red",
  limited: "bg-potter/15 text-potter",
};

export function ProductCard({ product }: { product: Product }) {
  const { getUniverse } = useCatalog();
  const universe = getUniverse(product.universe)!;
  const { addItem, open } = useCart();
  const { toggle, has } = useWishlist();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const isWishlisted = has(product.id);

  const handleAdd = () => {
    const size = selectedSize ?? product.sizes[Math.floor(product.sizes.length / 2)];
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        size,
        color: product.colors[0].name,
        universe: product.universe,
        artIcon: product.artIcon,
      },
      1
    );
    open();
    toast({ variant: "success", title: "Added to cart", description: `${product.name} · ${size}` });
  };

  const handleWishlistToggle = () => {
    toggle(product.id);
    toast({
      variant: "success",
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: product.name,
    });
  };

  return (
    <div className="group relative flex flex-col transition-transform duration-300 ease-out will-change-transform hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-2xl shadow-none transition-shadow duration-300 group-hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)]">
        <Link href={`/product/${product.slug}`} className="block overflow-hidden">
          <ProductVisual
            image={product.image}
            color={universe.color}
            icon={product.artIcon}
            label={product.name}
            className="aspect-[4/5] w-full transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur",
                badgeStyles[tag]
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        <motion.button
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          whileTap={tapScale}
          transition={tapTransition}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-void/60 text-ink backdrop-blur transition-colors hover:bg-void/80"
        >
          <motion.span
            key={isWishlisted ? "on" : "off"}
            variants={togglePop}
            initial="initial"
            animate="active"
            className="flex"
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-accent-red text-accent-red")} />
          </motion.span>
        </motion.button>

        <motion.div
          initial={false}
          className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-0 items-center gap-1.5 opacity-100 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        >
          <div className="pointer-events-auto flex flex-1 gap-1 rounded-full bg-void/70 p-1 backdrop-blur">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-[11px] font-semibold transition-colors",
                  selectedSize === size
                    ? "bg-ink text-void"
                    : "text-ink-dim hover:bg-ink/10 hover:text-ink"
                )}
              >
                {size}
              </button>
            ))}
          </div>
          <motion.button
            onClick={handleAdd}
            aria-label={`Quick add ${product.name} to cart`}
            whileHover={{ scale: 1.08 }}
            whileTap={tapScale}
            transition={tapTransition}
            className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-purple text-white shadow-lg"
          >
            <Plus className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </div>

      <Link href={`/product/${product.slug}`} className="mt-3.5 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: universe.color }}>
          {universe.label}
        </p>
        <h3 className="mt-1 text-sm font-medium text-ink transition-colors group-hover:underline underline-offset-4">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5">
          <Star className="h-3 w-3 fill-accent-cyan text-accent-cyan" />
          <span className="text-xs text-ink-faint">
            {product.rating.toFixed(1)} · {product.reviewCount}
          </span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold text-ink">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="font-mono text-xs text-ink-faint line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
