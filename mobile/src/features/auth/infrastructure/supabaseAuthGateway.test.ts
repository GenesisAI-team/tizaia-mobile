import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseAuthGateway } from './supabaseAuthGateway';

jest.mock('expo-web-browser', () => ({
  WebBrowserResultType: {
    CANCEL: 'cancel',
    DISMISS: 'dismiss',
    OPENED: 'opened',
    LOCKED: 'locked',
  },
  warmUpAsync: jest.fn(async () => ({ type: 'success' })),
  coolDownAsync: jest.fn(async () => ({})),
  mayInitWithUrlAsync: jest.fn(async () => ({})),
  openAuthSessionAsync: jest.fn(async () => ({
    type: 'cancel',
  })),
}));
jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'tizaia://auth/callback'),
}));

const OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth?x=1';

function createClientStub(): SupabaseClient {
  return {
    auth: {
      getSession: jest.fn(async () => ({
        data: { session: null },
        error: null,
      })),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(async () => ({
        data: { url: OAUTH_URL, provider: 'google' },
        error: null,
      })),
      setSession: jest.fn(async () => ({ error: null })),
      signOut: jest.fn(async () => ({ error: null })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  } as unknown as SupabaseClient;
}

function oauthSuccessUrl(): string {
  return 'tizaia://auth/callback#access_token=at&refresh_token=rt';
}

describe('createSupabaseAuthGateway', () => {
  beforeEach(() => {
    // resetAllMocks borra también las implementaciones de la fábrica
    // (jest.mock); se restaura aquí una línea base determinista y cada test
    // sobrescribe solo lo que necesita.
    jest.resetAllMocks();
    jest.mocked(Linking.createURL).mockReturnValue('tizaia://auth/callback');
    jest.mocked(WebBrowser.mayInitWithUrlAsync).mockResolvedValue({});
    jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({
      type: WebBrowser.WebBrowserResultType.CANCEL,
    });
  });

  it('precalienta la URL OAuth antes de abrir la sesión y completa con setSession', async () => {
    const client = createClientStub();
    const gateway = createSupabaseAuthGateway(client);
    const redirectTo = 'tizaia://auth/callback';

    jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({
      type: 'success',
      url: oauthSuccessUrl(),
    });

    const result = await gateway.signInWithGoogle();

    expect(result.error).toBeNull();
    expect(WebBrowser.mayInitWithUrlAsync).toHaveBeenCalledWith(OAUTH_URL);
    expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
      OAUTH_URL,
      redirectTo,
    );
    // La optimización ocurre antes de abrir el Custom Tab.
    expect(
      jest.mocked(WebBrowser.mayInitWithUrlAsync).mock.invocationCallOrder[0]!,
    ).toBeLessThan(
      jest.mocked(WebBrowser.openAuthSessionAsync).mock.invocationCallOrder[0]!,
    );
    expect(client.auth.setSession).toHaveBeenCalledWith({
      access_token: 'at',
      refresh_token: 'rt',
    });
  });

  it('una cancelación de OAuth devuelve error recuperable sin setSession', async () => {
    const client = createClientStub();
    const gateway = createSupabaseAuthGateway(client);

    const result = await gateway.signInWithGoogle();

    expect(result.error?.message).toBe('El acceso con Google fue cancelado.');
    expect(client.auth.setSession).not.toHaveBeenCalled();
  });

  it('un fallo de mayInitWithUrlAsync no rompe el flujo de OAuth', async () => {
    jest
      .mocked(WebBrowser.mayInitWithUrlAsync)
      .mockRejectedValue(new Error('sin Custom Tabs'));
    const client = createClientStub();
    const gateway = createSupabaseAuthGateway(client);

    jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({
      type: 'success',
      url: oauthSuccessUrl(),
    });

    const result = await gateway.signInWithGoogle();

    expect(result.error).toBeNull();
    expect(client.auth.setSession).toHaveBeenCalledTimes(1);
  });
});
