import { act } from 'react';
import { Text } from 'react-native';
import {
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';

import { AppDependenciesProvider } from '../../../app/AppDependenciesProvider';
import type { AppDependencies } from '../../../app/createAppDependencies';
import { FakeAuthGateway } from '../../auth/infrastructure/fakeAuthGateway';
import { createSchoolRepositoryStub } from '../../../test/schoolRepositoryStubs';
import type {
  AssistantGateway,
  AssistantRequest,
  AssistantResponse,
} from '../domain/assistantGateway';
import { FakeAssistantGateway } from '../../assistant/infrastructure/fakeAssistantGateway';
import { HomeScreen } from './HomeScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('@react-navigation/elements', () => ({
  useHeaderHeight: () => 0,
}));
const mockNavigate = jest.fn();

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/** Gateway que reproduce un primer envío fallido (red/timeout). */
class RejectingAssistantGateway implements AssistantGateway {
  public readonly requests: AssistantRequest[] = [];

  public async sendMessage(
    request: AssistantRequest,
  ): Promise<AssistantResponse> {
    this.requests.push(request);
    throw new Error('asistente sin conexión');
  }
}

function createDependencies(gateway: AssistantGateway): AppDependencies {
  return {
    authGateway: new FakeAuthGateway(),
    assistantGateway: gateway,
    schoolRepository: createSchoolRepositoryStub(),
  };
}

let activeRenderer: ReactTestRenderer | undefined;

async function renderScreen(
  gateway: AssistantGateway,
): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(
      <AppDependenciesProvider dependencies={createDependencies(gateway)}>
        <HomeScreen />
      </AppDependenciesProvider>,
    );
  });
  activeRenderer = renderer;
  return renderer;
}

afterEach(async () => {
  const renderer = activeRenderer;
  activeRenderer = undefined;
  if (renderer !== undefined) {
    await act(async () => {
      renderer.unmount();
    });
  }
});

function findPressableByTestId(
  renderer: ReactTestRenderer,
  testID: string,
): ReactTestInstance {
  const nodes = renderer.root.findAll(
    (node) => node.props.testID === testID && node.props.onPress != null,
  );
  if (nodes.length === 0) throw new Error(`No encontrado: ${testID}`);
  return nodes[0]!;
}

function findQuickActionTestIDs(renderer: ReactTestRenderer): string[] {
  // Las copias internas del Pressable reenvían testID al View pero sin
  // onPress: exigir onPress deja exactamente una instancia por tarjeta.
  return renderer.root
    .findAll(
      (node) =>
        node.props.onPress != null &&
        typeof node.props.testID === 'string' &&
        node.props.testID.startsWith('home-quick-action-'),
    )
    .map((node) => String(node.props.testID));
}

function textsOf(renderer: ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .filter((children): children is string => typeof children === 'string');
}

async function typeDraft(
  renderer: ReactTestRenderer,
  value: string,
): Promise<void> {
  const input = renderer.root.findByProps({
    accessibilityLabel: 'Mensaje para el asistente',
  }) as ReactTestInstance;
  await act(async () => {
    input.props.onChangeText(value);
  });
}

