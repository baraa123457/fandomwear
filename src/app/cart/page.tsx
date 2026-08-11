import type { Metadata } from "next";
import CartView from "./cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartView />;
}
