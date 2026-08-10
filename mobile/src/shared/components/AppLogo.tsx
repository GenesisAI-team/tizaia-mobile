import { StyleSheet, Text, View } from 'react-native';

type AppLogoProps = {
  size?: number;
};

const DEFAULT_SIZE = 96;

/**
 * Placeholder del logotipo de la aplicación (círculo con borde y texto LOGO).
 * Componente presentacional reutilizable: login (HU-001) y header
 * autenticado (HU-003). RF-AUTH-005.
 */
export function AppLogo({
  size = DEFAULT_SIZE,
}: AppLogoProps): React.JSX.Element {
  return (
    <View
      accessibilityLabel="Logotipo de Tizaia"
      accessibilityRole="image"
      style={[
        styles.logo,
        { borderRadius: size / 2, height: size, width: size },
      ]}
    >
      <Text style={[styles.text, { fontSize: size / 6 }]}>LOGO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#1e293b',
    borderWidth: 2,
    justifyContent: 'center',
  },
  text: {
    color: '#1e293b',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
