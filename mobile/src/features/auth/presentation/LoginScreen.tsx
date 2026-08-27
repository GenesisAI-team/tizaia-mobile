import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GlassCard } from '../../../shared/components/GlassCard';
import { GoogleGIcon } from '../../../shared/components/GoogleGIcon';
import { ScreenBackground } from '../../../shared/components/ScreenBackground';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';
import { useAuth } from '../application/AuthProvider';
import { BrandBlock } from './BrandBlock';

/**
 * Pantalla Login definitiva (DESIGN.md §5.8, frame n1681 de Tizaia.op).
 * Conserva el comportamiento de autenticación (HU-001); solo cambia la UI.
 *
 * AUTH-UX-086: durante isAuthenticating la pantalla permanece montada, los
 * botones se deshabilitan y el botón de Google muestra un spinner inline con
 * "Entrando…"; no se sustituye el login por un loader global. El navegador
 * Custom Tab se precalienta al montar (warmUpAsync) y libera al desmontar
 * (coolDownAsync) para reducir la latencia percibida del OAuth.
 */
export function LoginScreen(): React.JSX.Element {
  const { isAuthenticating, error, signInWithGoogle, signInWithPassword } =
    useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const submitEmail = () => {
    void signInWithPassword({ email: email.trim(), password });
  };

  return (
    <ScreenBackground>
      <View pointerEvents="none" style={styles.decorTop} />
      <View pointerEvents="none" style={styles.decorBottom} />
      <KeyboardAvoidingView behavior="height" style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <BrandBlock style={styles.brandBlock} />

          <GlassCard
            cornerRadius={42}
            fill={tizaiaColors.cardStrong}
            style={styles.card}
          >
            <Text style={styles.eyebrow}>BIENVENIDO DE NUEVO</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Iniciar sesión
            </Text>
            <Text style={styles.subtitle}>Continúa donde lo dejaste.</Text>

            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.field}>
              <View style={styles.fieldIcon}>
                <Text style={styles.fieldIconText}>@</Text>
              </View>
              <TextInput
                accessibilityLabel="Correo electrónico"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="profesor@email.com"
                placeholderTextColor={tizaiaColors.placeholder}
                style={styles.input}
                value={email}
              />
            </View>

            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.field}>
              <View style={styles.fieldIcon}>
                <Text style={styles.fieldIconText}>•</Text>
              </View>
              <TextInput
                accessibilityLabel="Contraseña"
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={tizaiaColors.placeholder}
                secureTextEntry={!passwordVisible}
                style={styles.input}
                value={password}
              />
              <Pressable
                accessibilityLabel={
                  passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setPasswordVisible((visible) => !visible)}
                style={styles.passwordToggle}
              >
                <Text style={styles.passwordToggleText}>◉</Text>
              </Pressable>
            </View>

            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>

            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isAuthenticating}
              onPress={submitEmail}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isAuthenticating) && styles.buttonDimmed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
              <Text style={styles.primaryButtonArrow}>→</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isAuthenticating}
              onPress={() => void signInWithGoogle()}
              style={({ pressed }) => [
                styles.googleButton,
                (pressed || isAuthenticating) && styles.buttonDimmed,
              ]}
            >
              {isAuthenticating ? (
                <ActivityIndicator
                  accessibilityLabel="Entrando con Google"
                  color={tizaiaColors.ink}
                  size="small"
                />
              ) : (
                <GoogleGIcon size={dp(40)} />
              )}
              <Text style={styles.googleButtonText}>
                {isAuthenticating ? 'Entrando…' : 'Continuar con Google'}
              </Text>
            </Pressable>
          </GlassCard>

          <Text style={styles.privacy}>
            Al continuar, aceptas las condiciones y la privacidad de Tizaia.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  brandBlock: {
    marginBottom: dp(40),
  },
  buttonDimmed: { opacity: 0.6 },
  card: {
    elevation: 8,
    padding: dp(48),
    shadowColor: '#5C3B30',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    width: '100%',
  },
  decorBottom: {
    backgroundColor: '#F8C4A64D',
    borderRadius: dp(115),
    height: dp(230),
    position: 'absolute',
    right: dp(-62),
    bottom: dp(16),
    width: dp(230),
  },
  decorTop: {
    backgroundColor: '#FFFFFF2E',
    borderRadius: dp(125),
    height: dp(250),
    left: dp(-46),
    position: 'absolute',
    top: dp(82),
    width: dp(250),
  },
  dividerLine: {
    backgroundColor: tizaiaColors.divider,
    flex: 1,
    height: 1,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(24),
    marginVertical: dp(40),
  },
  dividerText: {
    color: tizaiaColors.placeholder,
    fontSize: dp(20),
  },
  error: {
    color: tizaiaColors.danger,
    fontSize: dp(24),
    marginTop: dp(16),
  },
  eyebrow: {
    color: tizaiaColors.accent,
    fontSize: dp(16),
    fontWeight: '700',
    letterSpacing: dp(2.4),
  },
  field: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.fieldBackground,
    borderColor: tizaiaColors.fieldBorder,
    borderRadius: dp(22),
    borderWidth: 1,
    flexDirection: 'row',
    height: dp(82),
    marginBottom: dp(24),
    paddingHorizontal: dp(18),
  },
  fieldIcon: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.peach,
    borderRadius: dp(16),
    height: dp(48),
    justifyContent: 'center',
    width: dp(48),
  },
  fieldIconText: {
    color: tizaiaColors.inkButton,
    fontSize: dp(24),
    fontWeight: '700',
    textAlign: 'center',
  },
  flex: { flex: 1 },
  forgot: {
    color: tizaiaColors.accent,
    fontSize: dp(17),
    fontWeight: '700',
    marginBottom: dp(32),
    textAlign: 'right',
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.white,
    borderColor: tizaiaColors.googleBorder,
    borderRadius: dp(24),
    borderWidth: 1,
    flexDirection: 'row',
    gap: dp(20),
    height: dp(82),
    justifyContent: 'center',
  },
  googleButtonText: {
    color: tizaiaColors.ink,
    fontSize: dp(20),
    fontWeight: '700',
  },
  input: {
    color: tizaiaColors.ink,
    flex: 1,
    fontSize: dp(20),
    height: '100%',
    paddingHorizontal: dp(16),
  },
  label: {
    color: tizaiaColors.ink,
    fontSize: dp(17),
    fontWeight: '700',
    marginBottom: dp(10),
  },
  passwordToggle: {
    alignItems: 'center',
    height: dp(48),
    justifyContent: 'center',
    width: dp(48),
  },
  passwordToggleText: {
    color: tizaiaColors.textSecondary,
    fontSize: dp(20),
    fontWeight: '700',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.inkButton,
    borderRadius: dp(26),
    elevation: 4,
    flexDirection: 'row',
    height: dp(86),
    justifyContent: 'center',
    shadowColor: tizaiaColors.inkButton,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryButtonArrow: {
    color: tizaiaColors.white,
    fontSize: dp(28),
    fontWeight: '700',
    position: 'absolute',
    right: dp(40),
  },
  primaryButtonText: {
    color: tizaiaColors.white,
    fontSize: dp(22),
    fontWeight: '700',
  },
  privacy: {
    color: tizaiaColors.textSecondary,
    fontSize: dp(15),
    marginTop: dp(40),
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: dp(40),
    paddingVertical: dp(96),
  },
  subtitle: {
    color: tizaiaColors.textSecondary,
    fontSize: dp(22),
    marginTop: dp(4),
  },
  title: {
    color: tizaiaColors.ink,
    fontSize: dp(44),
    fontWeight: '700',
    marginTop: dp(8),
  },
});
