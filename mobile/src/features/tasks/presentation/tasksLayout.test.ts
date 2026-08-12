import { colors } from '../../../shared/theme';
import type { MockTask } from './tasksMockData';
import {
  createHorizontalScrollSync,
  formatShortDate,
  getDeliveryStateColor,
  getTaskColumnWidth,
  MATRIX_AVATAR_COLUMN_WIDTH,
  MATRIX_SCREEN_PADDING,
  sortTasksByRecency,
  VISIBLE_TASK_COLUMN_COUNT,
} from './tasksLayout';

function createScrollTarget(): { scrollTo: jest.Mock } {
  return { scrollTo: jest.fn() };
}

describe('getTaskColumnWidth', () => {
  it('reparte el ancho disponible entre las tres columnas visibles', () => {
    const windowWidth = 400;
    const expected = Math.floor(
      (windowWidth - MATRIX_AVATAR_COLUMN_WIDTH - MATRIX_SCREEN_PADDING * 2) /
        VISIBLE_TASK_COLUMN_COUNT,
    );
    expect(getTaskColumnWidth(windowWidth)).toBe(expected);
    expect(VISIBLE_TASK_COLUMN_COUNT).toBe(3);
  });

  it('tres columnas visibles dejan fuera el resto de tareas', () => {
    const windowWidth = 400;
    const columnWidth = getTaskColumnWidth(windowWidth);
    const visibleWidth = columnWidth * VISIBLE_TASK_COLUMN_COUNT;
    const available =
      windowWidth - MATRIX_AVATAR_COLUMN_WIDTH - MATRIX_SCREEN_PADDING * 2;
    expect(visibleWidth).toBeLessThanOrEqual(available);
    expect(visibleWidth + columnWidth).toBeGreaterThan(available);
  });
});

describe('sortTasksByRecency', () => {
  const tasks: MockTask[] = [
    { id: 'a', title: 'Antigua', dueDate: '2026-07-28' },
    { id: 'b', title: 'Reciente', dueDate: '2026-08-10' },
    { id: 'c', title: 'Media', dueDate: '2026-08-03' },
  ];

  it('ordena de más reciente a más antigua sin mutar la entrada', () => {
    const sorted = sortTasksByRecency(tasks);
    expect(sorted.map((t) => t.id)).toEqual(['b', 'c', 'a']);
    expect(tasks.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('formatShortDate', () => {
  it('formatea una fecha ISO como dd/MM', () => {
    expect(formatShortDate('2026-08-10')).toBe('10/08');
    expect(formatShortDate('2026-01-05')).toBe('05/01');
  });
});

describe('getDeliveryStateColor', () => {
  it('mapea Entregada a verde y No entregada a rojo', () => {
    expect(getDeliveryStateColor('delivered')).toBe(colors.success);
    expect(getDeliveryStateColor('notDelivered')).toBe(colors.danger);
  });
});

describe('createHorizontalScrollSync', () => {
  it('desplaza todos los scrolls registrados salvo el origen', () => {
    const sync = createHorizontalScrollSync();
    const header = createScrollTarget();
    const rowA = createScrollTarget();
    const rowB = createScrollTarget();
    sync.register('header')(header);
    sync.register('row-a')(rowA);
    sync.register('row-b')(rowB);

    sync.syncFrom('row-a', 120);

    expect(header.scrollTo).toHaveBeenCalledWith({ x: 120, animated: false });
    expect(rowB.scrollTo).toHaveBeenCalledWith({ x: 120, animated: false });
    expect(rowA.scrollTo).not.toHaveBeenCalled();
  });

  it('ignora la reentrada provocada por los scrollTo programáticos', () => {
    const sync = createHorizontalScrollSync();
    const header = createScrollTarget();
    const rowA = createScrollTarget();
    // La cabecera reemite onScroll al ser desplazada: no debe propagarse.
    header.scrollTo.mockImplementation(() => sync.syncFrom('header', 999));
    sync.register('header')(header);
    sync.register('row-a')(rowA);

    sync.syncFrom('row-a', 120);

    expect(header.scrollTo).toHaveBeenCalledTimes(1);
    expect(header.scrollTo).toHaveBeenCalledWith({ x: 120, animated: false });
  });

  it('deja de sincronizar un scroll desregistrado', () => {
    const sync = createHorizontalScrollSync();
    const header = createScrollTarget();
    const rowA = createScrollTarget();
    sync.register('header')(header);
    sync.register('row-a')(rowA);
    sync.register('header')(null);

    sync.syncFrom('row-a', 40);

    expect(header.scrollTo).not.toHaveBeenCalled();
  });
});
