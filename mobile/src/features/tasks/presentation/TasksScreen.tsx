import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import {
  BoardSkeleton,
  DataStateView,
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
import { useSchoolRepository } from '../../../app/AppDependenciesProvider';
import {
  toUserMessage,
  useSchoolInvalidation,
  useSchoolResource,
} from '../../../shared/state/schoolDataProvider';
import { getDayMonthLabel } from '../../../domain/school/schoolDates';
import {
  getStudentFullName,
  getStudentInitials,
} from '../../../domain/school/models';
import type { SubmissionStatus } from '../../../domain/school/models';
import { selectActiveClassData } from '../../../domain/school/activeClassData';

/** Mapeo de estado de entrega a celda visual existente (sin cambios de icono). */
const CELL_STATE_BY_SUBMISSION: Record<SubmissionStatus, StatusCellState> = {
  submitted: 'done',
  notSubmitted: 'undone',
  pending: 'pending',
};

const SUBMISSION_CYCLE: readonly SubmissionStatus[] = [
  'submitted',
  'notSubmitted',
  'pending',
];

/**
 * Tareas definitiva (DESIGN.md §5.4, frame n1149 de Tarea.op): matriz de
 * tareas × alumnos de la clase activa (avatar + nombre), FAB de alta y
 * TabBar. Persistencia (MOB-API-001): ciclo entregada→no entregada→pendiente
 * con **actualización optimista y rollback** sobre el `PUT` de entregas.
 */
export function TasksScreen(): React.JSX.Element {
  const onPressTab = useTabBarPress();
  const schoolRepository = useSchoolRepository();
  const invalidate = useSchoolInvalidation();

  const resource = useSchoolResource(async () => {
    // El bootstrap agregado sirve datos de todo el centro: se acota a la
    // clase activa para no mezclar tareas ni entregas de otras clases.
    const bootstrap = await schoolRepository.getBootstrap();
    return selectActiveClassData(bootstrap);
  }, []);

  /** Overrides optimistas por celda (`studentId:assignmentId`). */
  const [optimistic, setOptimistic] = useState<
    Record<string, SubmissionStatus>
  >({});

  const onCellPress = useCallback(
    (row: MatrixBoardRow, column: MatrixBoardColumn) => {
      if (resource.state.status !== 'success') return;
      const { submissions, assignments } = resource.state.data;
      const assignment = assignments.find((item) => item.id === column.id);
      if (assignment === undefined) return;
      const cellId = `${row.id}:${column.id}`;

      const serverRecord = submissions.find(
        (submission) =>
          submission.studentId === row.id &&
          submission.assignmentId === column.id,
      );
      const currentStatus =
        optimistic[cellId] ?? serverRecord?.status ?? 'pending';
      const currentIndex = SUBMISSION_CYCLE.indexOf(currentStatus);
      const nextStatus =
        SUBMISSION_CYCLE[(currentIndex + 1) % SUBMISSION_CYCLE.length]!;

      const previousStatus = optimistic[cellId] ?? serverRecord?.status;
      setOptimistic((current) => ({ ...current, [cellId]: nextStatus }));
      void (async () => {
        try {
          await schoolRepository.setSubmissionStatus({
            assignmentId: column.id,
            studentId: row.id,
            status: nextStatus,
          });
          invalidate();
        } catch (error) {
          setOptimistic((current) => {
            const next = { ...current };
            if (previousStatus === undefined) delete next[cellId];
            else next[cellId] = previousStatus;
            return next;
          });
          Alert.alert('No se pudo guardar la entrega', toUserMessage(error));
        }
      })();
    },
    [invalidate, optimistic, resource.state, schoolRepository],
  );

  const cellStates: Record<string, StatusCellState> = {};
  if (resource.state.status === 'success') {
    for (const submission of resource.state.data.submissions) {
      cellStates[`${submission.studentId}:${submission.assignmentId}`] =
        CELL_STATE_BY_SUBMISSION[submission.status];
    }
    for (const [cellId, status] of Object.entries(optimistic)) {
      cellStates[cellId] = CELL_STATE_BY_SUBMISSION[status];
    }
  }

  return (
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>TAREAS</ScreenTitle>
      </View>
      <DataStateView
        emptyMessage="No hay tareas para esta clase."
        onRetry={resource.reload}
        skeleton={<BoardSkeleton columns={4} rows={10} showRowNames />}
        state={resource.state}
      />
      {resource.state.status === 'success' && (
        <View style={styles.board}>
          <MatrixBoard
            actionAccessibilityLabel={(row, column) =>
              `Entrega de ${column.label} para ${row.studentName}`
            }
            cellStates={cellStates}
            columns={resource.state.data.assignments.map((assignment) => ({
              id: assignment.id,
              label: assignment.title,
              secondaryLabel: getDayMonthLabel(assignment.dueDate),
            }))}
            onCellPress={onCellPress}
            pendingTransparent
            rows={resource.state.data.students.map((student) => ({
              id: student.id,
              studentName: getStudentFullName(student),
              initials: getStudentInitials(student),
            }))}
            showRowNames
          />
        </View>
      )}
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
