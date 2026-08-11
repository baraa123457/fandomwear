"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, revealOnScroll } from "@/lib/motion";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="relative overflow-hidden border-b border-line bg-surface py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 50%, color-mix(in oklab, var(--color-accent-purple) 20%, transparent), transparent 55%), radial-gradient(circle at 85% 50%, color-mix(in oklab, var(--color-accent-cyan) 16%, transparent), transparent 55%)",
        }}
        aria-hidden
      />
      <motion.div
        variants={fadeInUp}
        {...revealOnScroll}
        className="relative mx-auto flex max-w-3xl flex-col items-center px-5 text-center sm:px-8"
      >
        <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Get first access to every drop.
        </h2>
        <p className="mt-3 max-w-md text-sm text-ink-dim">
          New universes, restocks, and 10% off your first order — straight to your inbox, no spam.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex items-center gap-2 rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-5 py-3 text-sm font-medium text-accent-cyan"
          >
            <Check className="h-4 w-4" /> You&apos;re on the list — check your inbox.
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-12 flex-1 rounded-full border border-line bg-void px-5 text-sm text-ink placeholder:text-ink-faint focus:border-accent-cyan focus:outline-none"
            />
            <Button type="submit" size="md" variant="accent" className="shrink-0">
              Subscribe <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
