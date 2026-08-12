import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme/designTokens';

type StatusCircleButtonProps = {
  accessibilityLabel: string;
  color?: string;
  disabled?: boolean;
  onPress?: () => void;
  size?: number;
  testID?: string;
};

const DEFAULT_SIZE = 36;

/** Botón circular visual para celdas de Asistencia/Tareas. Sin lógica de negocio. */
export function StatusCircleButton({
  accessibilityLabel,
  color = colors.surface,
  disabled = false,
  onPress,
  size = DEFAULT_SIZE,
  testID,
}: StatusCircleButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: size / 2,
          height: size,
          width: size,
        },
        pressed && styles.pressed,
      ]}
      testID={testID}
    >
      <View
        style={[
          styles.inner,
          {
            backgroundColor: color,
            borderRadius: size / 2,
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  inner: {
    flex: 1,
    width: '100%',
  },
  pressed: {
    opacity: 0.72,
  },
});
