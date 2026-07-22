// Supabase client bootstrap only. Feature-specific behavior belongs in
// infrastructure/repositories, infrastructure/auth, infrastructure/storage,
// or infrastructure/queries.

import { createClient } from "@supabase/supabase-js";

/**
 * Trim + treat empty string as missing. CI can inject empty VITE_* secrets that
 * override .env.production; `??` does not fall back for `""`.
 */
function envString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const supabaseUrl = envString(import.meta.env.VITE_SUPABASE_URL);
/** Prefer publishable key (sb_publishable_...); legacy anon JWT still accepted. */
const supabaseAnonKey =
  envString(import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  envString(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

/** True when real project URL + anon/publishable key are present. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[chronos] Missing Supabase credentials. Auth and cloud persistence are disabled. " +
      "Copy .env.example → .env (or set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY). " +
      "Local stack: npm run supabase:start && npm run supabase:env"
  );
}

/**
 * Auth for the BrowserRouter SPA:
 * - persistSession / autoRefreshToken keep dashboard sessions across reloads.
 * - detectSessionInUrl recovers the magic-link session from the redirect URL.
 * - implicit flow puts tokens in the hash fragment. With path-based routing the
 *   path (`/auth/callback`) is preserved when the client clears the hash.
 *   PKCE is avoided for email magic links: it requires a same-browser code
 *   verifier, so opening the link from mail apps / other devices always fails.
 *
 * Placeholder URL/key only when misconfigured so module load never throws;
 * callers should check `isSupabaseConfigured` before cloud writes.
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "implicit",
    },
  }
);
