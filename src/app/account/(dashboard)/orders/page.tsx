import type { Metadata } from "next";
import OrdersView from "./orders-view";

export const metadata: Metadata = {
  title: "Order History",
  robots: { index: false, follow: true },
};

export default function OrdersPage() {
  return <OrdersView />;
}
