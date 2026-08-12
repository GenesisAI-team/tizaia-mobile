import { Pressable, StyleSheet } from 'react-native';

type CircularStateButtonProps = {
  /** Color de fondo del estado visual que representa (p. ej. entregada/no entregada). */
  color: string;
  accessibilityLabel: string;
  size?: number;
  testID?: string;
};

const DEFAULT_SIZE = 40;

/**
 * Botón circular de estado (contrato UI-000, issue #16).
 * Puramente visual: es pulsable y da feedback al dedo, pero no alterna
 * estado ni persiste nada; la lógica llega con las fases funcionales.
 */
export function CircularStateButton({
  color,
  accessibilityLabel,
  size = DEFAULT_SIZE,
  testID,
}: CircularStateButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={4}
      onPress={() => undefined}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: color,
          borderRadius: size / 2,
          height: size,
          width: size,
        },
        pressed && styles.pressed,
      ]}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.9 }],
  },
});
