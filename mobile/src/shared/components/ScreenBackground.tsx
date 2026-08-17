import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { tizaiaGradient } from '../theme/tizaiaTheme';

type ScreenBackgroundProps = {
  children?: React.ReactNode;
};

/**
 * Fondo global de pantalla: degradado vertical #FBC7A5 → #FCE0C3 → #FFF8EC
 * (DESIGN.md §2). Envuelve el contenido de cada pantalla.
 */
export function ScreenBackground({
  children,
}: ScreenBackgroundProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
        <Defs>
          <LinearGradient id="tizaia-screen-bg" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={tizaiaGradient.start} />
            <Stop
              offset={tizaiaGradient.midOffset}
              stopColor={tizaiaGradient.mid}
            />
            <Stop offset="1" stopColor={tizaiaGradient.end} />
          </LinearGradient>
        </Defs>
        <Rect fill="url(#tizaia-screen-bg)" height="100%" width="100%" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
