import type { Metadata } from "next";
import LoginView from "./login-view";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <LoginView />;
}
