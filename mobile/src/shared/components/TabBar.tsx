import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { dp, tizaiaColors } from '../theme/tizaiaTheme';
import { GlobeIcon } from './icons/GlobeIcon';
import { HomeIcon } from './icons/HomeIcon';

export type TabBarTab = 'home' | 'overview';

type TabBarProps = {
  /** Pestaña activa; `null` cuando ninguna lo está (pantallas de módulo). */
  activeTab?: TabBarTab | null;
  onPressTab?: (tab: TabBarTab) => void;
  style?: ViewStyle;
};

/** Colores de una pestaña según su estado (DESIGN.md §4.2). */
export const getTabColors = (
  isActive: boolean,
): { backgroundColor: string; iconColor: string } => ({
  backgroundColor: isActive ? tizaiaColors.inkButton : 'transparent',
  iconColor: isActive ? tizaiaColors.white : tizaiaColors.ink,
});

/**
 * Barra de navegación inferior flotante (DESIGN.md §4.2): píldora 400×92
 * con pestañas Home (casa) y Overview (globo). La pantalla la posiciona
 * en la parte inferior mediante `style`.
 */
export function TabBar({
  activeTab = null,
  onPressTab,
  style,
}: TabBarProps): React.JSX.Element {
  const renderTab = (
    tab: TabBarTab,
    accessibilityLabel: string,
    icon: (color: string) => React.JSX.Element,
  ): React.JSX.Element => {
    const isActive = activeTab === tab;
    const { backgroundColor, iconColor } = getTabColors(isActive);
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        onPress={() => onPressTab?.(tab)}
        style={({ pressed }) => [
          styles.tab,
          { backgroundColor },
          pressed && styles.tabPressed,
        ]}
        testID={`tabbar-${tab}`}
      >
        {icon(iconColor)}
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, style]}>
      {renderTab('home', 'Ir a Home', (color) => (
        <HomeIcon color={color} />
      ))}
      {renderTab('overview', 'Ir a vista general', (color) => (
        <GlobeIcon color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.cardStrong,
    borderColor: tizaiaColors.white,
    borderRadius: dp(46),
    borderWidth: 1,
    elevation: 4,
    flexDirection: 'row',
    height: dp(92),
    justifyContent: 'space-between',
    paddingHorizontal: dp(20),
    shadowColor: tizaiaColors.ink,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 9,
    width: dp(400),
  },
  tab: {
    alignItems: 'center',
    borderRadius: dp(36),
    height: dp(72),
    justifyContent: 'center',
    width: dp(160),
  },
  tabPressed: {
    opacity: 0.7,
  },
});
