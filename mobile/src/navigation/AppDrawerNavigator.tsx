import {
  createDrawerNavigator,
  type DrawerNavigationProp,
} from '@react-navigation/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AnnotationsScreen } from '../features/annotations/presentation/AnnotationsScreen';
import { HomeScreen } from '../features/assistant/presentation/HomeScreen';
import { AttendanceScreen } from '../features/attendance/presentation/AttendanceScreen';
import { MailScreen } from '../features/mail/presentation/MailScreen';
import { StudentsScreen } from '../features/students/presentation/StudentsScreen';
import { TasksScreen } from '../features/tasks/presentation/TasksScreen';
import { dp, tizaiaColors } from '../shared/theme/tizaiaTheme';
import { AppDrawerContent } from './AppDrawerContent';
import type { RootDrawerParamList } from './types';

const Drawer = createDrawerNavigator<RootDrawerParamList>();

type Navigation = DrawerNavigationProp<RootDrawerParamList>;

/** Header común (DESIGN.md §4.1): texto LOGO a la izquierda. */
function HeaderLogo({ navigation }: { navigation: Navigation }) {
  return (
    <Pressable
      accessibilityLabel="Ir a Home"
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => navigation.navigate('Home')}
      style={styles.headerButton}
      testID="header-logo"
    >
      <Text style={styles.headerLogo}>LOGO</Text>
    </Pressable>
  );
}

/** Header común (DESIGN.md §4.1): icono hamburguesa de tres barras. */
function HeaderMenuButton({ navigation }: { navigation: Navigation }) {
  return (
    <Pressable
      accessibilityLabel="Abrir menú"
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => navigation.openDrawer()}
      style={styles.headerButton}
      testID="header-menu-button"
    >
      <View style={styles.menuIcon}>
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
      </View>
    </Pressable>
  );
}

export function AppDrawerNavigator(): React.JSX.Element {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerPosition: 'right',
        drawerStyle: styles.drawer,
        drawerType: 'front',
        headerLeft: () => <HeaderLogo navigation={navigation} />,
        headerRight: () => <HeaderMenuButton navigation={navigation} />,
        headerTitle: '',
      })}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Attendance" component={AttendanceScreen} />
      <Drawer.Screen name="Students" component={StudentsScreen} />
      <Drawer.Screen name="Tasks" component={TasksScreen} />
      <Drawer.Screen name="Mail" component={MailScreen} />
      <Drawer.Screen name="Annotations" component={AnnotationsScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawer: {
    width: '100%',
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    minHeight: 48,
    minWidth: 48,
  },
  headerLogo: {
    color: tizaiaColors.ink,
    fontSize: dp(38),
    fontWeight: '700',
  },
  menuIcon: {
    gap: dp(8),
    height: dp(44),
    justifyContent: 'center',
    width: dp(52),
  },
  menuLine: {
    backgroundColor: tizaiaColors.ink,
    borderRadius: dp(3),
    height: dp(5),
    width: dp(48),
  },
});
