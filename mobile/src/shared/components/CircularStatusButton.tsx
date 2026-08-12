import { Pressable, StyleSheet } from 'react-native';

import { theme } from '../theme';

/**
 * Variantes visuales del botón circular de estado (contrato UI-000, issue #16).
 * La semántica de cada pantalla (asistencia, tareas, etc.) se mapea a estas
 * variantes en la capa de la feature.
 */
export type CircularStatusVariant =
  'success' | 'danger' | 'warning' | 'neutral';

export type CircularStatusButtonProps = {
  variant: CircularStatusVariant;
  accessibilityLabel: string;
  onPress?: () => void;
  size?: number;
  testID?: string;
};

const VARIANT_COLORS: Record<CircularStatusVariant, string> = {
  danger: theme.colors.statusDanger,
  neutral: theme.colors.statusNeutral,
  success: theme.colors.statusSuccess,
  warning: theme.colors.statusWarning,
};

/**
 * Botón circular de estado, puramente visual. No gestiona ciclo de estados ni
 * persistencia; como mucho notifica la pulsación mediante `onPress`.
 */
export function CircularStatusButton({
  variant,
  accessibilityLabel,
  onPress,
  size = 36,
  testID,
}: CircularStatusButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: VARIANT_COLORS[variant],
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
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.6,
  },
});
