"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductVisual } from "@/components/shared/product-visual";
import { cn } from "@/lib/utils";

export function ProductGallery({ product, color }: { product: Product; color: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [spinning, setSpinning] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // Simulated multi-angle gallery: front print, back print, detail close-up.
  const angles = ["Front", "Back", "Detail"];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div>
      <div
        ref={frameRef}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
        className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl border border-line bg-surface"
      >
        <motion.div
          animate={spinning ? { rotateY: 360 } : { rotateY: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          <ProductVisual
            image={product.image}
            color={color}
            icon={product.artIcon}
            label={`${product.name} — ${angles[active]}`}
            variant="hero"
            className={cn(
              "h-full w-full transition-transform duration-300 ease-out",
              zoom && "scale-[1.6]"
            )}
          />
        </motion.div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ transformOrigin: origin }}
        />

        <button
          onClick={() => setSpinning(true)}
          onAnimationEnd={() => setSpinning(false)}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-void/70 px-3.5 py-2 text-xs font-medium text-ink backdrop-blur transition-colors hover:bg-void/90"
        >
          <RotateCw className={cn("h-3.5 w-3.5", spinning && "animate-spin")} />
          360° preview
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {angles.map((angle, i) => (
          <button
            key={angle}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-xl border transition-colors",
              active === i ? "border-accent-cyan" : "border-line hover:border-ink-faint"
            )}
          >
            <ProductVisual image={product.image} color={color} icon={product.artIcon} label={angle} className="h-full w-full" />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-void/70 px-2 py-0.5 text-[10px] font-medium text-ink backdrop-blur">
              {angle}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
