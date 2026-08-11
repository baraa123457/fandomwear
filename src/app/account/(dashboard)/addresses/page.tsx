import type { Metadata } from "next";
import AddressesView from "./addresses-view";

export const metadata: Metadata = {
  title: "Addresses",
  robots: { index: false, follow: true },
};

export default function AddressesPage() {
  return <AddressesView />;
}
