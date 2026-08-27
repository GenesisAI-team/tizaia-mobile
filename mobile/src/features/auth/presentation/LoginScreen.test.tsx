import { act } from 'react';
import { Text } from 'react-native';
import { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import {
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';

import { GoogleGIcon } from '../../../shared/components/GoogleGIcon';
import { AuthProvider } from '../application/AuthProvider';
import type {
  AuthCredentials,
  AuthGateway,
  AuthResult,
} from '../domain/authGateway';
import { LoginScreen } from './LoginScreen';
import { BrandMark } from './BrandMark';

jest.mock('expo-web-browser', () => ({
  warmUpAsync: jest.fn(async () => ({ type: 'success' })),
  coolDownAsync: jest.fn(async () => ({})),
  mayInitWithUrlAsync: jest.fn(async () => ({})),
  openAuthSessionAsync: jest.fn(async () => ({ type: 'cancel' })),
}));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// La primera ejecución de la suite paga la carga/transformación de módulos
// (react-native-svg, expo-web-browser…) y supera el default de 5s.
jest.setTimeout(20000);

type SessionResult = ReturnType<AuthGateway['getSession']>;

function createGatewayStub(): jest.Mocked<AuthGateway> {
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
    onAuthStateChange: jest.fn(
      (_callback: Parameters<AuthGateway['onAuthStateChange']>[0]) => ({
        unsubscribe: () => undefined,
      }),
    ),
  };
}

async function renderLogin(
  gateway: jest.Mocked<AuthGateway>,
): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(
      <AuthProvider gateway={gateway}>
        <LoginScreen />
      </AuthProvider>,
    );
  });
  return renderer;
}

