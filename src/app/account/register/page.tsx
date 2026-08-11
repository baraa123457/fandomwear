import type { Metadata } from "next";
import RegisterView from "./register-view";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a FandomWear account to track orders, save your wishlist, and check out faster.",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return <RegisterView />;
}
