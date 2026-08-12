import { StyleSheet, View } from 'react-native';

import {
  MatrixBoard,
  ScreenTitle,
  type MatrixBoardColumn,
  type MatrixBoardRow,
} from '../../../shared/components';
import { colors, spacing } from '../../../shared/theme/designTokens';

const RECENT_TASKS: MatrixBoardColumn[] = [
  { id: 'task-1', label: 'Task 1' },
  { id: 'task-2', label: 'Task 2' },
  { id: 'task-3', label: 'Task 3' },
  { id: 'task-4', label: 'Task 4' },
  { id: 'task-5', label: 'Task N' },
];

const MOCK_STUDENTS: MatrixBoardRow[] = [
  { id: 'student-1', studentName: 'Clara' },
  { id: 'student-2', studentName: 'Mike' },
  { id: 'student-3', studentName: 'Eva' },
  { id: 'student-4', studentName: 'Jessica' },
  { id: 'student-5', studentName: 'Pedro' },
  { id: 'student-6', studentName: 'Lucía' },
];

/** Diseño visual HU-007. El estado entregada/no entregada y persistencia quedan pendientes. */
export function TasksScreen(): React.JSX.Element {
  return (
    <View style={styles.screen}>
      <ScreenTitle>TAREAS</ScreenTitle>
      <MatrixBoard
        actionAccessibilityLabel={(row, column) =>
          `Entrega de ${column.label} para ${row.studentName}`
        }
        columns={RECENT_TASKS}
        rows={MOCK_STUDENTS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.md,
  },
});
