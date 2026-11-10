import { QUICK_ACTION_SETS, selectQuickActionSet } from './homeQuickActions';

describe('homeQuickActions', () => {
  describe('QUICK_ACTION_SETS', () => {
    it('contiene 3-4 acciones únicas por conjunto y solo rutas de módulos', () => {
      const ROUTES_VALIDAS = [
        'Attendance',
        'Students',
        'Tasks',
        'Mail',
        'Annotations',
      ] as const;

      expect(QUICK_ACTION_SETS.length).toBeGreaterThanOrEqual(1);
      for (const set of QUICK_ACTION_SETS) {
        expect(set.length).toBeGreaterThanOrEqual(3);
        expect(set.length).toBeLessThanOrEqual(4);
        const routes = set.map((action) => action.route);
        expect(new Set(routes).size).toBe(routes.length);
        for (const route of routes) {
          expect(ROUTES_VALIDAS).toContain(route);
        }
      }
    });

    it('cubre las cinco rutas de módulo disponibles en total', () => {
      const routes = new Set(
        QUICK_ACTION_SETS.flatMap((set) => set.map((action) => action.route)),
      );
      expect(routes).toEqual(
        new Set(['Attendance', 'Students', 'Tasks', 'Mail', 'Annotations']),
      );
    });

    it('usa etiquetas de acción sin datos escolares ni promesas', () => {
      for (const set of QUICK_ACTION_SETS) {
        for (const action of set) {
          expect(action.label.length).toBeGreaterThan(0);
          expect(action.accessibilityLabel).toContain('Abrir');
        }
      }
    });
  });

  describe('selectQuickActionSet', () => {
    it('devuelve uno de los conjuntos definidos según el azar', () => {
      const randomSpy = jest.spyOn(Math, 'random');

      randomSpy.mockReturnValue(0);
      expect(selectQuickActionSet()).toBe(QUICK_ACTION_SETS[0]);

      randomSpy.mockReturnValue(0.99);
      expect(selectQuickActionSet()).toBe(
        QUICK_ACTION_SETS[QUICK_ACTION_SETS.length - 1],
      );

      randomSpy.mockRestore();
    });
  });
});
