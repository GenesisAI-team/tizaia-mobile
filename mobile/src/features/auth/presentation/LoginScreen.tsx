import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../application/AuthProvider';

export function LoginScreen(): React.JSX.Element {
  const { isLoading, error, signInWithGoogle, signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitEmail = () => {
    void signInWithPassword({ email: email.trim(), password });
  };

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Tizaia
      </Text>
      <Text>Accede a tu espacio docente</Text>
      <TextInput
        accessibilityLabel="Correo electrónico"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Correo electrónico"
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
      {isLoading ? <ActivityIndicator accessibilityLabel="Cargando" /> : null}
      <Button
        disabled={isLoading}
        onPress={submitEmail}
        title="Entrar con correo"
      />
      <Button
        disabled={isLoading}
        onPress={() => void signInWithGoogle()}
        title="Continuar con Google"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '700' },
  input: {
    borderColor: '#888',
    borderRadius: 6,
    borderWidth: 1,
    minHeight: 48,
    padding: 12,
  },
  error: { color: '#b00020' },
});
