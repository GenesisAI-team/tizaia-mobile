import { Pressable, StyleSheet } from 'react-native';

import { BrandMark } from '../BrandMark';

type AppHeaderLogoProps = {
  onPress: () => void;
};

/**
 * Logo del header que navega a Home (DESIGN.md §4.1).
 * Extraído de AppDrawerNavigator para mantener la navegación limpia.
 * Reutiliza la fuente única BrandMark con la variante compacta `header`.
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
      {/* accessible=false: el botón ya anuncia "Ir a Home"; evitar doble lectura */}
      <BrandMark accessible={false} variant="header" />
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
});
