import { act } from 'react';
import { create, type ReactTestRenderer } from 'react-test-renderer';
import { Text } from 'react-native';

import {
  MatrixBoard,
  type MatrixBoardColumn,
  type MatrixBoardRow,
} from './MatrixBoard';
import { StatusCell } from './StatusCell';
import { StudentAvatar } from './StudentAvatar';

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

  it('refleja columnas nuevas conservando el estado de las que permanecen', async () => {
    await act(async () => {
      renderer = create(
        <MatrixBoard
          actionAccessibilityLabel={(row, column) =>
            `${row.studentName} · ${column.label}`
          }
          cellStates={{ 'student-1:day-1': 'done' }}
          columns={columns}
          rows={rows}
        />,
      );
    });
    await act(async () => {
      renderer!.update(
        <MatrixBoard
          actionAccessibilityLabel={(row, column) =>
            `${row.studentName} · ${column.label}`
          }
          cellStates={{ 'student-1:day-1': 'done' }}
          columns={[
            { id: 'day-1', label: 'Lunes', secondaryLabel: '19/08' },
            { id: 'day-3', label: 'Jueves', secondaryLabel: '22/08' },
          ]}
          rows={rows}
        />,
      );
    });

    const cells = renderer!.root.findAllByType(StatusCell);
    expect(cells.map((cell) => cell.props.testID)).toEqual([
      'matrix-cell-student-1:day-1',
      'matrix-cell-student-1:day-3',
      'matrix-cell-student-2:day-1',
      'matrix-cell-student-2:day-3',
    ]);
    expect(cells.map((cell) => cell.props.accessibilityLabel)).toEqual([
      'Ana García · Lunes',
      'Ana García · Jueves',
      'Bruno Díaz · Lunes',
      'Bruno Díaz · Jueves',
    ]);
    expect(cells.map((cell) => cell.props.state)).toEqual([
      'done',
      'pending',
      'pending',
      'pending',
    ]);
  });

  it('refleja un nombre actualizado de una fila con el mismo id', async () => {
    const actionAccessibilityLabel = (
      row: MatrixBoardRow,
      column: MatrixBoardColumn,
    ): string => `${row.studentName} · ${column.label}`;

    await act(async () => {
      renderer = create(
        <MatrixBoard
          actionAccessibilityLabel={actionAccessibilityLabel}
          columns={columns}
          rows={rows}
          showRowNames
        />,
      );
    });
    await act(async () => {
      renderer!.update(
        <MatrixBoard
          actionAccessibilityLabel={actionAccessibilityLabel}
          columns={columns}
          rows={[
            {
              id: 'student-1',
              studentName: 'Ana García Vidal',
              initials: 'AGV',
            },
            { id: 'student-2', studentName: 'Bruno Díaz', initials: 'BD' },
          ]}
          showRowNames
        />,
      );
    });

    const renamedAvatar = renderer!.root.findByProps({
      accessibilityLabel: 'Foto de Ana García Vidal',
    });
    expect(renamedAvatar.type).toBe(StudentAvatar);
    expect(renamedAvatar.props.initials).toBe('AGV');
    expect(
      renderer!.root
        .findAllByType(Text)
        .some((text) => text.props.children === 'Ana García Vidal'),
    ).toBe(true);
    expect(
      renderer!.root
        .findAllByType(Text)
        .some((text) => text.props.children === 'Ana García'),
    ).toBe(false);
    expect(
      renderer!.root
        .findAllByType(StatusCell)
        .filter((cell) => cell.props.accessibilityLabel.includes('Ana García'))
        .map((cell) => cell.props.accessibilityLabel),
    ).toEqual(['Ana García Vidal · Lunes', 'Ana García Vidal · Martes']);
  });

  it('propaga el cambio de showRowNames y pendingTransparent a las filas', async () => {
    await act(async () => {
      renderer = create(
        <MatrixBoard
          actionAccessibilityLabel={(row) => row.studentName}
          columns={columns}
          rows={rows}
        />,
      );
    });

    expect(
      renderer!.root.findAllByType(StudentAvatar).map((avatar) => avatar.props),
    ).toEqual([
      expect.objectContaining({ size: 46 }),
      expect.objectContaining({ size: 46 }),
    ]);
    expect(
      renderer!.root
        .findAllByType(Text)
        .some((text) => text.props.children === 'Ana García'),
    ).toBe(false);

    await act(async () => {
      renderer!.update(
        <MatrixBoard
          actionAccessibilityLabel={(row) => row.studentName}
          columns={columns}
          pendingTransparent
          rows={rows}
          showRowNames
        />,
      );
    });

    expect(
      renderer!.root.findAllByType(StudentAvatar).map((avatar) => avatar.props),
    ).toEqual([
      expect.objectContaining({ size: 33 }),
      expect.objectContaining({ size: 33 }),
    ]);
    expect(
      renderer!.root
        .findAllByType(Text)
        .some((text) => text.props.children === 'Ana García'),
    ).toBe(true);
    expect(
      renderer!.root
        .findAllByType(StatusCell)
        .map((cell) => cell.props.pendingTransparent),
    ).toEqual([true, true, true, true]);
  });
});
