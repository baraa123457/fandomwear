"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";

interface WishlistContextValue {
  ids: Set<string>;
  isLoading: boolean;
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

/**
 * Tied to the signed-in account (wishlist_items table, RLS-scoped to
 * auth.uid()) rather than the browser — it follows you across devices
 * instead of resetting whenever localStorage would've been cleared.
 */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    supabase
      .from("wishlist_items")
      .select("product_id")
      .then(({ data }) => {
        setIds(new Set((data ?? []).map((r) => r.product_id)));
        setIsLoading(false);
      });
  }, [user, supabase]);

  const toggle = useCallback(
    (productId: string) => {
      if (!user) {
        toast({ variant: "info", title: "Sign in to save items", description: "Create an account to keep a wishlist." });
        return;
      }

      const alreadySaved = ids.has(productId);
      // Optimistic update — reverted if the write fails.
      setIds((prev) => {
        const next = new Set(prev);
        if (alreadySaved) next.delete(productId);
        else next.add(productId);
        return next;
      });

      const revert = () =>
        setIds((prev) => {
          const next = new Set(prev);
          if (alreadySaved) next.add(productId);
          else next.delete(productId);
          return next;
        });

      if (alreadySaved) {
        supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .then(({ error }) => {
            if (error) {
              revert();
              toast({ variant: "error", title: "Couldn't update wishlist", description: error.message });
            }
          });
      } else {
        supabase
          .from("wishlist_items")
          .insert({ user_id: user.id, product_id: productId })
          .then(({ error }) => {
            if (error) {
              revert();
              toast({ variant: "error", title: "Couldn't update wishlist", description: error.message });
            }
          });
      }
    },
    [ids, user, supabase, toast]
  );

  const has = useCallback((productId: string) => ids.has(productId), [ids]);
  const count = useMemo(() => ids.size, [ids]);

  return (
    <WishlistContext.Provider value={{ ids, isLoading, toggle, has, count }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
