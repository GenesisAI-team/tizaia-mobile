import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  BoardSkeleton,
  DataStateView,
  MatrixBoard,
  ScreenBackground,
  ScreenTitle,
  TabBar,
  type MatrixBoardColumn,
  type MatrixBoardRow,
  type StatusCellState,
} from '../../../shared/components';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';
import { useTabBarPress } from '../../../navigation/useTabBarPress';
import { useSchoolRepository } from '../../../app/AppDependenciesProvider';
import {
  toUserMessage,
  useSchoolInvalidation,
  useSchoolResource,
} from '../../../shared/state/schoolDataProvider';
import { useAppBootstrap } from '../../../shared/state/appBootstrapProvider';
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

const ATTENDANCE_BY_CELL_STATE: Record<StatusCellState, AttendanceStatus> = {
  done: 'present',
  undone: 'absent',
  pending: 'late',
};

/**
 * Asistencia definitiva (DESIGN.md §5.2, frame n1053 de Tizaia.op): matriz de
 * 10 días lectivos × alumnos de la clase activa con celdas de estado y TabBar.
 *
 * Persistencia (MOB-API-001): cada pulsación aplica un ciclo
 * presente→ausente→retraso con **actualización optimista y rollback**: la
 * celda cambia al instante; si el backend rechaza el `PUT` (p. ej.
 * `409 NON_SCHOOL_DAY`), se revierte al estado previo y se informa.
 */
export function AttendanceScreen(): React.JSX.Element {
  const onPressTab = useTabBarPress();
  const schoolRepository = useSchoolRepository();
  const invalidate = useSchoolInvalidation();
  const {
    activeClassId,
    state: bootstrapState,
    reload: reloadBootstrap,
  } = useAppBootstrap();

  const boardResource = useSchoolResource(async () => {
    if (activeClassId === null) throw new Error('Cargando clase activa...');
    return schoolRepository.getAttendanceBoard(activeClassId);
  }, [activeClassId]);

  const resource =
    activeClassId === null
      ? ({
          state: bootstrapState as unknown as typeof boardResource.state,
          reload: reloadBootstrap,
        } as typeof boardResource)
      : boardResource;

  /**
   * Overrides optimistas por celda (`studentId:date`). Se limpian cuando el
   * refetch tras invalidación confirma el estado servido por el backend.
   */
  const [optimistic, setOptimistic] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [savingCell, setSavingCell] = useState<string | undefined>(undefined);

  const onCellPress = useCallback(
    (row: MatrixBoardRow, column: MatrixBoardColumn) => {
      if (resource.state.status !== 'success') return;
      if (activeClassId === null) return;
      const { attendance, schoolDays, students } = resource.state.data;
      const cellId = `${row.id}:${column.id}`;
      if (schoolDays.some((day) => day.date === column.id) === false) return;
      const student = students.find((item) => item.id === row.id);
      if (student === undefined) return;

      const serverRecord = attendance.find(
        (record) => record.studentId === row.id && record.date === column.id,
      );
      // El override en curso manda para calcular el siguiente estado.
      // Una celda sin registro parte del ciclo como "pendiente" (late).
      const previousStatus = optimistic[cellId] ?? serverRecord?.status;
      const currentStatus: AttendanceStatus = previousStatus ?? 'late';
      const currentVisual = CELL_STATE_BY_ATTENDANCE[currentStatus];
      const nextVisualOrder: StatusCellState[] = ['done', 'undone', 'pending'];
      const nextVisual =
        nextVisualOrder[
          (nextVisualOrder.indexOf(currentVisual) + 1) % nextVisualOrder.length
        ]!;
      const nextStatus = ATTENDANCE_BY_CELL_STATE[nextVisual];

      setOptimistic((current) => ({ ...current, [cellId]: nextStatus }));
      setSavingCell(cellId);
      void (async () => {
        try {
          await schoolRepository.setAttendanceStatus({
            classId: activeClassId,
            studentId: row.id,
            date: column.id,
            status: nextStatus,
          });
          invalidate();
        } catch (error) {
          // Rollback: se restaura el último estado confirmado.
          setOptimistic((current) => {
            const next = { ...current };
            if (previousStatus === undefined) delete next[cellId];
            else next[cellId] = previousStatus;
            return next;
          });
          Alert.alert('No se pudo guardar la asistencia', toUserMessage(error));
        } finally {
          setSavingCell(undefined);
        }
      })();
    },
    [activeClassId, invalidate, optimistic, resource.state, schoolRepository],
  );

  const cellStates: Record<string, StatusCellState> = {};
  if (resource.state.status === 'success') {
    for (const record of resource.state.data.attendance) {
      cellStates[`${record.studentId}:${record.date}`] =
        CELL_STATE_BY_ATTENDANCE[record.status];
    }
    for (const [cellId, status] of Object.entries(optimistic)) {
      cellStates[cellId] = CELL_STATE_BY_ATTENDANCE[status];
    }
  }

  return (
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>ASISTENCIA</ScreenTitle>
      </View>
      <DataStateView
        emptyMessage="No hay alumnos o días lectivos que mostrar."
        onRetry={resource.reload}
        skeleton={<BoardSkeleton columns={4} rows={10} />}
        state={resource.state}
      />
      {resource.state.status === 'success' && (
        <View style={styles.board}>
          <MatrixBoard
            actionAccessibilityLabel={(row, column) =>
              `Asistencia de ${row.studentName} en ${column.label}`
            }
            cellStates={cellStates}
            columns={resource.state.data.schoolDays.map((day) => ({
              id: day.date,
              label: day.label,
              secondaryLabel: day.secondaryLabel,
            }))}
            onCellPress={onCellPress}
            rows={resource.state.data.students.map((student) => ({
              id: student.id,
              studentName: getStudentFullName(student),
              initials: getStudentInitials(student),
            }))}
          />
        </View>
      )}
      {savingCell !== undefined && (
        <View pointerEvents="none" style={styles.savingBadge}>
          <Text style={styles.savingText}>Guardando…</Text>
        </View>
      )}
      <TabBar onPressTab={onPressTab} style={styles.tabBar} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    paddingHorizontal: dp(18),
  },
  savingBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFFCC',
    borderRadius: dp(18),
    bottom: dp(150),
    paddingHorizontal: dp(24),
    paddingVertical: dp(10),
    position: 'absolute',
  },
  savingText: {
    color: tizaiaColors.ink,
    fontSize: dp(17),
    fontWeight: '600',
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
