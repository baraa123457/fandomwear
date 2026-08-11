import type { Metadata } from "next";
import CheckoutView from "./checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
