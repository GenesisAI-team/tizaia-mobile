import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../theme/theme';

/**
 * Variantes visuales del botón circular de estado. El componente solo mapea
 * variante → color; NO conoce los estados de negocio ni sus ciclos
 * (BR-ASIS-001: Asistido → No asistido → Tarde; BR-TASK-001:
 * No entregada ↔ Entregada). Esa traducción la hará cada pantalla.
 */
export type StatusVariant = 'success' | 'danger' | 'warning' | 'neutral';

const VARIANT_COLORS: Record<StatusVariant, string> = {
  success: colors.success,
  danger: colors.danger,
  warning: colors.warning,
  neutral: colors.border,
};

type CircularStatusButtonProps = {
  variant: StatusVariant;
  onPress: () => void;
  /** Obligatoria: describe alumno, fecha/tarea y estado actual. */
  accessibilityLabel: string;
  disabled?: boolean;
  size?: number;
  testID?: string;
};

const DEFAULT_SIZE = 40;
/** Amplía el área táctil efectiva (48+ dp) sin inflar la celda visual. */
const HIT_SLOP = 8;

/**
 * Botón circular de estado para las celdas de las matrices de Asistencia
 * (HU-004, RF-ASIS-004) y Tareas (HU-007): muestra el estado solo por color.
 * Contrato compartido UI-000 (issue #16); puramente visual, sin persistencia
 * ni ciclo de estados.
 */
export function CircularStatusButton({
  variant,
  onPress,
  accessibilityLabel,
  disabled = false,
  size = DEFAULT_SIZE,
  testID,
}: CircularStatusButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: VARIANT_COLORS[variant],
          borderRadius: size / 2,
          height: size,
          width: size,
        },
        (pressed || disabled) && styles.dimmed,
      ]}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.6,
  },
});
