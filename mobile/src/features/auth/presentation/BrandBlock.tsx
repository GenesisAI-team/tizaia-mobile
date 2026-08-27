import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';
import { BrandMark } from './BrandMark';

type BrandBlockProps = {
  style?: StyleProp<ViewStyle>;
};

/**
 * Bloque de marca de Tizaia (DESIGN.md §5.8): BrandMark + "TIZAIA" + tagline.
 * Compartido por LoginScreen y AuthLoadingScreen para no duplicar estilos.
 */
export function BrandBlock({ style }: BrandBlockProps): React.JSX.Element {
  return (
    <View style={[styles.block, style]}>
      <BrandMark />
      <Text style={styles.brand}>TIZAIA</Text>
      <Text style={styles.tagline}>Tu aula, más cerca</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
  },
  brand: {
    color: tizaiaColors.ink,
    fontSize: dp(44),
    fontWeight: '700',
    letterSpacing: dp(7),
    marginTop: dp(16),
    textAlign: 'center',
  },
  tagline: {
    color: tizaiaColors.textSecondary,
    fontSize: dp(20),
    marginTop: dp(2),
    textAlign: 'center',
  },
});