async function pressSend(renderer: ReactTestRenderer): Promise<void> {
  const sendButton = findPressableByTestId(renderer, 'send-button');
  await act(async () => {
    sendButton.props.onPress();
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const GREETING = 'Hola 👋 ¿Qué necesitas hoy?';

describe('HomeScreen · bienvenida y accesos rápidos (MOB-HOME-001)', () => {
  it('muestra la bienvenida y el compositor, sin saludo en el historial del chat', async () => {
    const renderer = await renderScreen(new FakeAssistantGateway());

    expect(textsOf(renderer)).toContain(GREETING);
    expect(textsOf(renderer)).not.toContain(
      'Buenas 👋 ¿En qué te puedo ayudar?',
    );

    const testIds = findQuickActionTestIDs(renderer);
    expect(testIds.length).toBeGreaterThanOrEqual(3);
    expect(testIds.length).toBeLessThanOrEqual(4);
    expect(new Set(testIds).size).toBe(testIds.length);
    for (const testId of testIds) {
      expect(testId).toMatch(
        /^home-quick-action-(Attendance|Students|Tasks|Mail|Annotations)$/,
      );
    }

    expect(
      renderer.root.findAllByProps({
        accessibilityLabel: 'Mensaje para el asistente',
      }).length,
    ).toBeGreaterThanOrEqual(1);
    expect(findPressableByTestId(renderer, 'send-button').props.disabled).toBe(
      true,
    );
  });

  it('cada acción navega a su módulo sin invocar el asistente', async () => {
    // Cubrimos los cuatro conjuntos fijando el azar: la unión de rutas
    // debe ser la de los cinco módulos.
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const pressedRoutes = new Set<string>();
      const EXPECTED_BY_LABEL: [string, string][] = [
        ['Abrir el módulo de Asistencia', 'Attendance'],
        ['Abrir el módulo de Alumnos', 'Students'],
        ['Abrir el módulo de Tareas', 'Tasks'],
        ['Abrir el módulo de Anotaciones', 'Annotations'],
        ['Abrir el módulo de Mails', 'Mail'],
      ];

      for (const seed of [0, 0.25, 0.5, 0.75]) {
        randomSpy.mockReturnValue(seed);
        const renderer = await renderScreen(new FakeAssistantGateway());
        try {
          for (const [label, route] of EXPECTED_BY_LABEL) {
            const cards = renderer.root.findAll(
              (node) =>
                node.props.accessibilityLabel === label &&
                node.props.onPress != null,
            );
            if (cards.length === 0) continue;
            await act(async () => {
              cards[0]!.props.onPress();
            });
            expect(mockNavigate).toHaveBeenCalledWith(route);
            pressedRoutes.add(route);
          }
          expect(mockNavigate.mock.calls.length).toBeGreaterThanOrEqual(3);
        } finally {
          await act(async () => {
            renderer.unmount();
          });
          activeRenderer = undefined;
        }
      }

      expect(pressedRoutes).toEqual(
        new Set(['Attendance', 'Students', 'Tasks', 'Mail', 'Annotations']),
      );
    } finally {
      randomSpy.mockRestore();
    }
  });

  it('escribir oculta la bienvenida suavemente y borrar la recupera', async () => {
    const renderer = await renderScreen(new FakeAssistantGateway());

    await typeDraft(renderer, '¿Qué tengo hoy?');
    expect(textsOf(renderer)).not.toContain(GREETING);
    expect(findQuickActionTestIDs(renderer)).toHaveLength(0);

    // Espacios: para el compositor sigue siendo borrador vacío (recorte).
    await typeDraft(renderer, '   ');
    expect(textsOf(renderer)).toContain(GREETING);

    await typeDraft(renderer, '');
    expect(textsOf(renderer)).toContain(GREETING);
    expect(findQuickActionTestIDs(renderer).length).toBeGreaterThanOrEqual(3);
  });

  it('el primer envío inicia la conversación y retira la bienvenida definitivamente', async () => {
    const gateway = new FakeAssistantGateway();
    const renderer = await renderScreen(gateway);

    await typeDraft(renderer, '¿Qué tengo hoy?');
    await pressSend(renderer);

    expect(textsOf(renderer)).toContain('¿Qué tengo hoy?');
    expect(textsOf(renderer)).toContain('Fake response: ¿Qué tengo hoy?');
    expect(textsOf(renderer)).not.toContain(GREETING);
    expect(gateway.requests).toEqual([
      { message: '¿Qué tengo hoy?', conversationId: undefined },
    ]);

    // Aunque se vacíe el borrador, la bienvenida no vuelve a esta visita.
    await typeDraft(renderer, '');
    expect(textsOf(renderer)).not.toContain(GREETING);

    // El identificador de conversación se conserva en el turno siguiente.
    await typeDraft(renderer, 'Y mañana');
    await pressSend(renderer);
    expect(gateway.requests[1]).toEqual({
      message: 'Y mañana',
      conversationId: 'fake-conversation',
    });
  });

  it('un primer envío fallido muestra el error y no restaura la bienvenida', async () => {
    const gateway = new RejectingAssistantGateway();
    const renderer = await renderScreen(gateway);

    await typeDraft(renderer, 'Buenos días');
    await pressSend(renderer);

    expect(textsOf(renderer)).toContain('asistente sin conexión');
    expect(gateway.requests).toHaveLength(1);

    await typeDraft(renderer, '');
    expect(textsOf(renderer)).not.toContain(GREETING);
    expect(findQuickActionTestIDs(renderer)).toHaveLength(0);
  });

  it('navegar a un módulo y volver no reinicia la conversación ni el historial', async () => {
    const gateway = new FakeAssistantGateway();
    const renderer = await renderScreen(gateway);

    await typeDraft(renderer, 'Primera consulta');
    await pressSend(renderer);
    expect(textsOf(renderer)).toContain('Fake response: Primera consulta');

    // "Volver a Home": la instancia de pantalla persiste en el Drawer; el
    // historial y el compositor siguen intactos, sin bienvenida.
    const card = findQuickActionTestIDs(renderer);
    expect(card).toHaveLength(0);
    await typeDraft(renderer, 'Segunda');
    await pressSend(renderer);
    expect(gateway.requests).toHaveLength(2);
    expect(textsOf(renderer)).toContain('Fake response: Primera consulta');
  });
});
