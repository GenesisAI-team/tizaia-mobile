import { StyleSheet, View } from 'react-native';

import {
  Fab,
  MatrixBoard,
  ScreenBackground,
  ScreenTitle,
  TabBar,
  type MatrixBoardColumn,
  type MatrixBoardRow,
  type StatusCellState,
} from '../../../shared/components';
import { dp } from '../../../shared/theme/tizaiaTheme';

const RECENT_TASKS: MatrixBoardColumn[] = [
  { id: 'task-1', label: 'Task 1' },
  { id: 'task-2', label: 'Task 2' },
  { id: 'task-3', label: 'Task 3' },
  { id: 'task-4', label: 'Task 4' },
  { id: 'task-5', label: 'Task 5' },
];

/** 6 filas como en el diseño definitivo (DESIGN.md §5.4). */
const MOCK_STUDENTS: MatrixBoardRow[] = [
  { id: 'student-1', studentName: 'Clara' },
  { id: 'student-2', studentName: 'Mike' },
  { id: 'student-3', studentName: 'Eva' },
  { id: 'student-4', studentName: 'Jessica' },
  { id: 'student-5', studentName: 'Pedro' },
  { id: 'student-6', studentName: 'Lucía' },
];

/** Estados de ejemplo (mock); en Tareas el pendiente no tiene fondo. */
const MOCK_CELL_STATES: Record<string, StatusCellState> = {
  'student-1:task-1': 'done',
  'student-1:task-3': 'undone',
  'student-1:task-4': 'done',
  'student-1:task-5': 'undone',
  'student-2:task-1': 'done',
  'student-2:task-2': 'done',
  'student-3:task-4': 'done',
  'student-4:task-1': 'undone',
  'student-4:task-2': 'done',
  'student-5:task-3': 'done',
  'student-6:task-1': 'done',
  'student-6:task-5': 'undone',
};

/**
 * Tareas definitiva (DESIGN.md §5.4, frame n1149 de Tizaia.op): matriz de
 * 5 tareas × 6 alumnos (avatar + nombre), FAB de alta y TabBar.
 * El estado entregada/no entregada real y la persistencia quedan para la
 * fase funcional.
 */
export function TasksScreen(): React.JSX.Element {
  return (
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>TAREAS</ScreenTitle>
      </View>
      <View style={styles.board}>
        <MatrixBoard
          actionAccessibilityLabel={(row, column) =>
            `Entrega de ${column.label} para ${row.studentName}`
          }
          cellStates={MOCK_CELL_STATES}
          columns={RECENT_TASKS}
          pendingTransparent
          rows={MOCK_STUDENTS}
          showRowNames
        />
      </View>
      <Fab accessibilityLabel="Añadir tarea" style={styles.fab} />
      <TabBar style={styles.tabBar} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    paddingHorizontal: dp(18),
  },
  fab: {
    bottom: dp(141),
    position: 'absolute',
    right: dp(35),
  },
  tabBar: {
    alignSelf: 'center',
    marginBottom: dp(24),
    marginTop: dp(16),
  },
  titleBlock: {
    marginBottom: dp(24),
    marginTop: dp(24),
  },
});
