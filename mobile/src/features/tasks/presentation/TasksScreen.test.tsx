import { act } from 'react';
import { Text } from 'react-native';
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
import { createSchoolRepositoryStub } from '../../../test/schoolRepositoryStubs';
import { TasksScreen } from './TasksScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type RepoStub = ReturnType<typeof createSchoolRepositoryStub>;

function createDependencies(repo: RepoStub): AppDependencies {
  return {
    authGateway: new FakeAuthGateway(),
    assistantGateway: new FakeAssistantGateway(),
    schoolRepository: repo,
  };
}

/**
 * El FlatList de `MatrixBoard` programa recálculos de ventana con timers;
 * desmontamos dentro de `act` para que no queden actualizaciones fuera del
 * ciclo de pruebas.
 */
let activeRenderer: ReactTestRenderer | undefined;

async function renderScreen(repo: RepoStub): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(
      <AppDependenciesProvider dependencies={createDependencies(repo)}>
        <SchoolDataProvider>
          <TasksScreen />
        </SchoolDataProvider>
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

function findAllByTestId(
  renderer: ReactTestRenderer,
  testID: string,
): ReactTestInstance[] {
  return renderer.root.findAll((node) => node.props.testID === testID);
}

function textContents(renderer: ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map((node) => String(node.props.children));
}

describe('TasksScreen con bootstrap de centro completo', () => {
  it('muestra solo tareas y alumnado de la clase activa', async () => {
    const repo = createSchoolRepositoryStub();
    const renderer = await renderScreen(repo);

    const texts = textContents(renderer);
    expect(texts).toContain('Práctica 1');
    // La tarea de la otra clase no aparece como columna…
    expect(texts).not.toContain('Tarea de otra clase');

    const labels = renderer.root
      .findAll((node) => typeof node.props.accessibilityLabel === 'string')
      .map((node) => node.props.accessibilityLabel as string);
    expect(labels).toContain('Foto de Ana García');
    expect(labels).not.toContain('Foto de Carla Ruiz');
    // …ni su entrega tiene celda.
    expect(findAllByTestId(renderer, 'matrix-cell-s-1:as-other')).toHaveLength(
      0,
    );
  });

  it('registra el ciclo de entrega de una tarea de la clase activa', async () => {
    const repo = createSchoolRepositoryStub();
    const renderer = await renderScreen(repo);

    const cell = renderer.root.find(
      (node) => node.props.testID === 'matrix-cell-s-1:as-1',
    );
    await act(async () => {
      cell.props.onPress();
    });

    // La celda servida estaba "submitted"; el ciclo pasa a "notSubmitted".
    expect(repo.setSubmissionStatus).toHaveBeenCalledTimes(1);
    expect(repo.setSubmissionStatus).toHaveBeenCalledWith({
      assignmentId: 'as-1',
      studentId: 's-1',
      status: 'notSubmitted',
    });
  });
});
