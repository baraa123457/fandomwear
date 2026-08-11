import Image from "next/image";
import { TeeArt } from "@/components/shared/tee-art";
import { cn } from "@/lib/utils";

interface ProductVisualProps {
  image?: string;
  color: string;
  icon: string;
  label?: string;
  className?: string;
  variant?: "card" | "hero";
}

/**
 * Product artwork is normally generated (TeeArt), but admins can upload a
 * real photo per product. This picks whichever the product actually has,
 * so ProductCard/gallery/admin views never need to branch on it themselves.
 */
export function ProductVisual({ image, color, icon, label, className, variant = "card" }: ProductVisualProps) {
  if (image) {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl bg-surface", className)}>
        <Image
          src={image}
          alt={label ?? "Product photo"}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    );
  }
  return <TeeArt color={color} icon={icon} label={label} className={className} variant={variant} />;
}
