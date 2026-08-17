import type { RootDrawerParamList } from './types';

export type DrawerMenuRoute = keyof RootDrawerParamList;

export type DrawerMenuItem =
  | {
      type: 'route';
      route: DrawerMenuRoute;
      label: string;
      subtitle: string;
      icon: string;
    }
  | { type: 'signOut' };

/**
 * Opciones del menú lateral según el diseño definitivo (DESIGN.md §5.9):
 * Inicio + 5 módulos con subtítulo e icono. "Cerrar sesión" se renderiza
 * aparte como LogoutButton.
 */
export const DRAWER_MENU_ITEMS = [
  {
    type: 'route',
    route: 'Home',
    label: 'Inicio',
    subtitle: 'Tu espacio principal',
    icon: '⌂',
  },
  {
    type: 'route',
    route: 'Attendance',
    label: 'Asistencia',
    subtitle: 'Control diario del aula',
    icon: '✓',
  },
  {
    type: 'route',
    route: 'Students',
    label: 'Alumnos',
    subtitle: 'Perfiles y seguimiento',
    icon: 'A',
  },
  {
    type: 'route',
    route: 'Tasks',
    label: 'Tareas',
    subtitle: 'Planifica y revisa',
    icon: '◆',
  },
  {
    type: 'route',
    route: 'Mail',
    label: 'Mails',
    subtitle: 'Mensajes del centro',
    icon: '✉',
  },
  {
    type: 'route',
    route: 'Annotations',
    label: 'Anotaciones',
    subtitle: 'Ideas y observaciones',
    icon: '✎',
  },
] as const satisfies readonly DrawerMenuItem[];

export type DrawerMenuActions = {
  navigate: (route: DrawerMenuRoute) => void;
  signOut: () => void;
};

export function handleDrawerMenuItemPress(
  item: DrawerMenuItem,
  actions: DrawerMenuActions,
): void {
  if (item.type === 'signOut') {
    actions.signOut();
    return;
  }
  actions.navigate(item.route);
}
