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

describe('DRAWER_MENU_ITEMS (diseño definitivo, DESIGN.md §5.9)', () => {
  it('contiene Inicio y los 5 módulos en orden, con subtítulo e icono', () => {
    expect(DRAWER_MENU_ITEMS.map((item) => item.label)).toEqual([
      'Inicio',
      'Asistencia',
      'Alumnos',
      'Tareas',
      'Mails',
      'Anotaciones',
    ]);
    expect(DRAWER_MENU_ITEMS.map((item) => item.subtitle)).toEqual([
      'Tu espacio principal',
      'Control diario del aula',
      'Perfiles y seguimiento',
      'Planifica y revisa',
      'Mensajes del centro',
      'Ideas y observaciones',
    ]);
    expect(DRAWER_MENU_ITEMS.map((item) => item.icon)).toEqual([
      '⌂',
      '✓',
      'A',
      '◆',
      '✉',
      '✎',
    ]);
  });

  it('mapea cada módulo a su ruta', () => {
    expect(DRAWER_MENU_ITEMS.map((item) => item.route)).toEqual([
      'Home',
      'Attendance',
      'Students',
      'Tasks',
      'Mail',
      'Annotations',
    ]);
  });
});

describe('handleDrawerMenuItemPress', () => {
  it('navega a la ruta del módulo sin cerrar sesión', () => {
    const actions = createActions();

    handleDrawerMenuItemPress(DRAWER_MENU_ITEMS[1], actions);

    expect(actions.navigatedTo).toEqual(['Attendance']);
    expect(actions.signOutCalls).toBe(0);
  });

  it('navega a Home desde Inicio', () => {
    const actions = createActions();

    handleDrawerMenuItemPress(DRAWER_MENU_ITEMS[0], actions);

    expect(actions.navigatedTo).toEqual(['Home']);
  });

  it('cerrar sesión no navega (RF-NAV-008)', () => {
    const actions = createActions();

    handleDrawerMenuItemPress({ type: 'signOut' }, actions);

    expect(actions.signOutCalls).toBe(1);
    expect(actions.navigatedTo).toEqual([]);
  });
});
