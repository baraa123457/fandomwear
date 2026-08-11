"use client";

import { useEffect, useState } from "react";

/**
 * A small editable list persisted to localStorage. Seeded once from
 * `seed` on first mount; after that, `setItems` both updates state and
 * persists. Used for admin-managed catalog options (universes, categories)
 * that the built-in demo data doesn't otherwise let you add to or trim.
 */
export function useEditableList<T>(storageKey: string, seed: T[]) {
  const [items, setItemsState] = useState<T[]>(seed);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setItemsState(JSON.parse(raw));
    } catch {
      /* ignore malformed storage, fall back to seed */
    }
  }, [storageKey]);

  const setItems = (next: T[]) => {
    setItemsState(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* storage unavailable — list still works for this session */
    }
  };

  return { items, setItems };
}
