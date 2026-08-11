"use client";

import { useEffect } from "react";

/**
 * Locks page scroll while `active` is true. Needed for any hand-rolled
 * fixed-position overlay (mobile nav, cart drawer, search, filter drawer) —
 * without this, touch scrolling on mobile can bleed through to the page
 * behind the overlay instead of scrolling the overlay itself.
 *
 * Plain `overflow: hidden` on <body> is not reliable on iOS Safari — it
 * still allows rubber-band touch scrolling of the page behind a fixed
 * overlay. The robust cross-browser fix is to pin <body> itself with
 * `position: fixed` (removing it from the scrollable flow entirely) and
 * restore the exact scroll offset when unlocking.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const original = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = original.position;
      body.style.top = original.top;
      body.style.left = original.left;
      body.style.right = original.right;
      body.style.width = original.width;
      body.style.overflow = original.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
