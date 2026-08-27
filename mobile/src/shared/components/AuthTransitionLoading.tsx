import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { BrandMark } from './BrandMark';
import { ScreenBackground } from './ScreenBackground';
import { dp, tizaiaColors } from '../theme/tizaiaTheme';

const LETTERS = ['T', 'I', 'Z', 'A', 'I', 'A'] as const;
const STAGGER_MS = 70;
const DURATION_MS = 220;

function AnimatedLetter({
  char,
  index,
  reduceMotion,
}: {
  char: string;
  index: number;
  reduceMotion: boolean;
}): React.JSX.Element {
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : 4);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withDelay(
      index * STAGGER_MS,
      withTiming(1, { duration: DURATION_MS, easing: Easing.out(Easing.ease) }),
    );
    translateY.value = withDelay(
      index * STAGGER_MS,
      withTiming(0, { duration: DURATION_MS, easing: Easing.out(Easing.ease) }),
    );
  }, [index, opacity, reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.letter, animatedStyle]}>{char}</Animated.Text>
  );
}

/**
 * Transición breve con identidad TizaIA (issue #94).
 * Micro-loading que sustituye al loader blanco genérico de `App.tsx`.
 * Fondo degradado + marca compartida (`BrandMark` variant loading, 72dp) +
 * palabra TIZAIA con fade + translateY secuencial por letra.
 * Sin delays artificiales y sin bloquear la navegación: la animación acompaña
 * el estado real `isLoading`; si termina antes, el componente se desmonta.
 */
export function AuthTransitionLoading(): React.JSX.Element {
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

  return (
    <ScreenBackground>
      <View
        accessibilityLabel="Cargando TizaIA"
        accessibilityRole="progressbar"
        style={styles.container}
      >
        <BrandMark variant="loading" />
        <View style={styles.wordRow}>
          {LETTERS.map((char, index) => (
            <AnimatedLetter
              char={char}
              index={index}
              key={`${char}-${index}`}
              reduceMotion={reduceMotion}
            />
          ))}
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: dp(32),
  },
  letter: {
    color: tizaiaColors.ink,
    fontSize: dp(28),
    fontWeight: '700',
    letterSpacing: dp(7),
    textAlign: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    gap: dp(2),
    marginTop: dp(24),
  },
});
