import { StyleSheet, Text, View } from 'react-native';

import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';

/**
 * Marca de Tizaia en Login (DESIGN.md §5.8, nodo BrandMark n1686): círculo
 * 168px #FFFFFFC7 con halo melocotón y la letra "T" en tinta.
 */
export function BrandMark(): React.JSX.Element {
  return (
    <View
      accessibilityLabel="Logotipo de Tizaia"
      accessibilityRole="image"
      style={styles.mark}
    >
      <View style={styles.halo} />
      <Text style={styles.letter}>T</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    backgroundColor: tizaiaColors.peach,
    borderRadius: dp(60),
    height: dp(120),
    left: dp(24),
    position: 'absolute',
    top: dp(24),
    width: dp(120),
  },
  letter: {
    color: tizaiaColors.inkButton,
    fontSize: dp(64),
    fontWeight: '700',
    textAlign: 'center',
  },
  mark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFFC7',
    borderColor: tizaiaColors.white,
    borderRadius: dp(84),
    borderWidth: 1,
    elevation: 6,
    height: dp(168),
    justifyContent: 'center',
    shadowColor: '#8D5A43',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.19,
    shadowRadius: 17,
    width: dp(168),
  },
});
