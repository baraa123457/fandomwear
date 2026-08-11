"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Feather, Recycle, Ruler, Sparkles } from "lucide-react";
import { resolveIcon } from "@/lib/icon-map";
import { useCatalog } from "@/context/catalog-context";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer, revealOnScroll } from "@/lib/motion";

const stats = [
  { value: "40+", label: "original designs" },
  { value: "6", label: "fandom universes" },
  { value: "260gsm", label: "heavyweight cotton" },
  { value: "100%", label: "original artwork" },
];

const values = [
  {
    icon: Sparkles,
    title: "Original artwork, always",
    body: "Every graphic is designed in-house, inspired by the worlds we grew up loving — never a straight lift, never a bootleg print.",
  },
  {
    icon: Ruler,
    title: "Built for the oversized fit",
    body: "Boxy shoulders, dropped hems, heavyweight cotton. Cut specifically for the oversized silhouette, not resized from a regular tee.",
  },
  {
    icon: Recycle,
    title: "Made to last, not to trash",
    body: "Small-batch drops over mass overstock. Fewer, better tees that hold their shape and color wash after wash.",
  },
  {
    icon: Feather,
    title: "Comfort you can feel",
    body: "Garment-washed and pre-shrunk, so what you order is what still fits a year from now.",
  },
];

export default function AboutView() {
  const { universes } = useCatalog();
  return (
    <div>
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <Breadcrumbs items={[{ label: "About FandomWear" }]} />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line py-16 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(circle at 20% 20%, #7c5cff22, transparent 55%)" }}
          aria-hidden
        />
        <div className="grid-veil pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="relative mx-auto max-w-3xl px-5 sm:px-8"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-cyan">Our story</p>
          <h1 className="mt-4 text-balance font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Wear your favorite universes, not a knockoff of them.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-dim">
            FandomWear started with a simple frustration: fandom merch was either mass-produced,
            thin, and generic — or beautifully made but too on-the-nose to wear outside a
            convention. We build oversized tees that put the artwork first and the fit second to
            none, so you can wear the worlds you love as actual streetwear.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/shop">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/help/contact">Get in touch</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <Reveal className="border-b border-line bg-surface/40 py-12">
        <motion.div
          variants={staggerContainer}
          {...revealOnScroll}
          className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 sm:grid-cols-4 sm:px-8"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeInUp} className="text-center sm:text-left">
              <p className="font-display text-3xl font-bold text-ink sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-faint">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </Reveal>

      {/* Values */}
      <section className="border-b border-line py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <h2 className="max-w-lg text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              What we actually care about
            </h2>
          </Reveal>
          <motion.div
            variants={staggerContainer}
            {...revealOnScroll}
            className="mt-10 grid gap-6 sm:grid-cols-2"
          >
            {values.map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                variants={fadeInUp}
                className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-ink-faint"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Universes */}
      <section className="border-b border-line bg-surface/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <h2 className="max-w-lg text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              The universes we design for
            </h2>
            <p className="mt-3 max-w-md text-sm text-ink-dim">
              And we&apos;re always adding more — tell us what you want to see next.
            </p>
          </Reveal>
          <motion.div
            variants={staggerContainer}
            {...revealOnScroll}
            className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
          >
            {universes.map((u) => {
              const Icon = resolveIcon(u.icon);
              return (
                <motion.div key={u.id} variants={fadeInUp}>
                  <Link
                    href={`/shop?universe=${u.id}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-5 text-center transition-colors hover:border-ink-faint"
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${u.color}22`, color: u.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-ink">{u.label}</p>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <Reveal className="py-20 sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5 text-center sm:px-8">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Ready to find your fit?
          </h2>
          <p className="mt-3 max-w-md text-sm text-ink-dim">
            Browse the full collection, or reach out if you&apos;ve got a universe you want us to
            design for next.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/shop">
              Shop FandomWear <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
