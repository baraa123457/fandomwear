"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/context/recently-viewed-context";

export function ViewTracker({ productId }: { productId: string }) {
  const { track } = useRecentlyViewed();

  useEffect(() => {
    track(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return null;
}
