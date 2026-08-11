"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ShieldAlert } from "lucide-react";
import { useAdminAuth } from "@/context/admin-auth-context";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await login(email, password);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    router.push("/admin");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <Link href="/" className="mx-auto font-display text-lg font-extrabold tracking-tight text-ink">
        FANDOM<span className="text-accent-purple">WEAR</span>
      </Link>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-purple/15 text-accent-purple">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Admin access</h1>
        <p className="mt-1.5 text-sm text-ink-faint">Sign in with an account that has admin access.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label>
            <span className="text-xs font-medium text-ink-dim">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@fandomwear.com"
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent-cyan focus:outline-none"
            />
          </label>
          <label>
            <span className="text-xs font-medium text-ink-dim">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-void px-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent-cyan focus:outline-none"
            />
          </label>
          {error && <p className="text-xs text-accent-red">{error}</p>}
          <Button type="submit" size="lg" variant="accent" className="w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Enter dashboard"}
          </Button>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-void p-3.5 text-xs text-ink-faint">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Access is controlled by your Supabase <code className="font-mono text-ink-dim">profiles.role</code>{" "}
            — this account must have role <code className="font-mono text-ink-dim">admin</code>. See{" "}
            <code className="font-mono text-ink-dim">SUPABASE_SETUP.md</code> for how to grant that to your
            first account.
          </span>
        </div>
      </div>
    </div>
  );
}
