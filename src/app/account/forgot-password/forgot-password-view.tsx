"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { AuthShell, AuthField } from "@/components/account/auth-shell";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Always show the same "check your inbox" state regardless of whether
    // the account exists — don't leak account existence via the response.
    await requestPasswordReset(email);
    setSubmitting(false);
    setSent(true);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send a reset link to your inbox."
      footer={
        <Link href="/account/login" className="font-medium text-ink underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center py-4 text-center">
          <MailCheck className="h-8 w-8 text-accent-cyan" />
          <p className="mt-3 text-sm text-ink-dim">
            If an account exists for <span className="text-ink">{email}</span>, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AuthField
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
          <Button type="submit" size="lg" variant="accent" className="mt-2 w-full" disabled={submitting}>
            {submitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
