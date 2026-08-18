import { getStatusCellBackground } from './StatusCell';
import { tizaiaColors } from '../theme/tizaiaTheme';

describe('StatusCell (DESIGN.md §4.8)', () => {
  it('mapea los fondos de done/undone/pending', () => {
    expect(getStatusCellBackground('done')).toBe(tizaiaColors.cellDone);
    expect(getStatusCellBackground('undone')).toBe(tizaiaColors.cellUndone);
    expect(getStatusCellBackground('pending')).toBe(tizaiaColors.cellPending);
  });

  it('en Tareas el pendiente no tiene fondo', () => {
    expect(getStatusCellBackground('pending', true)).toBe('transparent');
  });
});
