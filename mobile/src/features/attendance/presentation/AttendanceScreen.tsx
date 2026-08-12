import { StyleSheet, View } from 'react-native';

import {
  MatrixBoard,
  ScreenTitle,
  type MatrixBoardColumn,
  type MatrixBoardRow,
} from '../../../shared/components';
import { colors, spacing } from '../../../shared/theme/designTokens';

const ATTENDANCE_DATES: MatrixBoardColumn[] = [
  { id: 'day-1', label: 'Día 1' },
  { id: 'day-2', label: 'Día 2' },
  { id: 'day-3', label: 'Día 3' },
  { id: 'day-4', label: 'Día 4' },
  { id: 'day-5', label: 'Día N' },
];

const MOCK_STUDENTS: MatrixBoardRow[] = [
  { id: 'student-1', studentName: 'Clara' },
  { id: 'student-2', studentName: 'Mike' },
  { id: 'student-3', studentName: 'Eva' },
  { id: 'student-4', studentName: 'Jessica' },
  { id: 'student-5', studentName: 'Pedro' },
  { id: 'student-6', studentName: 'Lucía' },
];

/** Diseño visual HU-004. El ciclo y persistencia de asistencia quedan pendientes. */
export function AttendanceScreen(): React.JSX.Element {
  return (
    <View style={styles.screen}>
      <ScreenTitle>ASISTENCIA</ScreenTitle>
      <MatrixBoard
        actionAccessibilityLabel={(row, column) =>
          `Asistencia de ${row.studentName} en ${column.label}`
        }
        columns={ATTENDANCE_DATES}
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
