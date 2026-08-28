import { act } from 'react';
import { create, type ReactTestRenderer } from 'react-test-renderer';

import {
  MatrixBoard,
  type MatrixBoardColumn,
  type MatrixBoardRow,
} from './MatrixBoard';
import { StatusCell } from './StatusCell';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const rows: MatrixBoardRow[] = [
  { id: 'student-1', studentName: 'Ana García', initials: 'AG' },
  { id: 'student-2', studentName: 'Bruno Díaz', initials: 'BD' },
];

const columns: MatrixBoardColumn[] = [
  { id: 'day-1', label: 'Lunes', secondaryLabel: '19/08' },
  { id: 'day-2', label: 'Martes', secondaryLabel: '20/08' },
];

describe('MatrixBoard', () => {
  let renderer: ReactTestRenderer | undefined;

  afterEach(async () => {
    if (renderer !== undefined) {
      await act(async () => renderer?.unmount());
      renderer = undefined;
    }
  });

  it('conserva el orden, estados, etiquetas accesibles y testIDs de las celdas', async () => {
    await act(async () => {
      renderer = create(
        <MatrixBoard
          actionAccessibilityLabel={(row, column) =>
            `${row.studentName} · ${column.label}`
          }
          cellStates={{
            'student-1:day-1': 'done',
            'student-2:day-2': 'undone',
          }}
          columns={columns}
          rows={rows}
        />,
      );
    });

    const cells = renderer!.root.findAllByType(StatusCell);
    expect(cells.map((cell) => cell.props.testID)).toEqual([
      'matrix-cell-student-1:day-1',
      'matrix-cell-student-1:day-2',
      'matrix-cell-student-2:day-1',
      'matrix-cell-student-2:day-2',
    ]);
    expect(cells.map((cell) => cell.props.state)).toEqual([
      'done',
      'pending',
      'pending',
      'undone',
    ]);
    expect(cells.map((cell) => cell.props.accessibilityLabel)).toEqual([
      'Ana García · Lunes',
      'Ana García · Martes',
      'Bruno Díaz · Lunes',
      'Bruno Díaz · Martes',
    ]);
  });

  it('delega la fila y columna correctas después de actualizar un estado', async () => {
    const initialOnCellPress = jest.fn();
    const onCellPress = jest.fn();
    const actionAccessibilityLabel = (
      row: MatrixBoardRow,
      column: MatrixBoardColumn,
    ): string => `${row.studentName} · ${column.label}`;

    await act(async () => {
      renderer = create(
        <MatrixBoard
          actionAccessibilityLabel={actionAccessibilityLabel}
          cellStates={{}}
          columns={columns}
          onCellPress={initialOnCellPress}
          rows={rows}
        />,
      );
    });
    await act(async () => {
      renderer!.update(
        <MatrixBoard
          actionAccessibilityLabel={actionAccessibilityLabel}
          cellStates={{ 'student-2:day-1': 'done' }}
          columns={columns}
          onCellPress={onCellPress}
          rows={rows}
        />,
      );
    });

    const cell = renderer!.root.findByProps({
      testID: 'matrix-cell-student-2:day-1',
    });
    await act(async () => cell.props.onPress());

    expect(initialOnCellPress).not.toHaveBeenCalled();
    expect(onCellPress).toHaveBeenCalledWith(rows[1], columns[0]);
    expect(
      renderer!.root.findAllByType(StatusCell).map((item) => item.props.state),
    ).toEqual(['pending', 'pending', 'done', 'pending']);
  });
});
