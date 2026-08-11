"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Admin gating backed by Supabase Auth + `profiles.role`. This context is
 * a UX convenience for the client (instant redirect, nav state) — it is
 * NOT the real security boundary. The real boundary is:
 *   1. middleware.ts, which redirects unauthenticated/non-admin requests
 *      away from /admin routes server-side before any page renders.
 *   2. Row Level Security policies (`is_admin()`), which stop a non-admin
 *      from reading/writing admin-only tables regardless of what the UI
 *      shows them.
 * A user editing localStorage/JS state can no longer grant themselves
 * admin access, because there is no longer a client-side flag to edit.
 */
interface AdminAuthContextValue {
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const checkRole = useCallback(
    async (userId: string) => {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
      setIsAdmin(profile?.role === "admin");
    },
    [supabase]
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) checkRole(user.id);
      else setIsAdmin(false);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) checkRole(session.user.id);
      else setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setIsAdmin(false);
      return { error: "This account doesn't have admin access." };
    }
    setIsAdmin(true);
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
