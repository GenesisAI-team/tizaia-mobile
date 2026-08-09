import { Button, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../application/AuthProvider';

export function HomeScreen(): React.JSX.Element {
  const { session, isLoading, signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Home
      </Text>
      <Text>
        Sesión iniciada
        {session?.user.email ? ` como ${session.user.email}` : ''}.
      </Text>
      <Button
        disabled={isLoading}
        onPress={() => void signOut()}
        title="Cerrar sesión"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700' },
});
