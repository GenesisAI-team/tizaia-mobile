import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthResult = {
  error: Error | null;
};

export type AuthGateway = {
  getSession: () => Promise<{ session: Session | null; error: Error | null }>;
  signInWithPassword: (credentials: AuthCredentials) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  onAuthStateChange: (
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) => { unsubscribe: () => void };
};

export type AuthState = {
  isLoading: boolean;
  session: Session | null;
  error: string | null;
};

export type AuthUser = User;
