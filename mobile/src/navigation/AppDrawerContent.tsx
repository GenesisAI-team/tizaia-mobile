import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../features/auth/application/AuthProvider';
import { ActiveClassCard } from '../shared/components/ActiveClassCard';
import { ProfileCard } from '../shared/components/ProfileCard';
import { ScreenBackground } from '../shared/components/ScreenBackground';
import {
  MOCK_ACTIVE_CLASS,
  MOCK_TEACHER_PROFILE,
} from '../shared/mock/teacher';
import { dp, tizaiaColors } from '../shared/theme/tizaiaTheme';
import {
  DRAWER_MENU_ITEMS,
  handleDrawerMenuItemPress,
  type DrawerMenuItem,
} from './drawerMenu';

type RouteMenuItem = Extract<DrawerMenuItem, { type: 'route' }>;

/**
 * Menú Hamburguesa definitivo (DESIGN.md §5.9, frame n1683 de Tizaia.op):
 * logo + cierre, ProfileCard, clase activa, navegación con estado activo,
 * logout y versión.
 */
export function AppDrawerContent(
  props: DrawerContentComponentProps,
): React.JSX.Element {
  const { signOut } = useAuth();
  const currentRoute = props.state.routes[props.state.index]?.name;

  const onPressItem = (item: DrawerMenuItem): void => {
    handleDrawerMenuItemPress(item, {
      navigate: (route) => props.navigation.navigate(route),
      signOut: () => void signOut(),
    });
  };

  const renderMenuItem = (item: RouteMenuItem): React.JSX.Element => {
    const isActive = item.route === currentRoute;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        key={item.route}
        onPress={() => onPressItem(item)}
        style={({ pressed }) => [
          styles.menuItem,
          isActive && styles.menuItemActive,
          pressed && styles.pressed,
        ]}
        testID={`drawer-item-${item.route}`}
      >
        <View style={[styles.itemIcon, isActive && styles.itemIconActive]}>
          <Text style={[styles.itemGlyph, isActive && styles.itemTextActive]}>
            {item.icon}
          </Text>
        </View>
        <View style={styles.itemTexts}>
          <Text style={[styles.itemTitle, isActive && styles.itemTextActive]}>
            {item.label}
          </Text>
          <Text
            style={[styles.itemSubtitle, isActive && styles.itemSubtitleActive]}
          >
            {item.subtitle}
          </Text>
        </View>
        <Text style={[styles.chevron, isActive && styles.itemTextActive]}>
          ›
        </Text>
      </Pressable>
    );
  };

  return (
    <ScreenBackground>
      <View pointerEvents="none" style={styles.decorTop} />
      <View pointerEvents="none" style={styles.decorBottom} />
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.content}
        scrollEnabled
      >
        <View style={styles.topRow}>
          <Text style={styles.logo}>TIZAIA</Text>
          <Pressable
            accessibilityLabel="Cerrar menú"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => props.navigation.closeDrawer()}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.pressed,
            ]}
            testID="drawer-close-button"
          >
            <Text style={styles.closeIcon}>×</Text>
          </Pressable>
        </View>

        <ProfileCard
          email={MOCK_TEACHER_PROFILE.email}
          initials={MOCK_TEACHER_PROFILE.initials}
          label={MOCK_TEACHER_PROFILE.label}
          name={MOCK_TEACHER_PROFILE.name}
        />

        <View style={styles.activeClass}>
          <ActiveClassCard
            badgeText={MOCK_ACTIVE_CLASS.badgeText}
            label={MOCK_ACTIVE_CLASS.label}
            name={MOCK_ACTIVE_CLASS.name}
            subject={MOCK_ACTIVE_CLASS.subject}
          />
        </View>

        <Text style={styles.menuEyebrow}>NAVEGACIÓN</Text>
        <View style={styles.menu}>
          {DRAWER_MENU_ITEMS.map((item) => renderMenuItem(item))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => onPressItem({ type: 'signOut' })}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
          testID="drawer-item-signOut"
        >
          <View style={styles.logoutIconBackground}>
            <Text style={styles.logoutIcon}>↪</Text>
          </View>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
          <Text style={styles.logoutChevron}>›</Text>
        </Pressable>

        <Text style={styles.version}>Tizaia · versión 1.0</Text>
      </DrawerContentScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  activeClass: {
    marginTop: dp(28),
  },
  chevron: {
    color: tizaiaColors.accent,
    fontSize: dp(32),
    marginRight: dp(18),
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.cardMenu,
    borderColor: tizaiaColors.white,
    borderRadius: dp(38),
    borderWidth: 1,
    height: dp(76),
    justifyContent: 'center',
    width: dp(76),
  },
  closeIcon: {
    color: tizaiaColors.inkButton,
    fontSize: dp(38),
    lineHeight: dp(44),
  },
  content: {
    flexGrow: 1,
    padding: dp(36),
  },
  decorBottom: {
    backgroundColor: '#F8C4A633',
    borderRadius: dp(150),
    bottom: dp(108),
    height: dp(300),
    left: dp(-60),
    position: 'absolute',
    width: dp(300),
  },
  decorTop: {
    backgroundColor: '#FFFFFF26',
    borderRadius: dp(140),
    height: dp(280),
    position: 'absolute',
    right: dp(-97),
    top: dp(-80),
    width: dp(280),
  },
  itemGlyph: {
    color: tizaiaColors.inkButton,
    fontSize: dp(28),
    fontWeight: '700',
    textAlign: 'center',
  },
  itemIcon: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.peach,
    borderRadius: dp(22),
    height: dp(68),
    justifyContent: 'center',
    marginLeft: dp(18),
    width: dp(68),
  },
  itemIconActive: {
    backgroundColor: '#FFFFFF26',
  },
  itemSubtitle: {
    color: tizaiaColors.textMenuSecondary,
    fontSize: dp(16),
    marginTop: dp(4),
  },
  itemSubtitleActive: {
    color: '#FFFFFFB8',
  },
  itemTextActive: {
    color: tizaiaColors.white,
  },
  itemTexts: {
    flex: 1,
    marginLeft: dp(18),
  },
  itemTitle: {
    color: tizaiaColors.ink,
    fontSize: dp(24),
    fontWeight: '700',
  },
  logo: {
    color: tizaiaColors.ink,
    fontSize: dp(38),
    fontWeight: '700',
    letterSpacing: dp(5),
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#FFF7F2B8',
    borderColor: tizaiaColors.logoutBorder,
    borderRadius: dp(28),
    borderWidth: 1,
    flexDirection: 'row',
    height: dp(88),
    marginTop: dp(24),
  },
  logoutChevron: {
    color: tizaiaColors.logoutText,
    fontSize: dp(32),
    marginRight: dp(18),
  },
  logoutIcon: {
    color: tizaiaColors.inkButton,
    fontSize: dp(27),
    fontWeight: '700',
    textAlign: 'center',
  },
  logoutIconBackground: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.cellUndone,
    borderRadius: dp(20),
    height: dp(64),
    justifyContent: 'center',
    marginLeft: dp(18),
    width: dp(64),
  },
  logoutText: {
    color: tizaiaColors.logoutText,
    flex: 1,
    fontSize: dp(23),
    fontWeight: '700',
    marginLeft: dp(18),
  },
  menu: {
    gap: dp(12),
    marginTop: dp(20),
  },
  menuEyebrow: {
    color: tizaiaColors.eyebrowMuted,
    fontSize: dp(15),
    fontWeight: '700',
    letterSpacing: dp(2.5),
    marginTop: dp(44),
  },
  menuItem: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.cardMenu,
    borderColor: tizaiaColors.white,
    borderRadius: dp(28),
    borderWidth: 1,
    flexDirection: 'row',
    height: dp(88),
  },
  menuItemActive: {
    backgroundColor: tizaiaColors.inkButton,
    borderColor: tizaiaColors.inkButton,
  },
  pressed: {
    opacity: 0.75,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: dp(32),
  },
  version: {
    color: tizaiaColors.eyebrowMuted,
    fontSize: dp(15),
    marginTop: dp(40),
    textAlign: 'center',
  },
});
