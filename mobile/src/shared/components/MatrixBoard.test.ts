import { getNextStatusCellState } from './MatrixBoard';

describe('MatrixBoard (ciclo visual de celda)', () => {
  it('cicla pending → done → undone → pending', () => {
    expect(getNextStatusCellState('pending')).toBe('done');
    expect(getNextStatusCellState('done')).toBe('undone');
    expect(getNextStatusCellState('undone')).toBe('pending');
  });
});
