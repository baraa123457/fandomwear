import type { Metadata } from "next";
import ForgotPasswordView from "./forgot-password-view";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
