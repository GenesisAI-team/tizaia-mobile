import {
  createDrawerNavigator,
  type DrawerNavigationProp,
} from '@react-navigation/drawer';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AnnotationsScreen } from '../features/annotations/presentation/AnnotationsScreen';
import { HomeScreen } from '../features/assistant/presentation/HomeScreen';
import { AttendanceScreen } from '../features/attendance/presentation/AttendanceScreen';
import { MailScreen } from '../features/mail/presentation/MailScreen';
import { StudentsScreen } from '../features/students/presentation/StudentsScreen';
import { TasksScreen } from '../features/tasks/presentation/TasksScreen';
import { AppLogo } from '../shared/components/AppLogo';
import { AppDrawerContent } from './AppDrawerContent';
import type { RootDrawerParamList } from './types';

const Drawer = createDrawerNavigator<RootDrawerParamList>();

type Navigation = DrawerNavigationProp<RootDrawerParamList>;

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
      <AppLogo size={32} />
    </Pressable>
  );
}

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
      <Text style={styles.menuIcon}>☰</Text>
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
  menuIcon: {
    fontSize: 24,
  },
});
