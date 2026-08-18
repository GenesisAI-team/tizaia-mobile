import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dp, tizaiaColors } from '../theme/tizaiaTheme';

type ProfileCardProps = {
  email: string;
  initials: string;
  label: string;
  name: string;
  onPress?: () => void;
};

/**
 * Tarjeta de cuenta docente (DESIGN.md §4.11): 696×160, avatar con iniciales,
 * label terracota, nombre, email y acción "→". Usada en Menú y Clases.
 */
export function ProfileCard({
  email,
  initials,
  label,
  name,
  onPress,
}: ProfileCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
      <Pressable
        accessibilityLabel="Ver perfil docente"
        accessibilityRole="button"
        disabled={!onPress}
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Text style={styles.actionText}>→</Text>
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
    width: dp(64),
  },
  actionText: {
    color: tizaiaColors.accent,
    fontSize: dp(26),
    fontWeight: '700',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.avatar,
    borderRadius: dp(54),
    height: dp(108),
    justifyContent: 'center',
    width: dp(108),
  },
  card: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.cardProfile,
    borderColor: tizaiaColors.white,
    borderRadius: dp(34),
    borderWidth: 1,
    elevation: 4,
    flexDirection: 'row',
    gap: dp(34),
    height: dp(160),
    paddingHorizontal: dp(26),
    shadowColor: '#694536',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 17,
  },
  email: {
    color: tizaiaColors.textSecondary,
    fontSize: dp(18),
    marginTop: dp(8),
  },
  info: {
    flex: 1,
  },
  initials: {
    color: tizaiaColors.ink,
    fontSize: dp(34),
    fontWeight: '700',
  },
  label: {
    color: tizaiaColors.accent,
    fontSize: dp(14),
    fontWeight: '700',
    letterSpacing: dp(2.2),
  },
  name: {
    color: tizaiaColors.ink,
    fontSize: dp(30),
    fontWeight: '700',
    marginTop: dp(6),
  },
  pressed: {
    opacity: 0.7,
  },
});
