import { StyleSheet, View } from 'react-native';

import {
  MatrixBoard,
  ScreenBackground,
  ScreenTitle,
  TabBar,
  type MatrixBoardColumn,
  type MatrixBoardRow,
  type StatusCellState,
} from '../../../shared/components';
import { dp } from '../../../shared/theme/tizaiaTheme';
import { useTabBarPress } from '../../../navigation/useTabBarPress';

const ATTENDANCE_DATES: MatrixBoardColumn[] = [
  { id: 'day-1', label: 'Día 1' },
  { id: 'day-2', label: 'Día 2' },
  { id: 'day-3', label: 'Día 3' },
  { id: 'day-4', label: 'Día 4' },
  { id: 'day-5', label: 'Día 5' },
];

/** 7 filas como en el diseño definitivo (DESIGN.md §5.2). */
const MOCK_STUDENTS: MatrixBoardRow[] = [
  { id: 'student-1', studentName: 'Clara' },
  { id: 'student-2', studentName: 'Mike' },
  { id: 'student-3', studentName: 'Eva' },
  { id: 'student-4', studentName: 'Jessica' },
  { id: 'student-5', studentName: 'Pedro' },
  { id: 'student-6', studentName: 'Lucía' },
  { id: 'student-7', studentName: 'Sofía' },
];

/** Estados de ejemplo (mock) para pintar los tres estados de celda. */
const MOCK_CELL_STATES: Record<string, StatusCellState> = {
  'student-1:day-1': 'done',
  'student-1:day-2': 'undone',
  'student-1:day-3': 'undone',
  'student-1:day-4': 'undone',
  'student-2:day-1': 'done',
  'student-2:day-2': 'undone',
  'student-3:day-1': 'done',
  'student-3:day-3': 'done',
  'student-4:day-2': 'done',
  'student-5:day-1': 'undone',
  'student-5:day-4': 'done',
  'student-6:day-2': 'done',
  'student-6:day-5': 'done',
  'student-7:day-1': 'done',
};

/**
 * Asistencia definitiva (DESIGN.md §5.2, frame n1053 de Tizaia.op): título,
 * matriz de 5 días × 7 alumnos con celdas de estado y TabBar.
 * El ciclo y persistencia de asistencia quedan para la fase funcional.
 */
export function AttendanceScreen(): React.JSX.Element {
  const onPressTab = useTabBarPress();

  return (
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>ASISTENCIA</ScreenTitle>
      </View>
      <View style={styles.board}>
        <MatrixBoard
          actionAccessibilityLabel={(row, column) =>
            `Asistencia de ${row.studentName} en ${column.label}`
          }
          cellStates={MOCK_CELL_STATES}
          columns={ATTENDANCE_DATES}
          rows={MOCK_STUDENTS}
        />
      </View>
      <TabBar onPressTab={onPressTab} style={styles.tabBar} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    paddingHorizontal: dp(18),
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