/**
 * Pressable se exporta memoizado, así que no es localizable por tipo con
 * react-test-renderer; los botones se buscan como componentes compuestos con
 * rol accesible "button" y manejador onPress.
 */
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

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra la marca de la aplicación al cargar (RF-AUTH-005)', async () => {
    const renderer = await renderLogin(createGatewayStub());
    expect(renderer.root.findAllByType(BrandMark)).toHaveLength(1);
  });

  it('muestra el título y ambos botones con los textos exactos', async () => {
    const renderer = await renderLogin(createGatewayStub());
    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children);
    expect(texts).toContain('Iniciar sesión');
    expect(texts).toContain('Continuar con Google');
    expect(findButtonByText(renderer, 'Iniciar sesión')).toBeTruthy();
    expect(findButtonByText(renderer, 'Continuar con Google')).toBeTruthy();
  });

  it('el botón de Google incluye la G multicolor a la izquierda', async () => {
    const renderer = await renderLogin(createGatewayStub());
    const googleButton = findButtonByText(renderer, 'Continuar con Google');
    const icons = googleButton.findAllByType(GoogleGIcon);
    expect(icons).toHaveLength(1);
    const fills = icons[0]!.findAllByType(Path).map((p) => p.props.fill);
    expect(fills).toEqual(['#4285F4', '#34A853', '#FBBC05', '#EA4335']);
  });

  it('envía las credenciales con el correo recortado al pulsar Iniciar Sesión', async () => {
    const gateway = createGatewayStub();
    const renderer = await renderLogin(gateway);
    const emailInput = renderer.root.findByProps({
      accessibilityLabel: 'Correo electrónico',
    });
    const passwordInput = renderer.root.findByProps({
      accessibilityLabel: 'Contraseña',
    });
    await act(async () => {
      emailInput.props.onChangeText('  profesor@tizaia.es ');
      passwordInput.props.onChangeText('secreto');
    });
    await act(async () => {
      findButtonByText(renderer, 'Iniciar sesión').props.onPress();
    });
    expect(gateway.signInWithPassword).toHaveBeenCalledWith({
      email: 'profesor@tizaia.es',
      password: 'secreto',
    });
  });

  it('invoca signInWithGoogle al pulsar Continuar con Google', async () => {
    const gateway = createGatewayStub();
    const renderer = await renderLogin(gateway);
    await act(async () => {
      findButtonByText(renderer, 'Continuar con Google').props.onPress();
    });
    expect(gateway.signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('desactiva los botones durante la autenticación sin loader global', async () => {
    const gateway = createGatewayStub();
    gateway.signInWithPassword.mockReturnValue(
      new Promise<AuthResult>(() => {}),
    );
    const renderer = await renderLogin(gateway);
    await act(async () => {
      findButtonByText(renderer, 'Iniciar sesión').props.onPress();
    });
    // AUTH-UX-086: el loader global desaparece; la pantalla sigue montada y
    // ambos botones quedan deshabilitados (el de Google muestra "Entrando…").
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Cargando' }),
    ).toHaveLength(0);
    expect(findButtonByText(renderer, 'Iniciar sesión').props.disabled).toBe(
      true,
    );
    expect(findButtonByText(renderer, 'Entrando…').props.disabled).toBe(true);
    expect(() => findButtonByText(renderer, 'Continuar con Google')).toThrow();
  });

  it('al pulsar Google muestra "Entrando…" con spinner inline sin desmontar el login', async () => {
    const gateway = createGatewayStub();
    gateway.signInWithGoogle.mockReturnValue(new Promise<AuthResult>(() => {}));
    const renderer = await renderLogin(gateway);
    await act(async () => {
      findButtonByText(renderer, 'Continuar con Google').props.onPress();
    });
    // El texto del botón cambia y no queda el label global de carga.
    expect(findButtonByText(renderer, 'Entrando…').props.disabled).toBe(true);
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Entrando con Google' }),
    ).toBeTruthy();
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Cargando' }),
    ).toHaveLength(0);
    // La pantalla sigue montada: la marca sigue visible.
    expect(renderer.root.findAllByType(BrandMark)).toHaveLength(1);
    expect(() => findButtonByText(renderer, 'Continuar con Google')).toThrow();
  });

  it('el error de Google vuelve a la UI interactiva y es recuperable', async () => {
    const gateway = createGatewayStub();
    gateway.signInWithGoogle.mockResolvedValue({
      error: new Error('El acceso con Google fue cancelado.'),
    });
    const renderer = await renderLogin(gateway);
    await act(async () => {
      findButtonByText(renderer, 'Continuar con Google').props.onPress();
    });
    const alert = renderer.root.findByProps({ accessibilityRole: 'alert' });
    expect(alert.props.children).toBe('El acceso con Google fue cancelado.');
    expect(
      findButtonByText(renderer, 'Continuar con Google').props.disabled,
    ).toBe(false);
    expect(findButtonByText(renderer, 'Iniciar sesión').props.disabled).toBe(
      false,
    );
  });

  it('un Google correcto vuelve a dejar la UI interactiva', async () => {
    const gateway = createGatewayStub();
    const renderer = await renderLogin(gateway);
    await act(async () => {
      findButtonByText(renderer, 'Continuar con Google').props.onPress();
    });
    expect(gateway.signInWithGoogle).toHaveBeenCalledTimes(1);
    expect(
      findButtonByText(renderer, 'Continuar con Google').props.disabled,
    ).toBe(false);
  });

  it('precalienta el navegador al montar y lo libera al desmontar sin leaks', async () => {
    const renderer = await renderLogin(createGatewayStub());
    expect(WebBrowser.warmUpAsync).toHaveBeenCalledTimes(1);
    await act(async () => {
      renderer.unmount();
    });
    expect(WebBrowser.coolDownAsync).toHaveBeenCalledTimes(1);
  });

  it('muestra el mensaje de error cuando el acceso falla', async () => {
    const gateway = createGatewayStub();
    gateway.signInWithPassword.mockResolvedValue({
      error: new Error('Correo o contraseña incorrectos.'),
    });
    const renderer = await renderLogin(gateway);
    await act(async () => {
      findButtonByText(renderer, 'Iniciar sesión').props.onPress();
    });
    const alert = renderer.root.findByProps({ accessibilityRole: 'alert' });
    expect(alert.props.children).toBe('Correo o contraseña incorrectos.');
  });
});
