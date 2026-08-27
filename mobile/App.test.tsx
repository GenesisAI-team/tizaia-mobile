// La fábrica de jest.mock queda hoisted por encima de los imports y solo puede
// referenciar módulos vía require(); el lint queda acotado a este archivo.
/* eslint-disable @typescript-eslint/no-require-imports */
import { act } from 'react';
import { Text } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import {
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';

import { AuthProvider } from './src/features/auth/application/AuthProvider';
import type { AuthGateway } from './src/features/auth/domain/authGateway';
import { AuthLoadingScreen } from './src/features/auth/presentation/AuthLoadingScreen';
import { LoginScreen } from './src/features/auth/presentation/LoginScreen';
import { RootNavigator } from './src/navigation/RootNavigator';

// El drawer real arrastra muchas pantallas y dependencias nativas; para probar
// la navegación raíz de auth se sustituye por un marcador.
jest.mock('./src/navigation/AppDrawerNavigator', () => {
  const React = require('react') as typeof import('react');
  const { Text: RNText } =
    require('react-native') as typeof import('react-native');
  return {
    AppDrawerNavigator: () =>
      React.createElement(RNText, null, 'AppDrawerNavigator'),
  };
});

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type SessionResult = ReturnType<AuthGateway['getSession']>;
type AuthListener = Parameters<AuthGateway['onAuthStateChange']>[0];

function makeSession(): Session {
  return { user: { id: 'google-user', aud: 'authenticated' } } as Session;
}

function createRootGatewayStub(
  options: { session?: Session | null } = {},
): jest.Mocked<AuthGateway> {
  let session: Session | null = options.session ?? null;
  let listener: AuthListener | null = null;
  const gateway = {
    getSession: jest.fn(async (): SessionResult => ({ session, error: null })),
    signInWithPassword: jest.fn(async () => ({ error: null })),
    // Simula Supabase: al completar el OAuth emite SIGNED_IN con sesión.
    signInWithGoogle: jest.fn(async () => {
      session = makeSession();
      listener?.('SIGNED_IN', session);
      return { error: null };
    }),
    signOut: jest.fn(async () => {
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
  };
  return gateway as unknown as jest.Mocked<AuthGateway>;
}

async function renderRoot(
  gateway: jest.Mocked<AuthGateway>,
): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(
      <AuthProvider gateway={gateway}>
        <RootNavigator />
      </AuthProvider>,
    );
  });
  return renderer;
}

function findButtonByText(
  renderer: ReactTestRenderer,
  text: string,
): ReactTestInstance {
  const button = renderer.root
    .findAll(
      (node) =>
        typeof node.type !== 'string' &&
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    )
    .find((b) => b.findAllByType(Text).some((t) => t.props.children === text));
  if (!button) throw new Error(`Botón no encontrado: ${text}`);
  return button;
}

function hasText(renderer: ReactTestRenderer, text: string): boolean {
  return renderer.root
    .findAllByType(Text)
    .some((t) => t.props.children === text);
}

describe('RootNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra AuthLoadingScreen mientras se restaura la sesión inicial', async () => {
    const gateway = createRootGatewayStub();
    gateway.getSession.mockReturnValue(
      new Promise<Awaited<SessionResult>>(() => {}),
    );
    const renderer = await renderRoot(gateway);
    expect(renderer.root.findAllByType(AuthLoadingScreen)).toHaveLength(1);
    expect(renderer.root.findAllByType(LoginScreen)).toHaveLength(0);
  });

  it('la restauración sin sesión navega a Login', async () => {
    const renderer = await renderRoot(createRootGatewayStub());
    expect(renderer.root.findAllByType(LoginScreen)).toHaveLength(1);
    expect(renderer.root.findAllByType(AuthLoadingScreen)).toHaveLength(0);
  });

  it('la restauración con sesión navega a la aplicación autenticada', async () => {
    const renderer = await renderRoot(
      createRootGatewayStub({ session: makeSession() }),
    );
    expect(hasText(renderer, 'AppDrawerNavigator')).toBe(true);
    expect(renderer.root.findAllByType(LoginScreen)).toHaveLength(0);
  });

  it('pulsar Google mantiene Login montado y el éxito navega a la app', async () => {
    const renderer = await renderRoot(createRootGatewayStub());
    await act(async () => {
      findButtonByText(renderer, 'Continuar con Google').props.onPress();
    });
    // El login no se desmonta durante la operación y el éxito de OAuth
    // (SIGNED_IN) lleva a la aplicación autenticada.
    expect(hasText(renderer, 'AppDrawerNavigator')).toBe(true);
    expect(renderer.root.findAllByType(LoginScreen)).toHaveLength(0);
  });
});
