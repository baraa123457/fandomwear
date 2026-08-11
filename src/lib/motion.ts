import { Variants, Transition } from "framer-motion";

/** Premium, fast easing used across the site — avoid default bounce/spring feel. */
export const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1];

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Wrap a section in this to have children with `fadeInUp` cascade in on scroll. */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

/** Standard "scroll into view once" viewport config for section reveals. */
export const revealOnScroll = {
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, amount: 0.2 },
} as const;

/** Subtle press feedback for interactive elements — never a big/bouncy movement. */
export const tapScale = { scale: 0.96 };
export const tapTransition: Transition = { duration: 0.15, ease: EASE_OUT };

/** Small pop used for toggle-style controls like wishlist hearts. */
export const togglePop: Variants = {
  initial: { scale: 1 },
  active: { scale: [1, 1.25, 1], transition: { duration: 0.32, ease: EASE_OUT } },
};
