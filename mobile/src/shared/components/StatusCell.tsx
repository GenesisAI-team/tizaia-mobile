import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dp, tizaiaColors } from '../theme/tizaiaTheme';

export type StatusCellState = 'done' | 'undone' | 'pending';

type StatusCellProps = {
  accessibilityLabel: string;
  /** En Tareas el pendiente no tiene fondo (DESIGN.md §4.8). */
  pendingTransparent?: boolean;
  onPress?: () => void;
  state: StatusCellState;
  testID?: string;
};

/** Fondo de la celda según estado (DESIGN.md §4.8). */
export const getStatusCellBackground = (
  state: StatusCellState,
  pendingTransparent = false,
): string => {
  if (state === 'done') return tizaiaColors.cellDone;
  if (state === 'undone') return tizaiaColors.cellUndone;
  return pendingTransparent ? 'transparent' : tizaiaColors.cellPending;
};

/**
 * Celda de las matrices de Asistencia/Tareas (DESIGN.md §4.8): 108×88 con
 * botón circular interior de 52px según estado (✓ / × / ⌛).
 */
export function StatusCell({
  accessibilityLabel,
  pendingTransparent = false,
  onPress,
  state,
  testID,
}: StatusCellProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cell,
        { backgroundColor: getStatusCellBackground(state, pendingTransparent) },
        pressed && styles.pressed,
      ]}
      testID={testID}
    >
      <View style={styles.button}>
        {state === 'done' && <Text style={styles.doneGlyph}>✓</Text>}
        {state === 'undone' && <Text style={styles.undoneGlyph}>×</Text>}
        {state === 'pending' && (
          <View style={styles.pendingInner}>
            <Text style={styles.pendingGlyph}>⌛</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.inkButton,
    borderRadius: dp(26),
    height: dp(52),
    justifyContent: 'center',
    width: dp(52),
  },
  cell: {
    alignItems: 'center',
    borderRadius: dp(22),
    height: dp(88),
    justifyContent: 'center',
    width: dp(108),
  },
  doneGlyph: {
    color: tizaiaColors.white,
    fontSize: dp(30),
    fontWeight: '700',
    lineHeight: dp(36),
    textAlign: 'center',
  },
  pendingGlyph: {
    color: tizaiaColors.inkButton,
    fontSize: dp(26),
    lineHeight: dp(32),
    textAlign: 'center',
  },
  pendingInner: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.white,
    borderRadius: dp(22),
    height: dp(44),
    justifyContent: 'center',
    width: dp(44),
  },
  pressed: {
    opacity: 0.75,
  },
  undoneGlyph: {
    color: tizaiaColors.white,
    fontSize: dp(34),
    fontWeight: '700',
    lineHeight: dp(38),
    textAlign: 'center',
  },
});
