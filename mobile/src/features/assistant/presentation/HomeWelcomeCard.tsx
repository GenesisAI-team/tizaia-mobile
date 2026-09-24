import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeOutDown } from 'react-native-reanimated';

import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';
import type { QuickAction, QuickActionSet } from './homeQuickActions';

type HomeWelcomeCardProps = {
  actionSet: QuickActionSet;
  onSelectAction: (action: QuickAction) => void;
};

/**
 * Bienvenida de Home sin conversación (MOB-HOME-001): saludo breve y 3-4
 * accesos rápidos al estilo del saludo local que sustituye. La salida es una
 * transición discreta (opacity + desplazamiento corto) respetando el
 * movimiento reducido del sistema, sin bloquear el envío ni la navegación.
 */
export function HomeWelcomeCard({
  actionSet,
  onSelectAction,
}: HomeWelcomeCardProps): React.JSX.Element {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  return (
    <Animated.View
      exiting={reduceMotion ? undefined : FadeOutDown.duration(220)}
      style={styles.block}
    >
      <View style={styles.greetingBubble}>
        <Text style={styles.greetingText}>Hola 👋 ¿Qué necesitas hoy?</Text>
      </View>
      <View style={styles.cards}>
        {actionSet.map((action) => (
          <Pressable
            accessibilityLabel={action.accessibilityLabel}
            accessibilityRole="button"
            key={action.route}
            onPress={() => onSelectAction(action)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            testID={`home-quick-action-${action.route}`}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>{action.icon}</Text>
            </View>
            <Text style={styles.cardLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: dp(16),
  },
  card: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.cardStrong,
    borderRadius: dp(24),
    flexDirection: 'row',
    gap: dp(20),
    paddingHorizontal: dp(28),
    paddingVertical: dp(24),
    width: '100%',
  },
  cardIcon: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.actionSoft,
    borderRadius: dp(24),
    height: dp(76),
    justifyContent: 'center',
    width: dp(76),
  },
  cardIconText: {
    color: tizaiaColors.accent,
    fontSize: dp(30),
  },
  cardLabel: {
    color: tizaiaColors.ink,
    flex: 1,
    fontSize: dp(30),
    fontWeight: '600',
  },
  cardPressed: {
    opacity: 0.85,
  },
  cards: {
    gap: dp(16),
  },
  greetingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFDFC',
    borderRadius: dp(44),
    maxWidth: '100%',
    paddingHorizontal: dp(29),
    paddingVertical: dp(32),
  },
  greetingText: {
    color: tizaiaColors.ink,
    fontSize: dp(32),
  },
});
