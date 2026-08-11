"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { CartLine } from "@/context/cart-context";

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export interface ShippingAddress {
  fullName: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  date: string;
  email: string;
  items: CartLine[];
  subtotal: number;
  discount?: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: "card" | "cod";
  shippingAddress: ShippingAddress;
}

export interface PlaceOrderInput {
  items: CartLine[];
  couponCode?: string;
  shipping: number;
  tax: number;
  paymentMethod?: "card" | "cod";
  email: string;
  shippingAddress: ShippingAddress;
}

const ORDER_SELECT = "*, order_items(*)";

interface OrderRow {
  id: string;
  created_at: string;
  status: OrderStatus;
  subtotal: number | string;
  discount: number | string;
  coupon_code: string | null;
  shipping: number | string;
  tax: number | string;
  total: number | string;
  payment_method: "card" | "cod" | null;
  shipping_address: ShippingAddress;
  order_items: {
    product_id: string | null;
    product_name: string;
    slug: string;
    unit_price: number | string;
    quantity: number;
    size: string | null;
    color: string | null;
    universe_id: string | null;
    art_icon: string | null;
  }[];
}

function mapOrderRow(row: OrderRow, email: string): Order {
  return {
    id: row.id,
    date: row.created_at,
    email,
    status: row.status,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    couponCode: row.coupon_code ?? undefined,
    shipping: Number(row.shipping),
    tax: Number(row.tax),
    total: Number(row.total),
    paymentMethod: row.payment_method ?? undefined,
    shippingAddress: row.shipping_address,
    items: row.order_items.map((i) => ({
      productId: i.product_id ?? "",
      slug: i.slug,
      name: i.product_name,
      price: Number(i.unit_price),
      size: (i.size ?? "M") as CartLine["size"],
      color: i.color ?? "",
      universe: i.universe_id ?? "",
      artIcon: i.art_icon ?? "Shirt",
      quantity: i.quantity,
    })),
  };
}

interface OrdersContextValue {
  orders: Order[];
  isLoading: boolean;
  placeOrder: (input: PlaceOrderInput) => Promise<{ order: Order | null; error: string | null }>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

/**
 * Orders are created via the `place_order` RPC (see
 * supabase/migrations/0003_functions.sql), which recomputes price/stock
 * from the products table server-side — the browser's cart values are
 * only ever used to decide *what* to order, never trusted for *how much*.
 */
export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const refresh = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false });
    if (error || !data) {
      setOrders([]);
      return;
    }
    setOrders((data as unknown as OrderRow[]).map((row) => mapOrderRow(row, user.email)));
  }, [supabase, user]);

  useEffect(() => {
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const placeOrder = useCallback(
    async (input: PlaceOrderInput) => {
      const items = input.items.map((l) => ({
        product_id: l.productId,
        quantity: l.quantity,
        size: l.size,
        color: l.color,
      }));

      const { data: orderId, error } = await supabase.rpc("place_order", {
        items,
        shipping_address: input.shippingAddress as unknown as Record<string, string>,
        coupon_code: input.couponCode ?? null,
        shipping_cost: input.shipping,
        tax_amount: input.tax,
        payment_method: input.paymentMethod ?? "card",
      });

      if (error || !orderId) {
        return { order: null, error: error?.message ?? "Couldn't place order" };
      }

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(ORDER_SELECT)
        .eq("id", orderId)
        .single();
      if (fetchError || !data) {
        await refresh();
        return { order: null, error: fetchError?.message ?? "Order placed, but couldn't load its details" };
      }

      const order = mapOrderRow(data as unknown as OrderRow, input.email);
      setOrders((prev) => [order, ...prev]);
      return { order, error: null };
    },
    [supabase, refresh]
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) return { error: error.message };
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      return { error: null };
    },
    [supabase]
  );

  return (
    <OrdersContext.Provider value={{ orders, isLoading, placeOrder, updateOrderStatus, refresh }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
