import { createDrawerNavigator } from '@react-navigation/drawer';
import { Platform, StyleSheet } from 'react-native';

import { AnnotationsScreen } from '../features/annotations/presentation/AnnotationsScreen';
import { NewAnnotationScreen } from '../features/annotations/presentation/NewAnnotationScreen';
import { HomeScreen } from '../features/assistant/presentation/HomeScreen';
import { AttendanceScreen } from '../features/attendance/presentation/AttendanceScreen';
import { ClassesScreen } from '../features/classes/presentation/ClassesScreen';
import { MailScreen } from '../features/mail/presentation/MailScreen';
import { NewMailScreen } from '../features/mail/presentation/NewMailScreen';
import { StudentProfileScreen } from '../features/students/presentation/StudentProfileScreen';
import { StudentsScreen } from '../features/students/presentation/StudentsScreen';
import { TasksScreen } from '../features/tasks/presentation/TasksScreen';
import { AppHeaderLogo } from '../shared/components/AppHeader/AppHeaderLogo';
import { AppHeaderMenuButton } from '../shared/components/AppHeader/AppHeaderMenuButton';
import { tizaiaGradient } from '../shared/theme/tizaiaTheme';
import { SchoolDataProvider } from '../shared/state/schoolDataProvider';
import { AppBootstrapProvider } from '../shared/state/appBootstrapProvider';
import { AppDrawerContent } from './AppDrawerContent';
import type { RootDrawerParamList } from './types';

const Drawer = createDrawerNavigator<RootDrawerParamList>();

/**
 * Datos escolares compartidos: las pantallas y el drawer consumen el mismo
 * estado invalidable; una mutación en cualquier pantalla refresca el resto.
 */
export function AppDrawerNavigator(): React.JSX.Element {
  return (
    <SchoolDataProvider>
      <AppBootstrapProvider>
        <Drawer.Navigator
          drawerContent={(props) => <AppDrawerContent {...props} />}
          screenOptions={({ navigation }) => ({
            drawerPosition: 'right',
            drawerStyle: styles.drawer,
            drawerType: 'front',
            headerStyle: {
              backgroundColor: tizaiaGradient.start,
              // Android: elimina sombra/elevation del header por defecto
              ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
            },
            headerShadowVisible: false,
            headerLeft: () => (
              <AppHeaderLogo onPress={() => navigation.navigate('Home')} />
            ),
            headerRight: () => (
              <AppHeaderMenuButton onPress={() => navigation.openDrawer()} />
            ),
            headerTitle: '',
          })}
        >
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Attendance" component={AttendanceScreen} />
          <Drawer.Screen name="Students" component={StudentsScreen} />
          <Drawer.Screen name="Tasks" component={TasksScreen} />
          <Drawer.Screen name="Mail" component={MailScreen} />
          <Drawer.Screen name="Annotations" component={AnnotationsScreen} />
          <Drawer.Screen name="Classes" component={ClassesScreen} />
          <Drawer.Screen name="NewAnnotation" component={NewAnnotationScreen} />
          <Drawer.Screen name="NewMail" component={NewMailScreen} />
          <Drawer.Screen
            name="StudentProfile"
            component={StudentProfileScreen}
          />
        </Drawer.Navigator>
      </AppBootstrapProvider>
    </SchoolDataProvider>
  );
}

const styles = StyleSheet.create({
  drawer: {
    width: '100%',
  },
});
