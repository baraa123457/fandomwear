import type { Metadata } from "next";
import LoginView from "./login-view";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your FandomWear account to track orders, wishlist, and addresses.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginView />;
}
