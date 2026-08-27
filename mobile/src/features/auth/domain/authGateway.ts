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
  /** Restauración inicial de sesión (getSession). La UI muestra AuthLoadingScreen. */
  isInitializing: boolean;
  /** Operación activa del usuario (signInWithGoogle/signInWithPassword/signOut). La LoginScreen permanece montada. */
  isAuthenticating: boolean;
  /**
   * Compatibilidad: derived = isInitializing || isAuthenticating.
   * No debe volver a usarse como único booleano para UI con semánticas distintas (AUTH-UX-086).
   */
  isLoading: boolean;
  session: Session | null;
  error: string | null;
};

export type AuthUser = User;
