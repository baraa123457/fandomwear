"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

// A floor so the intro always reads as intentional, even on an instant load,
// and a hard ceiling so it never blocks the site longer than necessary.
const MIN_DISPLAY_MS = 900;
const MAX_DISPLAY_MS = 1400;
const REDUCED_MOTION_MS = 300;

export function Preloader() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useBodyScrollLock(visible);

  useEffect(() => {
    const minDisplay = prefersReducedMotion ? REDUCED_MOTION_MS : MIN_DISPLAY_MS;
    const start = Date.now();
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setProgress(100);
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minDisplay - elapsed);
      window.setTimeout(() => setVisible(false), remaining);
    };

    // Prefer the real "page is ready" signal, but never wait past the cap —
    // the intro shouldn't hold the site hostage if something loads slowly.
    const capTimer = window.setTimeout(finish, prefersReducedMotion ? REDUCED_MOTION_MS : MAX_DISPLAY_MS);
    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
    }

    return () => {
      window.clearTimeout(capTimer);
      window.removeEventListener("load", finish);
    };
  }, [prefersReducedMotion]);

  // Cosmetic progress tick — purely time-based (no rAF loop, no layout
  // thrash), just a handful of setState calls over the minimum display
  // window so the counter feels alive without doing real work.
  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(100);
      return;
    }
    const stepMs = 45;
    const steps = Math.round(MIN_DISPLAY_MS / stepMs);
    let count = 0;
    const id = window.setInterval(() => {
      count += 1;
      setProgress((prev) => Math.max(prev, Math.min(99, Math.round((count / steps) * 100))));
      if (count >= steps) window.clearInterval(id);
    }, stepMs);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  return (
    <>
      {/* If JS never runs, don't leave visitors staring at a permanent overlay. */}
      <noscript>
        <style>{"#fw-preloader{display:none!important}"}</style>
      </noscript>

      <AnimatePresence>
        {visible && (
          <motion.div
            id="fw-preloader"
            role="status"
            aria-label="FandomWear is loading"
            initial={false}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 1.02 }
            }
            transition={{
              duration: prefersReducedMotion ? 0.15 : 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-void noise-veil"
          >
            <div className="absolute inset-0 grid-veil pointer-events-none opacity-[0.35]" aria-hidden />

            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex flex-col items-center px-6"
            >
              <span className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                FANDOM<span className="text-accent-purple">WEAR</span>
              </span>

              <div className="mt-8 h-[2px] w-32 overflow-hidden rounded-full bg-surface-2 sm:w-40">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan"
                  style={{ transformOrigin: "left" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress / 100 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0.15 }
                      : { duration: 0.15, ease: "easeOut" }
                  }
                />
              </div>

              <span
                aria-live="polite"
                className="mt-4 font-mono text-[11px] tracking-[0.2em] text-ink-faint"
              >
                {String(progress).padStart(2, "0")}%
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
