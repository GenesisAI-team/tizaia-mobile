import { useState } from 'react';
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

import { AppLogo } from '../../../shared/components/AppLogo';
import { GoogleGIcon } from '../../../shared/components/GoogleGIcon';
import { useAuth } from '../application/AuthProvider';

export function LoginScreen(): React.JSX.Element {
  const { isLoading, error, signInWithGoogle, signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitEmail = () => {
    void signInWithPassword({ email: email.trim(), password });
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <AppLogo size={96} />
          <Text accessibilityRole="header" style={styles.title}>
            Iniciar Sesión
          </Text>
          <TextInput
            accessibilityLabel="Correo electrónico"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="profesor@gmail.com"
            style={styles.input}
            value={email}
          />
          <TextInput
            accessibilityLabel="Contraseña"
            onChangeText={setPassword}
            placeholder="Contraseña"
            secureTextEntry
            style={styles.input}
            value={password}
          />
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          {isLoading ? (
            <ActivityIndicator accessibilityLabel="Cargando" />
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={submitEmail}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isLoading) && styles.buttonDimmed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={() => void signInWithGoogle()}
            style={({ pressed }) => [
              styles.googleButton,
              (pressed || isLoading) && styles.buttonDimmed,
            ]}
          >
            <GoogleGIcon size={20} />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#ffffff', flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  content: {
    alignSelf: 'center',
    gap: 16,
    maxWidth: 420,
    width: '100%',
  },
  title: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  googleButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    minHeight: 48,
  },
  googleButtonText: { color: '#1f2937', fontSize: 16, fontWeight: '600' },
  buttonDimmed: { opacity: 0.6 },
  error: { color: '#b00020' },
});
