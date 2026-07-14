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

  async signOut() {
    return this.client.auth.signOut();
  }

  onAuthStateChange(
    listener: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.client.auth.onAuthStateChange(listener);
  }
}

export const authService = new SupabaseAuthService();