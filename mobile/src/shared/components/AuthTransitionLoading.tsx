import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from './BrandMark';
import { ScreenBackground } from './ScreenBackground';
import { dp, tizaiaColors } from '../theme/tizaiaTheme';

/**
 * Transición breve con identidad TizaIA (issue #94, refinado #98).
 * Micro-loading estático que sustituye al loader blanco genérico de `App.tsx`.
 * Fondo degradado + marca compartida (`BrandMark` variant loading, 72dp) +
 * palabra TIZAIA estática + ActivityIndicator discreto.
 * Sin animación de letras ni delays artificiales: si `isLoading` termina
 * inmediatamente, se desmonta inmediatamente. Sirve para restauración inicial,
 * login con Google/password y cierre de sesión (mismo `isLoading`).
 */
export function AuthTransitionLoading(): React.JSX.Element {
  return (
    <ScreenBackground>
      <View
        accessibilityLabel="Cargando TizaIA"
        accessibilityRole="progressbar"
        style={styles.container}
      >
        <BrandMark variant="loading" />
        <Text style={styles.word}>TIZAIA</Text>
        <ActivityIndicator
          accessibilityLabel="Cargando"
          color={tizaiaColors.inkButton}
          size="small"
          style={styles.spinner}
        />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: dp(32),
  },
  spinner: {
    marginTop: dp(24),
  },
  word: {
    color: tizaiaColors.ink,
    fontSize: dp(28),
    fontWeight: '700',
    letterSpacing: dp(7),
    marginTop: dp(24),
    textAlign: 'center',
  },
});
