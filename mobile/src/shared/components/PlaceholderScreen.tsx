import { StyleSheet, Text, View } from 'react-native';

type PlaceholderScreenProps = {
  title: string;
};

/**
 * Pantalla mínima de módulo pendiente de implementación (HU-004..HU-012).
 */
export function PlaceholderScreen({
  title,
}: PlaceholderScreenProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.subtitle}>En construcción</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#555',
    fontSize: 16,
  },
});
