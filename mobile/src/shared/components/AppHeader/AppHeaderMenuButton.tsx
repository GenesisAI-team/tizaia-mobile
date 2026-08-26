import { Pressable, View, StyleSheet } from 'react-native';

import { dp, tizaiaColors } from '../../theme/tizaiaTheme';

type AppHeaderMenuButtonProps = {
  onPress: () => void;
};

/**
 * Botón hamburguesa del header que abre el drawer (DESIGN.md §4.1).
 * Extraído de AppDrawerNavigator para mantener la navegación limpia.
 */
export function AppHeaderMenuButton({
  onPress,
}: AppHeaderMenuButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel="Abrir menú"
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={styles.button}
      testID="header-menu-button"
    >
      <View style={styles.icon}>
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.line} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    minHeight: 48,
    minWidth: 48,
  },
  icon: {
    gap: dp(8),
    height: dp(44),
    justifyContent: 'center',
    width: dp(52),
  },
  line: {
    backgroundColor: tizaiaColors.ink,
    borderRadius: dp(3),
    height: dp(5),
    width: dp(48),
  },
});
