import { act } from 'react';
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
import {
  ACTIVE_CLASS_ID,
  createSchoolRepositoryStub,
} from '../../../test/schoolRepositoryStubs';
import { AttendanceScreen } from './AttendanceScreen';

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
          <AppBootstrapProvider>
            <AttendanceScreen />
          </AppBootstrapProvider>
        </SchoolDataProvider>
      </AppDependenciesProvider>,
    );
  });
  // #76: bootstrap mínimo + board son 2 fetches secuenciales
  await act(async () => {
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

function findAllByTestId(
  renderer: ReactTestRenderer,
  testID: string,
): ReactTestInstance[] {
  return renderer.root.findAll((node) => node.props.testID === testID);
}

describe('AttendanceScreen con boards por clase (#76)', () => {
  it('muestra solo el alumnado de la clase activa', async () => {
    const repo = createSchoolRepositoryStub();
    const renderer = await renderScreen(repo);

    const labels = renderer.root
      .findAll((node) => typeof node.props.accessibilityLabel === 'string')
      .map((node) => node.props.accessibilityLabel as string);
    expect(labels).toContain('Foto de Ana García');
    expect(labels).toContain('Foto de Bruno Díaz');
    // El alumno de la otra clase nunca llega a renderizarse…
    expect(labels).not.toContain('Foto de Carla Ruiz');
    // …y por tanto tampoco tiene celda en la matriz.
    expect(
      findAllByTestId(renderer, 'matrix-cell-s-3:2026-08-19'),
    ).toHaveLength(0);
  });

  it('registra asistencia del alumno activo con el classId de la clase activa', async () => {
    const repo = createSchoolRepositoryStub();
    const renderer = await renderScreen(repo);

    const cell = renderer.root.find(
      (node) => node.props.testID === 'matrix-cell-s-1:2026-08-19',
    );
    await act(async () => {
      cell.props.onPress();
    });

    // La celda servida estaba "present"; el ciclo pasa a "absent".
    expect(repo.setAttendanceStatus).toHaveBeenCalledTimes(1);
    expect(repo.setAttendanceStatus).toHaveBeenCalledWith({
      classId: ACTIVE_CLASS_ID,
      studentId: 's-1',
      date: '2026-08-19',
      status: 'absent',
    });
  });
});
