import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dp, tizaiaColors } from '../theme/tizaiaTheme';

type ActiveClassCardProps = {
  badgeText: string;
  label: string;
  name: string;
  onPress?: () => void;
  subject: string;
};

/**
 * Tarjeta de clase activa del menú (DESIGN.md §4.12): badge melocotón,
 * label terracota, nombre de clase, materia y chevron de acción.
 */
export function ActiveClassCard({
  badgeText,
  label,
  name,
  onPress,
  subject,
}: ActiveClassCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text style={styles.subject}>{subject}</Text>
      </View>
      <Pressable
        accessibilityLabel="Cambiar de clase"
        accessibilityRole="button"
        disabled={!onPress}
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Text style={styles.actionText}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.actionSoft,
    borderRadius: dp(20),
    height: dp(56),
    justifyContent: 'center',
    width: dp(56),
  },
  actionText: {
    color: tizaiaColors.accent,
    fontSize: dp(32),
    lineHeight: dp(37),
  },
  badge: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.peach,
    borderRadius: dp(22),
    height: dp(68),
    justifyContent: 'center',
    width: dp(68),
  },
  badgeText: {
    color: tizaiaColors.inkButton,
    fontSize: dp(22),
    fontWeight: '700',
  },
  card: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.cardProfile,
    borderColor: tizaiaColors.white,
    borderRadius: dp(28),
    borderWidth: 1,
    elevation: 3,
    flexDirection: 'row',
    gap: dp(18),
    height: dp(104),
    paddingHorizontal: dp(18),
    shadowColor: '#694536',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  info: {
    flex: 1,
  },
  label: {
    color: tizaiaColors.accent,
    fontSize: dp(13),
    fontWeight: '700',
    letterSpacing: dp(2.2),
  },
  name: {
    color: tizaiaColors.ink,
    fontSize: dp(25),
    fontWeight: '700',
    marginTop: dp(4),
  },
  pressed: {
    opacity: 0.7,
  },
  subject: {
    color: tizaiaColors.textMenuSecondary,
    fontSize: dp(16),
    marginTop: dp(4),
  },
});
