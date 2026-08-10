import {
  DRAWER_MENU_ITEMS,
  handleDrawerMenuItemPress,
  type DrawerMenuActions,
} from './drawerMenu';

function createActions(): DrawerMenuActions & {
  navigatedTo: string[];
  signOutCalls: number;
} {
  const actions = {
    navigatedTo: [] as string[],
    signOutCalls: 0,
    navigate(route: string) {
      actions.navigatedTo.push(route);
    },
    signOut() {
      actions.signOutCalls += 1;
    },
  };
  return actions;
}

describe('DRAWER_MENU_ITEMS', () => {
  it('contiene las 6 opciones de HU-003 en orden y en mayúsculas', () => {
    expect(DRAWER_MENU_ITEMS.map((item) => item.label)).toEqual([
      'ASISTENCIA',
      'ALUMNOS',
      'TAREAS',
      'MAILS',
      'ANOTACIONES',
      'SALIR',
    ]);
  });

  it('mapea cada etiqueta de módulo a su ruta en inglés', () => {
    expect(DRAWER_MENU_ITEMS.slice(0, 5)).toEqual([
      { type: 'route', route: 'Attendance', label: 'ASISTENCIA' },
      { type: 'route', route: 'Students', label: 'ALUMNOS' },
      { type: 'route', route: 'Tasks', label: 'TAREAS' },
      { type: 'route', route: 'Mail', label: 'MAILS' },
      { type: 'route', route: 'Annotations', label: 'ANOTACIONES' },
    ]);
  });

  it('no incluye una opción Home (se accede por el logo)', () => {
    const routes: string[] = DRAWER_MENU_ITEMS.flatMap((item) =>
      item.type === 'route' ? [item.route] : [],
    );

    expect(routes).not.toContain('Home');
  });
});

describe('handleDrawerMenuItemPress', () => {
  it('navega a la ruta del módulo sin cerrar sesión', () => {
    const actions = createActions();

    handleDrawerMenuItemPress(DRAWER_MENU_ITEMS[0], actions);

    expect(actions.navigatedTo).toEqual(['Attendance']);
    expect(actions.signOutCalls).toBe(0);
  });

  it('SALIR cierra sesión sin navegar (RF-NAV-008)', () => {
    const actions = createActions();

    handleDrawerMenuItemPress({ type: 'signOut', label: 'SALIR' }, actions);

    expect(actions.signOutCalls).toBe(1);
    expect(actions.navigatedTo).toEqual([]);
  });
});
