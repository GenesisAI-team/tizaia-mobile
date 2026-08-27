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

/**
 * Estado persistido internamente. `isLoading` no se almacena: se deriva en el
 * contexto como `isInitializing || isAuthenticating` para mantener
 * compatibilidad (AUTH-UX-086).
 */
type AuthSnapshot = Omit<AuthState, 'isLoading'>;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  gateway,
  children,
}: PropsWithChildren<{ gateway: AuthGateway }>) {
  const [state, setState] = useState<AuthSnapshot>({
    isInitializing: true,
    isAuthenticating: false,
    session: null,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    void gateway.getSession().then(({ session, error }) => {
      if (mounted)
        setState((current) => ({
          ...current,
          isInitializing: false,
          session,
          error: error?.message ?? null,
        }));
    });
    const subscription = gateway.onAuthStateChange((_event, session) => {
      // Un evento de auth confirma que la restauración terminó (SIGNED_IN/SIGNED_OUT).
      if (mounted)
        setState((current) => ({
          ...current,
          isInitializing: false,
          session,
          error: null,
        }));
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [gateway]);

  const value = useMemo<AuthContextValue>(() => {
    const run = async (operation: () => Promise<{ error: Error | null }>) => {
      // La operación del usuario no toca isInitializing: la inicialización y
      // la autenticación son estados con UI distinta (AUTH-UX-086).
      setState((current) => ({
        ...current,
        isAuthenticating: true,
        error: null,
      }));
      const { error } = await operation();
      setState((current) => ({
        ...current,
        isAuthenticating: false,
        error: error?.message ?? null,
      }));
      return error ? false : true;
    };
    return {
      ...state,
      isLoading: state.isInitializing || state.isAuthenticating,
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
