import { act } from 'react';
import type { Session } from '@supabase/supabase-js';
import { create, type ReactTestRenderer } from 'react-test-renderer';

import type {
  AuthCredentials,
  AuthGateway,
  AuthResult,
} from '../domain/authGateway';
import { AuthProvider, useAuth } from './AuthProvider';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type SessionResult = ReturnType<AuthGateway['getSession']>;
type AuthListener = Parameters<AuthGateway['onAuthStateChange']>[0];
type AuthValues = ReturnType<typeof useAuth>;

function deferred<T = unknown>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function createProviderStub(): jest.Mocked<AuthGateway> {
  return {
    getSession: jest.fn(async (): SessionResult => ({
      session: null,
      error: null,
    })),
    signInWithPassword: jest.fn(
      async (_credentials: AuthCredentials): Promise<AuthResult> => ({
        error: null,
      }),
    ),
    signInWithGoogle: jest.fn(async (): Promise<AuthResult> => ({
      error: null,
    })),
    signOut: jest.fn(async (): Promise<AuthResult> => ({ error: null })),
    onAuthStateChange: jest.fn((_callback: AuthListener) => ({
      unsubscribe: () => undefined,
    })),
  };
}

function createSession(): Session {
  return { user: { id: 'google-user', aud: 'authenticated' } } as Session;
}

function Probe({ onValue }: { onValue: (value: AuthValues) => void }) {
  onValue(useAuth());
  return null;
}

async function renderProbe(gateway: jest.Mocked<AuthGateway>) {
  const values: AuthValues[] = [];
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(
      <AuthProvider gateway={gateway}>
        <Probe onValue={(value) => values.push(value)} />
      </AuthProvider>,
    );
  });
  return { renderer, values };
}

function latest(values: AuthValues[]): AuthValues {
  return values[values.length - 1]!;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('separa la restauración inicial (isInitializing) de la operación (isAuthenticating)', async () => {
    const gateway = createProviderStub();
    const getSessionDeferred = deferred<{
      session: null;
      error: null;
    }>();
    gateway.getSession.mockReturnValue(getSessionDeferred.promise);

    const { values } = await renderProbe(gateway);
    expect(latest(values)).toMatchObject({
      isInitializing: true,
      isAuthenticating: false,
      isLoading: true,
      session: null,
      error: null,
    });

    await act(async () => {
      getSessionDeferred.resolve({ session: null, error: null });
    });
    expect(latest(values)).toMatchObject({
      isInitializing: false,
      isAuthenticating: false,
      isLoading: false,
    });
  });

  it('signInWithGoogle activa isAuthenticating sin alterar isInitializing', async () => {
    const gateway = createProviderStub();
    const { values } = await renderProbe(gateway);
    expect(latest(values).isInitializing).toBe(false);

    const googleDeferred = deferred<AuthResult>();
    gateway.signInWithGoogle.mockReturnValue(googleDeferred.promise);

    let operation!: Promise<boolean>;
    await act(async () => {
      operation = latest(values).signInWithGoogle();
    });
    expect(latest(values)).toMatchObject({
      isInitializing: false,
      isAuthenticating: true,
      isLoading: true,
      error: null,
    });

    await act(async () => {
      googleDeferred.resolve({ error: new Error('Acceso cancelado.') });
      await operation;
    });
    expect(latest(values)).toMatchObject({
      isInitializing: false,
      isAuthenticating: false,
      isLoading: false,
      error: 'Acceso cancelado.',
    });
  });

  it('un error de operación devuelve false y limpia el estado de carga', async () => {
    const gateway = createProviderStub();
    const { values } = await renderProbe(gateway);
    let result!: boolean;
    await act(async () => {
      result = await latest(values).signInWithPassword({
        email: 'p@tizaia.es',
        password: 'x',
      });
    });
    expect(result).toBe(true);
    expect(latest(values)).toMatchObject({
      isAuthenticating: false,
      isLoading: false,
      error: null,
    });
  });

  it('signOut sincroniza estado y sesión con el evento SIGNED_OUT', async () => {
    let session: Session | null = createSession();
    let listener: AuthListener | null = null;
    const gateway = {
      getSession: jest.fn(async (): SessionResult => ({
        session,
        error: null,
      })),
      signInWithPassword: jest.fn(async (): Promise<AuthResult> => ({
        error: null,
      })),
      signInWithGoogle: jest.fn(async (): Promise<AuthResult> => ({
        error: null,
      })),
      signOut: jest.fn(async (): Promise<AuthResult> => {
        session = null;
        listener?.('SIGNED_OUT', null);
        return { error: null };
      }),
      onAuthStateChange: jest.fn((callback: AuthListener) => {
        listener = callback;
        return {
          unsubscribe: () => {
            listener = null;
          },
        };
      }),
    } as unknown as jest.Mocked<AuthGateway>;

    const { values } = await renderProbe(gateway);
    expect(latest(values).isInitializing).toBe(false);
    expect(latest(values).session).not.toBeNull();

    let result!: boolean;
    await act(async () => {
      result = await latest(values).signOut();
    });
    expect(result).toBe(true);
    expect(latest(values)).toMatchObject({
      isInitializing: false,
      isAuthenticating: false,
      isLoading: false,
      session: null,
      error: null,
    });
  });
});
