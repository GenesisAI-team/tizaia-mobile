import { act } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';

import { colors } from '../theme/theme';
import {
  CircularStatusButton,
  type StatusVariant,
} from './CircularStatusButton';

/**
 * Pressable se exporta memoizado, así que el botón se localiza por sus props
 * accesibles (mismo patrón que LoginScreen.test.tsx).
 */
function findButton(renderer: ReactTestRenderer, testID: string) {
  return renderer.root.find(
    (node) =>
      node.props.testID === testID &&
      node.props.accessibilityRole === 'button' &&
      typeof node.props.onPress === 'function',
  );
}

function resolvedStyle(button: ReactTestInstance, pressed: boolean): ViewStyle {
  const styleProp = button.props.style as (state: {
    pressed: boolean;
  }) => StyleProp<ViewStyle>;
  return StyleSheet.flatten(styleProp({ pressed }));
}

async function renderButton(
  props: React.ComponentProps<typeof CircularStatusButton>,
): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<CircularStatusButton {...props} />);
  });
  return renderer;
}

describe('CircularStatusButton (UI-000)', () => {
  it.each<[StatusVariant, string]>([
    ['success', colors.success],
    ['danger', colors.danger],
    ['warning', colors.warning],
    ['neutral', colors.border],
  ])(
    'mapea la variante %s a su color del tema',
    async (variant, expectedColor) => {
      const renderer = await renderButton({
        accessibilityLabel: 'Celda',
        onPress: () => undefined,
        testID: `cell-${variant}`,
        variant,
      });
      const style = resolvedStyle(
        findButton(renderer, `cell-${variant}`),
        false,
      );
      expect(style.backgroundColor).toBe(expectedColor);
    },
  );

  it('es circular y respeta el tamaño indicado', async () => {
    const renderer = await renderButton({
      accessibilityLabel: 'Celda',
      onPress: () => undefined,
      size: 32,
      testID: 'cell',
      variant: 'success',
    });
    const style = resolvedStyle(findButton(renderer, 'cell'), false);
    expect(style).toMatchObject({ borderRadius: 16, height: 32, width: 32 });
  });

  it('invoca onPress al pulsarse', async () => {
    const onPress = jest.fn();
    const renderer = await renderButton({
      accessibilityLabel: 'Asistencia de Ana el 12/05: Asistido',
      onPress,
      testID: 'cell',
      variant: 'success',
    });
    findButton(renderer, 'cell').props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('expone rol de botón, etiqueta accesible y área táctil ampliada', async () => {
    const renderer = await renderButton({
      accessibilityLabel: 'Asistencia de Ana el 12/05: Tarde',
      onPress: () => undefined,
      testID: 'cell',
      variant: 'warning',
    });
    const button = findButton(renderer, 'cell');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe(
      'Asistencia de Ana el 12/05: Tarde',
    );
    expect(button.props.hitSlop).toBe(8);
  });

  it('se atenúa al pulsarse y cuando está deshabilitado', async () => {
    const renderer = await renderButton({
      accessibilityLabel: 'Celda',
      disabled: true,
      onPress: () => undefined,
      testID: 'cell',
      variant: 'danger',
    });
    const button = findButton(renderer, 'cell');
    expect(button.props.disabled).toBe(true);
    expect(button.props.accessibilityState).toEqual({ disabled: true });
    expect(resolvedStyle(button, true).opacity).toBe(0.6);
    expect(resolvedStyle(button, false).opacity).toBe(0.6);
  });
});
