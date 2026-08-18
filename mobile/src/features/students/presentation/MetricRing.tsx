import { StyleSheet, Text, View } from 'react-native';

import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';

type MetricRingProps = {
  color: string;
  label: string;
  value: string;
};

/**
 * Anillo de métrica del Perfil Alumno (DESIGN.md §4.17): círculo 88px con
 * borde de 9px en el color del estado, valor centrado y etiqueta debajo.
 */
export function MetricRing({
  color,
  label,
  value,
}: MetricRingProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={[styles.ring, { borderColor: color }]}>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: dp(184),
  },
  label: {
    color: tizaiaColors.ink,
    fontSize: dp(16),
    fontWeight: '600',
    marginTop: dp(12),
    textAlign: 'center',
  },
  ring: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.fieldBackground,
    borderRadius: dp(44),
    borderWidth: dp(9),
    height: dp(88),
    justifyContent: 'center',
    width: dp(88),
  },
  value: {
    color: tizaiaColors.ink,
    fontSize: dp(23),
    fontWeight: '700',
    textAlign: 'center',
  },
});
