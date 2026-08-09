import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Session } from '@supabase/supabase-js';

import type {
  AuthCredentials,
  AuthGateway,
  AuthState,
} from '../domain/authGateway';

type AuthContextValue = AuthState & {
  signInWithPassword: (credentials: AuthCredentials) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  gateway,
  children,
}: PropsWithChildren<{ gateway: AuthGateway }>) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    session: null,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    void gateway.getSession().then(({ session, error }) => {
      if (mounted)
        setState({ isLoading: false, session, error: error?.message ?? null });
    });
    const subscription = gateway.onAuthStateChange((_event, session) => {
      if (mounted) setState({ isLoading: false, session, error: null });
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [gateway]);

  const value = useMemo<AuthContextValue>(() => {
    const run = async (operation: () => Promise<{ error: Error | null }>) => {
      setState((current) => ({ ...current, isLoading: true, error: null }));
      const { error } = await operation();
      if (error) {
        setState((current) => ({
          ...current,
          isLoading: false,
          error: error.message,
        }));
        return false;
      }
      setState((current) => ({ ...current, isLoading: false, error: null }));
      return true;
    };
    return {
      ...state,
      signInWithPassword: (credentials) =>
        run(() => gateway.signInWithPassword(credentials)),
      signInWithGoogle: () => run(() => gateway.signInWithGoogle()),
      signOut: () => run(() => gateway.signOut()),
    };
  }, [gateway, state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  return context;
}

export type AuthSession = Session;
