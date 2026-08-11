"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (patch: { name?: string }) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Real Supabase Auth. Session lives in cookies (via @supabase/ssr) so it's
 * readable by both the server (middleware, Server Components) and the
 * browser. `profiles.full_name` supplies the display name; auth.users
 * itself only tracks credentials.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const loadProfile = useCallback(
    async (authUser: { id: string; email?: string | null }) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", authUser.id)
        .single();
      setUser({
        id: authUser.id,
        email: profile?.email ?? authUser.email ?? "",
        name: profile?.full_name || (authUser.email ?? "").split("@")[0],
      });
    },
    [supabase]
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) loadProfile(authUser);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/account/login` : undefined,
    });
    return { error: error?.message ?? null };
  };

  const updateProfile = async (patch: { name?: string }) => {
    if (!user) return { error: "Not signed in" };
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: patch.name })
      .eq("id", user.id);
    if (!error && patch.name) setUser((prev) => (prev ? { ...prev, name: patch.name! } : prev));
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signOut, requestPasswordReset, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
