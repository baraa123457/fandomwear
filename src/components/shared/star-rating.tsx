import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = "sm",
  showValue = false,
  reviewCount,
}: {
  rating: number;
  size?: "sm" | "md";
  showValue?: boolean;
  reviewCount?: number;
}) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating);
          return (
            <Star
              key={i}
              className={cn(dim, filled ? "fill-accent-cyan text-accent-cyan" : "text-line")}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs text-ink-faint">
          {rating.toFixed(1)}
          {typeof reviewCount === "number" && ` · ${reviewCount} reviews`}
        </span>
      )}
    </div>
  );
}
