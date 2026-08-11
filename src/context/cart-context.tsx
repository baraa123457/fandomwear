"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { Product, Size } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  price: number;
  size: Size;
  color: string;
  universe: Product["universe"];
  artIcon: string;
  quantity: number;
}

interface AppliedCoupon {
  code: string;
  discount: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  coupon: AppliedCoupon | null;
}

type CartAction =
  | { type: "ADD"; line: Omit<CartLine, "quantity">; quantity: number }
  | { type: "REMOVE"; productId: string; size: Size; color: string }
  | { type: "SET_QTY"; productId: string; size: Size; color: string; quantity: number }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "HYDRATE"; lines: CartLine[] }
  | { type: "SET_COUPON"; coupon: AppliedCoupon | null }
  | { type: "CLEAR" };

const STORAGE_KEY = "fandomwear:cart";

function lineKey(l: { productId: string; size: Size; color: string }) {
  return `${l.productId}__${l.size}__${l.color}`;
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const key = lineKey(action.line);
      const existing = state.lines.find((l) => lineKey(l) === key);
      const lines = existing
        ? state.lines.map((l) =>
            lineKey(l) === key ? { ...l, quantity: l.quantity + action.quantity } : l
          )
        : [...state.lines, { ...action.line, quantity: action.quantity }];
      return { ...state, lines, isOpen: true };
    }
    case "REMOVE": {
      const key = lineKey(action);
      return { ...state, lines: state.lines.filter((l) => lineKey(l) !== key) };
    }
    case "SET_QTY": {
      const key = lineKey(action);
      return {
        ...state,
        lines: state.lines
          .map((l) => (lineKey(l) === key ? { ...l, quantity: action.quantity } : l))
          .filter((l) => l.quantity > 0),
      };
    }
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "HYDRATE":
      return { ...state, lines: action.lines };
    case "SET_COUPON":
      return { ...state, coupon: action.coupon };
    case "CLEAR":
      return { ...state, lines: [], coupon: null };
    default:
      return state;
  }
}

interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  subtotal: number;
  discount: number;
  total: number;
  coupon: AppliedCoupon | null;
  itemCount: number;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, size: Size, color: string) => void;
  setQuantity: (productId: string, size: Size, color: string, quantity: number) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string | null }>;
  removeCoupon: () => void;
  clearCart: () => void;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], isOpen: false, coupon: null });
  const supabase = createClient();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", lines: JSON.parse(raw) });
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      /* storage unavailable — cart still works in-memory */
    }
  }, [state.lines]);

  const addItem = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) =>
      dispatch({ type: "ADD", line, quantity }),
    []
  );
  const removeItem = useCallback(
    (productId: string, size: Size, color: string) =>
      dispatch({ type: "REMOVE", productId, size, color }),
    []
  );
  const setQuantity = useCallback(
    (productId: string, size: Size, color: string, quantity: number) =>
      dispatch({ type: "SET_QTY", productId, size, color, quantity }),
    []
  );
  const open = useCallback(() => dispatch({ type: "OPEN" }), []);
  const close = useCallback(() => dispatch({ type: "CLOSE" }), []);

  const subtotal = useMemo(
    () => state.lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [state.lines]
  );

  // Validated server-side (validate_coupon RPC) against the real coupons
  // table — minimum order, expiry, usage limit, active flag all live in
  // Postgres now, not a hardcoded local list.
  const applyCoupon = useCallback(
    async (code: string) => {
      const { data, error } = await supabase.rpc("validate_coupon", {
        coupon_code: code.trim(),
        order_subtotal: subtotal,
      });
      const result = data?.[0];
      if (error || !result?.valid) {
        dispatch({ type: "SET_COUPON", coupon: null });
        return { success: false, message: result?.message ?? error?.message ?? "Invalid coupon" };
      }
      dispatch({ type: "SET_COUPON", coupon: { code: code.trim().toUpperCase(), discount: Number(result.discount) } });
      return { success: true, message: null };
    },
    [supabase, subtotal]
  );

  const removeCoupon = useCallback(() => dispatch({ type: "SET_COUPON", coupon: null }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const discount = state.coupon?.discount ?? 0;
  const total = subtotal - discount;
  const itemCount = useMemo(
    () => state.lines.reduce((sum, l) => sum + l.quantity, 0),
    [state.lines]
  );

  const value: CartContextValue = {
    lines: state.lines,
    isOpen: state.isOpen,
    subtotal,
    discount,
    total,
    coupon: state.coupon,
    itemCount,
    addItem,
    removeItem,
    setQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
    open,
    close,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
