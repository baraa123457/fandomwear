import type { Metadata } from "next";
import WishlistView from "./wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved FandomWear designs, synced to this browser.",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return <WishlistView />;
}
