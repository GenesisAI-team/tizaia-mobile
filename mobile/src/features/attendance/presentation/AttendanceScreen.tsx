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
import { schoolRepository } from '../../../infrastructure/in-memory';
import {
  getStudentFullName,
  getStudentInitials,
} from '../../../domain/school/models';
import type { AttendanceStatus } from '../../../domain/school/models';

/** Mapeo de estado de asistencia a celda visual existente (sin cambios de icono). */
const CELL_STATE_BY_ATTENDANCE: Record<AttendanceStatus, StatusCellState> = {
  present: 'done',
  absent: 'undone',
  late: 'pending',
};

/**
 * Asistencia definitiva (DESIGN.md §5.2, frame n1053 de Tizaia.op): título,
 * matriz de 10 días lectivos × alumnos de la clase activa con celdas de estado
 * y TabBar. Los 5 días más recientes quedan visibles y el resto usa scroll
 * horizontal. La persistencia queda para la fase funcional.
 */
export function AttendanceScreen(): React.JSX.Element {
  const onPressTab = useTabBarPress();

  const students = schoolRepository.getStudents();
  const attendance = schoolRepository.getAttendanceForClass();
  const schoolDays = schoolRepository.getSchoolDays();

  const columns: MatrixBoardColumn[] = schoolDays.map((day) => ({
    id: day.date,
    label: day.label,
    secondaryLabel: day.secondaryLabel,
  }));

  const rows: MatrixBoardRow[] = students.map((student) => ({
    id: student.id,
    studentName: getStudentFullName(student),
    initials: getStudentInitials(student),
  }));

  const cellStates: Record<string, StatusCellState> = {};
  for (const record of attendance) {
    cellStates[`${record.studentId}:${record.date}`] =
      CELL_STATE_BY_ATTENDANCE[record.status];
  }

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
          cellStates={cellStates}
          columns={columns}
          rows={rows}
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
