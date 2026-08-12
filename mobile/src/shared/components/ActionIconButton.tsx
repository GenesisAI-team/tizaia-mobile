import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../theme/designTokens';

type ActionIconButtonProps = {
  accessibilityLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  size?: number;
  testID?: string;
};

const DEFAULT_SIZE = 44;

/** Botón táctil para iconos de acción; el contenido visual lo aporta el icono hijo. */
export function ActionIconButton({
  accessibilityLabel,
  children,
  disabled = false,
  onPress,
  size = DEFAULT_SIZE,
  testID,
}: ActionIconButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderRadius: size / 2, height: size, width: size },
        (pressed || disabled) && styles.dimmed,
      ]}
      testID={testID}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  dimmed: {
    opacity: 0.6,
  },
});
