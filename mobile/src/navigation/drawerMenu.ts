import type { RootDrawerParamList } from './types';

type DrawerMenuRoute = Exclude<keyof RootDrawerParamList, 'Home'>;

export type DrawerMenuItem =
  | { type: 'route'; route: DrawerMenuRoute; label: string }
  | { type: 'signOut'; label: string };

/**
 * Opciones del menú lateral en el orden fijado por HU-003.
 * Home no aparece: se accede pulsando el logo del header (RF-NAV-001).
 */
export const DRAWER_MENU_ITEMS = [
  { type: 'route', route: 'Attendance', label: 'ASISTENCIA' },
  { type: 'route', route: 'Students', label: 'ALUMNOS' },
  { type: 'route', route: 'Tasks', label: 'TAREAS' },
  { type: 'route', route: 'Mail', label: 'MAILS' },
  { type: 'route', route: 'Annotations', label: 'ANOTACIONES' },
  { type: 'signOut', label: 'SALIR' },
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
