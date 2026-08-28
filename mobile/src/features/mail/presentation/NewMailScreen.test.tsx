import { act } from 'react';
import { Alert, Text, TextInput } from 'react-native';
import {
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';

import { AppDependenciesProvider } from '../../../app/AppDependenciesProvider';
import type { AppDependencies } from '../../../app/createAppDependencies';
import { FakeAssistantGateway } from '../../assistant/infrastructure/fakeAssistantGateway';
import { FakeAuthGateway } from '../../auth/infrastructure/fakeAuthGateway';
import { SchoolDataProvider } from '../../../shared/state/schoolDataProvider';
import { AppBootstrapProvider } from '../../../shared/state/appBootstrapProvider';
import { createSchoolRepositoryStub } from '../../../test/schoolRepositoryStubs';
import { NewMailScreen } from './NewMailScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: mockRouteParams }),
}));
jest.mock('@react-navigation/elements', () => ({
  useHeaderHeight: () => 0,
}));
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRouteParams: { studentId?: string } = { studentId: 's-1' };

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type RepoStub = ReturnType<typeof createSchoolRepositoryStub>;

function createTree(): React.JSX.Element {
  return (
    <AppDependenciesProvider dependencies={createDeps}>
      <SchoolDataProvider>
        <AppBootstrapProvider>
          <NewMailScreen />
        </AppBootstrapProvider>
      </SchoolDataProvider>
    </AppDependenciesProvider>
  );
}

let createDeps!: AppDependencies;
let repo!: RepoStub;

/**
 * Desmontamos dentro de `act` para que no queden actualizaciones programadas
 * (p. ej. recursos async) fuera del ciclo de pruebas.
 */
let activeRenderer: ReactTestRenderer | undefined;

async function renderScreen(): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(createTree());
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
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

function findByTestId(
  renderer: ReactTestRenderer,
  testID: string,
): ReactTestInstance {
  const nodes = renderer.root.findAll(
    (node) => node.props.testID === testID && node.props.onPress != null,
  );
  if (nodes.length === 0) throw new Error(`No encontrado: ${testID}`);
  return nodes[0]!;
}

function textsOf(renderer: ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map((node) => String(node.props.children));
}

async function typeInput(
  renderer: ReactTestRenderer,
  accessibilityLabel: string,
  value: string,
): Promise<void> {
  const input = renderer.root
    .findAllByType(TextInput)
    .find((node) => node.props.accessibilityLabel === accessibilityLabel);
  if (!input) throw new Error(`Input no encontrado: ${accessibilityLabel}`);
  await act(async () => {
    input.props.onChangeText(value);
  });
}

describe('NewMailScreen con destinatarios precargados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repo = createSchoolRepositoryStub();
    createDeps = {
      authGateway: new FakeAuthGateway(),
      assistantGateway: new FakeAssistantGateway(),
      schoolRepository: repo,
    };
    mockRouteParams.studentId = 's-1';
  });

  it('precarga familia y grupo del alumno y permite quitarlos de verdad', async () => {
    const renderer = await renderScreen();

    // La precarga siembra los dos chips del alumno de la ruta.
    expect(textsOf(renderer)).toContain('Familia de Ana');
    expect(textsOf(renderer)).toContain('1.º BACHILLER D');

    await act(async () => {
      findByTestId(renderer, 'mail-remove-family-s-1').props.onPress();
    });

    expect(textsOf(renderer)).not.toContain('Familia de Ana');

    // Regresión del bug original: el precargado NO reaparece al rerenderizar.
    await act(async () => {
      renderer.update(createTree());
    });
    expect(textsOf(renderer)).not.toContain('Familia de Ana');
    expect(textsOf(renderer)).toContain('1.º BACHILLER D');
  });

  it('envía solo con los destinatarios que siguen seleccionados', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const renderer = await renderScreen();

    await act(async () => {
      findByTestId(renderer, 'mail-remove-family-s-1').props.onPress();
    });
    await typeInput(renderer, 'Asunto del mensaje', 'Saludos');
    await typeInput(renderer, 'Cuerpo del mensaje', 'Buenos días');
    await act(async () => {
      findByTestId(renderer, 'mail-send-button').props.onPress();
    });

    expect(repo.sendMail).toHaveBeenCalledTimes(1);
    expect(repo.sendMail).toHaveBeenCalledWith({
      subject: 'Saludos',
      body: 'Buenos días',
      recipientIds: ['group-class-1'],
    });
    expect(mockGoBack).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it('marca como añadidos los precargados en el selector y deduplica', async () => {
    const renderer = await renderScreen();

    await act(async () => {
      findByTestId(renderer, 'mail-add-families').props.onPress();
    });

    // La familia precargada aparece ya como añadida (deshabilitada).
    expect(
      renderer.root.find((node) => node.props.testID === 'mail-pick-family-s-1')
        .props.disabled,
    ).toBe(true);

    // Añadir otra familia nueva sí está habilitado y la incorpora una vez.
    await act(async () => {
      findByTestId(renderer, 'mail-pick-family-s-2').props.onPress();
    });
    expect(
      textsOf(renderer).filter((text) => text === 'Familia de Bruno'),
    ).toHaveLength(1);
  });
});
