import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { colors } from '../theme';
import { CircularStateButton } from './CircularStateButton';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/** Localiza el Pressable interno (el compuesto también recibe el testID). */
function findPressable(renderer: ReactTestRenderer, testID: string) {
  return renderer.root.findAll(
    (node) =>
      node.props.testID === testID && typeof node.props.onPress === 'function',
  )[0]!;
}

function flattenStyle(style: unknown): Record<string, unknown> {
  const list = (Array.isArray(style) ? style : [style]).flat(Infinity);
  return Object.assign(
    {},
    ...list.filter((entry): entry is object => Boolean(entry)),
  ) as Record<string, unknown>;
}

describe('CircularStateButton', () => {
  it('renderiza un botón circular con el color del estado', async () => {
    let renderer!: ReactTestRenderer;
    await act(async () => {
      renderer = create(
        <CircularStateButton
          accessibilityLabel="Entregada"
          color={colors.success}
          size={40}
          testID="state-button"
        />,
      );
    });
    const button = findPressable(renderer, 'state-button');
    expect(button.props.accessibilityRole).toBe('button');
    const merged = flattenStyle(button.props.style({ pressed: false }));
    expect(merged.backgroundColor).toBe(colors.success);
    expect(merged.borderRadius).toBe(20);
  });

  it('da feedback visual al pulsar sin cambiar su estado', async () => {
    let renderer!: ReactTestRenderer;
    await act(async () => {
      renderer = create(
        <CircularStateButton
          accessibilityLabel="No entregada"
          color={colors.danger}
          testID="state-button"
        />,
      );
    });
    const button = findPressable(renderer, 'state-button');
    const merged = flattenStyle(button.props.style({ pressed: true }));
    expect(merged.opacity).toBeLessThan(1);
    expect(merged.backgroundColor).toBe(colors.danger);
  });
});
