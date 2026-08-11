"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Button } from "@/components/ui/button";
import { AuthShell, AuthField } from "@/components/account/auth-shell";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setSubmitting(true);
    const { error } = await signUp(form.email, form.password, form.name);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    toast({
      variant: "success",
      title: "Account created",
      description: "Check your email to confirm your account, then sign in.",
    });
    router.push("/account/login");
  };

  return (
    <AuthShell
      title="Create an account"
      subtitle="Track orders, save your wishlist, and check out faster."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/account/login" className="font-medium text-ink underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Full name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <AuthField
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <AuthField
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <AuthField
          label="Confirm password"
          type="password"
          required
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
        />
        {error && <p className="text-xs text-accent-red">{error}</p>}
        <Button type="submit" size="lg" variant="accent" className="mt-2 w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
