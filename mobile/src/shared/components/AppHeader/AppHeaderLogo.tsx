import { Pressable, Text, StyleSheet } from 'react-native';

import { dp, tizaiaColors } from '../../theme/tizaiaTheme';

type AppHeaderLogoProps = {
  onPress: () => void;
};

/**
 * Logo del header que navega a Home (DESIGN.md §4.1).
 * Extraído de AppDrawerNavigator para mantener la navegación limpia.
 */
export function AppHeaderLogo({
  onPress,
}: AppHeaderLogoProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel="Ir a Home"
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={styles.button}
      testID="header-logo"
    >
      <Text style={styles.logo}>LOGO</Text>
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
  logo: {
    color: tizaiaColors.ink,
    fontSize: dp(38),
    fontWeight: '700',
  },
});
