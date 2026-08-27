import { AccessibilityInfo } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import { Skeleton, SkeletonCircle, SkeletonText } from './Skeleton';

const isHostWith =
  (testID: string) =>
  (node: { type: unknown; props: Record<string, unknown> }) =>
    typeof node.type === 'string' && node.props.testID === testID;

describe('Skeleton', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renderiza Skeleton, SkeletonText y SkeletonCircle', () => {
    let tree: ReactTestRenderer | undefined;
    act(() => {
      tree = create(
        <>
          <Skeleton height={16} testID="skeleton-block" />
          <SkeletonText testID="skeleton-line" width="60%" />
          <SkeletonCircle size={46} testID="skeleton-circle" />
        </>,
      );
    });

    expect(tree?.root.findAll(isHostWith('skeleton-block'))).toHaveLength(1);
    expect(tree?.root.findAll(isHostWith('skeleton-line'))).toHaveLength(1);
    expect(tree?.root.findAll(isHostWith('skeleton-circle'))).toHaveLength(1);

    act(() => tree?.unmount());
  });

  it('oculta los bloques al lector de pantalla', () => {
    let tree: ReactTestRenderer | undefined;
    act(() => {
      tree = create(<SkeletonCircle size={46} testID="skeleton-circle" />);
    });

    const host = tree?.root.find(isHostWith('skeleton-circle'));
    expect(host?.props.accessible).toBe(false);
    expect(host?.props.importantForAccessibility).toBe('no-hide-descendants');

    act(() => tree?.unmount());
  });

  it('consulta reducir movimiento del sistema', () => {
    let tree: ReactTestRenderer | undefined;
    act(() => {
      tree = create(<Skeleton height={16} testID="skeleton-block" />);
    });

    expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled();

    act(() => tree?.unmount());
  });
});
