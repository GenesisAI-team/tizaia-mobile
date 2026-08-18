import { StyleSheet, View, type ViewStyle } from 'react-native';

import { dp, tizaiaColors } from '../theme/tizaiaTheme';

type GlassCardProps = {
  children?: React.ReactNode;
  /** Radio en px de diseño (por defecto 22, tarjeta de lista). */
  cornerRadius?: number;
  /** Relleno; por defecto blanco 60% (`cardGlass`). */
  fill?: string;
  style?: ViewStyle;
};

/**
 * Tarjeta translúcida compartida (DESIGN.md §4.4): fondo blanco con opacidad,
 * borde blanco de 1px y radio según variante. Las pantallas ajustan
 * `cornerRadius`/`fill` según la variante (22 listas, 28 métricas,
 * 34 perfil/formulario, 42 login).
 */
export function GlassCard({
  children,
  cornerRadius = 22,
  fill = tizaiaColors.cardGlass,
  style,
}: GlassCardProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: fill, borderRadius: dp(cornerRadius) },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: tizaiaColors.white,
    borderWidth: 1,
  },
});
