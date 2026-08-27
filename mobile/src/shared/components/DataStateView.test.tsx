import { ActivityIndicator, Text, View } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import type { ResourceState } from '../state/schoolDataProvider';
import { DataStateView } from './DataStateView';

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const HOST_SKELETON = 'skeleton-test-block';

const skeleton = <View testID={HOST_SKELETON} />;

const isHostWith =
  (testID: string) =>
  (node: { type: unknown; props: Record<string, unknown> }) =>
    typeof node.type === 'string' && node.props.testID === testID;

describe('DataStateView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loading sin skeleton muestra el spinner global', () => {
    let tree: ReactTestRenderer | undefined;
    act(() => {
      tree = create(<DataStateView state={{ status: 'loading' }} />);
    });

    expect(tree?.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(tree?.root.findAll(isHostWith(HOST_SKELETON))).toHaveLength(0);

    act(() => tree?.unmount());
  });

  it('loading con skeleton muestra el skeleton accesible y no el spinner', () => {
    let tree: ReactTestRenderer | undefined;
    act(() => {
      tree = create(
        <DataStateView skeleton={skeleton} state={{ status: 'loading' }} />,
      );
    });

    expect(tree?.root.findAll(isHostWith(HOST_SKELETON))).toHaveLength(1);
    expect(tree?.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    const container = tree?.root.find(
      (node) =>
        typeof node.type === 'string' &&
        node.props.accessibilityLabel === 'Cargando contenido',
    );
    expect(container).toBeDefined();

    act(() => tree?.unmount());
  });

  it('success no renderiza nada (la pantalla pinta su contenido)', () => {
    let tree: ReactTestRenderer | undefined;
    act(() => {
      tree = create(
        <DataStateView
          skeleton={skeleton}
          state={
            { status: 'success', data: [] } as unknown as ResourceState<
              unknown[]
            >
          }
        />,
      );
    });

    expect(tree?.toJSON()).toBeNull();
  });

  it('empty muestra el mensaje sin skeleton', () => {
    let tree: ReactTestRenderer | undefined;
    act(() => {
      tree = create(
        <DataStateView
          emptyMessage="No hay alumnos."
          skeleton={skeleton}
          state={{ status: 'empty' }}
        />,
      );
    });

    expect(tree?.root.findAllByType(Text)[0]?.props.children).toBe(
      'No hay alumnos.',
    );
    expect(tree?.root.findAll(isHostWith(HOST_SKELETON))).toHaveLength(0);

    act(() => tree?.unmount());
  });

  it('error muestra mensaje, reintento y ningún skeleton', () => {
    let tree: ReactTestRenderer | undefined;
    act(() => {
      tree = create(
        <DataStateView
          onRetry={jest.fn()}
          skeleton={skeleton}
          state={{ status: 'error' as const, error: 'Temporal' }}
        />,
      );
    });

    expect(tree?.root.findAll(isHostWith('data-state-retry'))).toHaveLength(1);
    expect(
      tree?.root
        .findAllByType(Text)
        .some(
          (node) => node.props.children === 'No se pudieron cargar los datos',
        ),
    ).toBe(true);
    expect(tree?.root.findAll(isHostWith(HOST_SKELETON))).toHaveLength(0);

    act(() => tree?.unmount());
  });
});
