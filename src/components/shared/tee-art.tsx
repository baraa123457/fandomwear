"use client";

import { resolveIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

interface TeeArtProps {
  color: string;
  icon: string;
  label?: string;
  className?: string;
  variant?: "card" | "hero";
}

/**
 * Renders a stylized, original tee-mockup graphic (silhouette + emblem + print
 * texture) in a given universe's accent color. Used in place of photography
 * so every product/collection tile stays fully original artwork.
 */
export function TeeArt({ color, icon, label, className, variant = "card" }: TeeArtProps) {
  const Icon = resolveIcon(icon);
  const gradientId = `tee-grad-${color.replace("#", "")}`;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl bg-surface",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${color}33, transparent 65%)`,
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 grid-veil opacity-40" aria-hidden />
      <svg
        viewBox="0 0 200 220"
        className={cn(
          "relative h-[78%] w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]",
          variant === "hero" && "h-[85%]"
        )}
        role="img"
        aria-label={label ? `${label} tee mockup` : "Tee mockup"}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1c20" />
            <stop offset="100%" stopColor="#0c0c0e" />
          </linearGradient>
        </defs>
        {/* Oversized tee silhouette */}
        <path
          d="M60 18 L80 6 C90 16 110 16 120 6 L140 18 L168 40 L152 64 L138 54 L138 200 C138 208 132 214 124 214 L76 214 C68 214 62 208 62 200 L62 54 L48 64 L32 40 Z"
          fill={`url(#${gradientId})`}
          stroke={color}
          strokeOpacity={0.5}
          strokeWidth={1.5}
        />
        {/* Chest print block */}
        <rect
          x="76"
          y="70"
          width="48"
          height="48"
          rx="10"
          fill={color}
          fillOpacity={0.16}
          stroke={color}
          strokeOpacity={0.6}
        />
        <foreignObject x="86" y="80" width="28" height="28">
          <div className="flex h-full w-full items-center justify-center">
            <Icon width={22} height={22} color={color} strokeWidth={1.75} />
          </div>
        </foreignObject>
        {/* Crease lines for texture */}
        <path d="M70 130 L70 200" stroke="white" strokeOpacity={0.04} strokeWidth={6} />
        <path d="M130 130 L130 200" stroke="white" strokeOpacity={0.04} strokeWidth={6} />
      </svg>
      <div
        className="pointer-events-none absolute -bottom-6 h-16 w-16 rounded-full blur-2xl animate-glow-pulse"
        style={{ backgroundColor: color, opacity: 0.35 }}
        aria-hidden
      />
    </div>
  );
}
