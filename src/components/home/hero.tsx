"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeeArt } from "@/components/shared/tee-art";
import { useCatalog } from "@/context/catalog-context";

export function Hero() {
  const { products, getUniverse } = useCatalog();
  // Picked by universe rather than raw array index — index-based picks
  // broke once ordering came from a live DB query instead of a fixed seed array.
  const heroTees = ["anime", "gaming", "dc"]
    .map((universeId) => products.find((p) => p.universe === universeId))
    .filter((p): p is (typeof products)[number] => Boolean(p));
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Two-layer parallax: the background grid drifts slowly, the floating tees
  // drift faster, so the hero gains depth as the page scrolls past it.
  const bgY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 60]);
  const teesY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 140]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-b border-line noise-veil">
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 grid-veil pointer-events-none opacity-[0.35]"
        aria-hidden
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-2 lg:pb-28 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-medium text-ink-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-glow-pulse" />
            30+ original designs · 7 universes
          </span>

          <h1 className="mt-6 text-balance font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[4.2rem]">
            Wear your favorite
            <br />
            <span className="bg-gradient-to-r from-accent-purple via-accent-purple to-accent-cyan bg-clip-text text-transparent">
              universes.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-balance text-lg leading-relaxed text-ink-dim">
            Premium oversized T-shirts inspired by the games, movies, and legends
            you never grew out of. Original graphics, heavyweight cotton, cut to sit right.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" variant="accent">
              <Link href="/shop">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#collections">
                <Compass className="h-4 w-4" /> Explore Collections
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-8">
            {[
              ["30+", "Designs"],
              ["4.7", "Avg. rating"],
              ["7", "Universes"],
            ].map(([stat, label]) => (
              <div key={label}>
                <p className="font-display text-2xl font-bold text-ink">{stat}</p>
                <p className="text-xs text-ink-faint">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          style={{ y: teesY }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto h-[420px] w-full max-w-md sm:h-[520px]"
        >
          {heroTees.map((p, i) => {
            const universe = getUniverse(p.universe)!;
            const positions = [
              "left-2 top-6 h-64 w-52 rotate-[-9deg] z-10",
              "right-0 top-0 h-72 w-56 rotate-[7deg] z-20",
              "left-10 bottom-0 h-64 w-52 rotate-[4deg] z-30",
            ];
            return (
              <motion.div
                key={p.id}
                className={`absolute ${positions[i]}`}
                animate={prefersReducedMotion ? undefined : { y: [0, -14, 0] }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              >
                <TeeArt
                  color={universe.color}
                  icon={p.artIcon}
                  label={p.name}
                  variant="hero"
                  className="h-full w-full border border-line/80 shadow-2xl"
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
