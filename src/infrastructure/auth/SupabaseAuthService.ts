import type { AuthChangeEvent, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";

/**
 * Authentication boundary for dashboard users. Presentation code depends on
 * this service rather than directly on Supabase Auth methods.
 */
export class SupabaseAuthService {
  constructor(private readonly client: SupabaseClient = supabase) {}

  async currentUser(): Promise<User | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error) return null;
    return data.user;
  }

  async currentSession(): Promise<Session | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) return null;
    return data.session;
  }

  async signInWithMagicLink(email: string, redirectTo?: string) {
    return this.client.auth.signInWithOtp({
      email,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    });
  }

  async signInWithPassword(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.client.auth.signOut();
  }

  onAuthStateChange(
    listener: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.client.auth.onAuthStateChange(listener);
  }
}

/** Maps Supabase auth errors into short, user-facing copy. */
export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("email rate limit")) {
    return (
      "Email rate limit exceeded. Supabase's free email provider only allows a " +
      "few magic links per hour. Wait about an hour, or sign in with email and password instead."
    );
  }
  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirm your email before signing in, or use a magic link once the rate limit resets.";
  }
  return message;
}

export const authService = new SupabaseAuthService();
