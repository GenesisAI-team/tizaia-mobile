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
import { useTabBarPress } from '../../../navigation/useTabBarPress';
import { schoolRepository } from '../../../infrastructure/in-memory';
import { getDayMonthLabel } from '../../../domain/school/schoolDates';
import {
  getStudentFullName,
  getStudentInitials,
} from '../../../domain/school/models';
import type { SubmissionStatus } from '../../../domain/school/models';

/** Mapeo de estado de entrega a celda visual existente (sin cambios de icono). */
const CELL_STATE_BY_SUBMISSION: Record<SubmissionStatus, StatusCellState> = {
  submitted: 'done',
  notSubmitted: 'undone',
  pending: 'pending',
};

/**
 * Tareas definitiva (DESIGN.md §5.4, frame n1149 de Tizaia.op): matriz de
 * 10 tareas × alumnos de la clase activa (avatar + nombre), FAB de alta y
 * TabBar. Las 5 tareas más recientes quedan visibles y el resto usa scroll
 * horizontal. La persistencia queda para la fase funcional.
 */
export function TasksScreen(): React.JSX.Element {
  const onPressTab = useTabBarPress();

  const students = schoolRepository.getStudents();
  const assignments = schoolRepository.getAssignments();

  const columns: MatrixBoardColumn[] = assignments.map((assignment) => ({
    id: assignment.id,
    label: assignment.title,
    secondaryLabel: getDayMonthLabel(assignment.dueDate),
  }));

  const rows: MatrixBoardRow[] = students.map((student) => ({
    id: student.id,
    studentName: getStudentFullName(student),
    initials: getStudentInitials(student),
  }));

  const cellStates: Record<string, StatusCellState> = {};
  for (const assignment of assignments) {
    for (const submission of schoolRepository.getSubmissions(assignment.id)) {
      cellStates[`${submission.studentId}:${assignment.id}`] =
        CELL_STATE_BY_SUBMISSION[submission.status];
    }
  }

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
          cellStates={cellStates}
          columns={columns}
          pendingTransparent
          rows={rows}
          showRowNames
        />
      </View>
      <Fab accessibilityLabel="Añadir tarea" style={styles.fab} />
      <TabBar onPressTab={onPressTab} style={styles.tabBar} />
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
