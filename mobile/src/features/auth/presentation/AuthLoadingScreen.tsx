import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ScreenBackground } from '../../../shared/components/ScreenBackground';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';
import { BrandBlock } from './BrandBlock';

/**
 * Pantalla de restauración global de sesión con identidad TizaIA
 * (AUTH-UX-086): fondo degradado + marca + loader discreto. Sustituye a la
 * LoadingScreen blanca genérica. Solo se usa para estados globales de auth
 * (isInitializing), nunca mientras la LoginScreen está operando.
 */
export function AuthLoadingScreen(): React.JSX.Element {
  return (
    <ScreenBackground>
      <View style={styles.content}>
        <BrandBlock />
        <ActivityIndicator
          accessibilityLabel="Restaurando sesión"
          color={tizaiaColors.inkButton}
          size="small"
          style={styles.loader}
        />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loader: {
    marginTop: dp(48),
  },
});
