"use client";

import { motion } from "framer-motion";
import { fadeInUp, revealOnScroll } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Wrap any section content in this to have it fade + slide up once as it
 * scrolls into view. Keeps the animation config in one place instead of
 * repeating `initial`/`whileInView`/`viewport` on every section.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      {...revealOnScroll}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
