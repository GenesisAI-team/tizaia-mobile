import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

import type {
  AuthCredentials,
  AuthGateway,
  AuthResult,
} from '../domain/authGateway';

function asError(error: unknown): Error {
  return error instanceof Error
    ? error
    : new Error('No se pudo completar la autenticación.');
}

function getRedirectParams(
  url: string,
): { access_token: string; refresh_token: string } | null {
  const parsedUrl = new URL(url);
  const values = new URLSearchParams(
    parsedUrl.hash.replace(/^#/, '') || parsedUrl.search,
  );
  const accessToken = values.get('access_token');
  const refreshToken = values.get('refresh_token');

  return accessToken && refreshToken
    ? { access_token: accessToken, refresh_token: refreshToken }
    : null;
}

export function createSupabaseAuthGateway(client: SupabaseClient): AuthGateway {
  return {
    async getSession() {
      const { data, error } = await client.auth.getSession();
      return { session: data.session, error: error ? asError(error) : null };
    },
    async signInWithPassword(
      credentials: AuthCredentials,
    ): Promise<AuthResult> {
      const { error } = await client.auth.signInWithPassword(credentials);
      return { error: error ? asError(error) : null };
    },
    async signInWithGoogle(): Promise<AuthResult> {
      const redirectTo = Linking.createURL('auth/callback');
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error || !data.url) {
        return {
          error: error
            ? asError(error)
            : new Error('Google no está configurado.'),
        };
      }

      // AUTH-UX-086: optimización limitada de latencia percibida. Android-only
      // (la app es solo Android); precalienta la URL OAuth con el Custom Tabs
      // service. Si falla, el OAuth debe continuar: es una mejora opcional.
      await WebBrowser.mayInitWithUrlAsync(data.url).catch(() => undefined);

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );
      if (result.type !== 'success') {
        return { error: new Error('El acceso con Google fue cancelado.') };
      }

      const tokens = getRedirectParams(result.url);
      if (!tokens) {
        return { error: new Error('Google no devolvió una sesión válida.') };
      }

      const sessionResult = await client.auth.setSession(tokens);
      return {
        error: sessionResult.error ? asError(sessionResult.error) : null,
      };
    },
    async signOut(): Promise<AuthResult> {
      const { error } = await client.auth.signOut();
      return { error: error ? asError(error) : null };
    },
    onAuthStateChange(callback) {
      const { data } = client.auth.onAuthStateChange(callback);
      return { unsubscribe: () => data.subscription.unsubscribe() };
    },
  };
}

export type AuthSession = Session;
