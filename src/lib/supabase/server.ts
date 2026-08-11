import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Supabase client for Server Components, Server Actions, and Route
 * Handlers. Reads/writes auth cookies via Next's cookie store so the
 * session survives across requests. Still uses the anon key — RLS
 * enforces authorization, this does NOT bypass it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render (not a Server Action or
            // Route Handler) — cookies can't be written here. Harmless as
            // long as middleware.ts is also refreshing the session.
          }
        },
      },
    }
  );
}

/**
 * Admin/service-role client. Bypasses Row Level Security entirely — only
 * ever import this in server-only code (Route Handlers, Server Actions,
 * scripts). NEVER import this into a Client Component or anything bundled
 * for the browser; the service role key must never reach the client.
 */
export function createServiceRoleClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (server-only, see .env.example)."
    );
  }
  return createSupabaseJsClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
