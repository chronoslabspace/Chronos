// Supabase client bootstrap only. Feature-specific behavior belongs in
// infrastructure/repositories, infrastructure/auth, infrastructure/storage,
// or infrastructure/queries.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[chronos] Missing Supabase credentials. Request Access submissions will not be persisted. " +
      "See .env.example for required variables."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
