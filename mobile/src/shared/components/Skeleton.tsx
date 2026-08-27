import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  type DimensionValue,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { dp, tizaiaColors, tizaiaRadius } from '../theme/tizaiaTheme';

export const SKELETON_MIN_OPACITY = 0.45;
export const SKELETON_MAX_OPACITY = 0.85;
const PULSE_DURATION_MS = 800;

type SkeletonProps = {
  /** Ancho del bloque; por defecto ocupa todo el contenedor. */
  width?: DimensionValue;
  /** Alto del bloque en dp. */
  height: number;
  /** Radio del bloque en dp (por defecto `radius-sm` convertido). */
  borderRadius?: number;
  /** Relleno; por defecto el tono skeleton del tema (tizaiaColors.skeleton). */
  color?: string;
  testID?: string;
};

/**
 * Bloque base del sistema de skeleton loading (issue #85). Pulso suave de
 * opacidad 0.45→0.85 con Reanimated (ya presente en el stack; no se añade
 * librería externa). Es decorativo: se oculta al lector de pantalla y respeta
 * "reducir movimiento" cuando el sistema lo solicita (se queda estático).
 */
export function Skeleton({
  width = '100%',
  height,
  borderRadius = dp(tizaiaRadius.sm),
  color = tizaiaColors.skeleton,
  testID,
}: SkeletonProps): React.JSX.Element {
  const opacity = useSharedValue(SKELETON_MAX_OPACITY);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = SKELETON_MIN_OPACITY;
    opacity.value = withRepeat(
      withSequence(
        withTiming(SKELETON_MAX_OPACITY, {
          duration: PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(SKELETON_MIN_OPACITY, {
          duration: PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
    );
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.block,
        { backgroundColor: color, borderRadius, height, width },
        animatedStyle,
      ]}
      testID={testID}
    />
  );
}

type SkeletonTextProps = {
  width?: DimensionValue;
  height?: number;
  testID?: string;
};

/**
 * Línea de texto esqueleto: bloque con la altura tipográfica típica del
 * contenido (32px de diseño → 16dp, cuerpo de las tarjetas).
 */
export function SkeletonText({
  width = '100%',
  height = dp(32),
  testID,
}: SkeletonTextProps): React.JSX.Element {
  return (
    <Skeleton
      borderRadius={dp(tizaiaRadius.sm)}
      height={height}
      testID={testID}
      width={width}
    />
  );
}

type SkeletonCircleProps = {
  /** Diámetro del círculo en dp. */
  size: number;
  testID?: string;
};

/** Círculo esqueleto para avatares e indicadores circulares. */
export function SkeletonCircle({
  size,
  testID,
}: SkeletonCircleProps): React.JSX.Element {
  return (
    <Skeleton
      borderRadius={size / 2}
      height={size}
      testID={testID}
      width={size}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden',
  },
});
