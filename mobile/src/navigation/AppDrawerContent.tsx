import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../features/auth/application/AuthProvider';
import {
  DRAWER_MENU_ITEMS,
  handleDrawerMenuItemPress,
  type DrawerMenuItem,
} from './drawerMenu';

function menuItemKey(item: DrawerMenuItem): string {
  return item.type === 'route' ? item.route : 'signOut';
}

export function AppDrawerContent(
  props: DrawerContentComponentProps,
): React.JSX.Element {
  const { signOut } = useAuth();

  const onPressItem = (item: DrawerMenuItem): void => {
    handleDrawerMenuItemPress(item, {
      navigate: (route) => props.navigation.navigate(route),
      signOut: () => void signOut(),
    });
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.content}>
      <View style={styles.menu}>
        {DRAWER_MENU_ITEMS.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={menuItemKey(item)}
            onPress={() => onPressItem(item)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            testID={`drawer-item-${menuItemKey(item)}`}
          >
            <Text style={styles.rowLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 16,
  },
  menu: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  row: {
    alignItems: 'center',
    borderColor: '#222',
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  rowPressed: {
    backgroundColor: '#e6e6e6',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
