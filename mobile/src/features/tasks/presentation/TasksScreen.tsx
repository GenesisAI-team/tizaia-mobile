import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { CircularStateButton } from '../../../shared/components/CircularStateButton';
import { StudentAvatar } from '../../../shared/components/StudentAvatar';
import { colors, spacing, typography } from '../../../shared/theme';
import type { TaskDeliveryVisualState } from './tasksMockData';
import { MOCK_TASK_STUDENTS, MOCK_TASKS } from './tasksMockData';
import {
  createHorizontalScrollSync,
  formatShortDate,
  getDeliveryStateColor,
  getTaskColumnWidth,
  MATRIX_AVATAR_COLUMN_WIDTH,
  MATRIX_SCREEN_PADDING,
  sortTasksByRecency,
} from './tasksLayout';

const HEADER_SCROLL_KEY = 'tasks-header';
const SCROLL_EVENT_THROTTLE = 16;

function rowScrollKey(studentId: string): string {
  return `tasks-row-${studentId}`;
}

function getDeliveryStateLabel(state: TaskDeliveryVisualState): string {
  return state === 'delivered' ? 'Entregada' : 'No entregada';
}

/**
 * Diseño visual de Tareas (HU-007, issue #19): matriz equivalente a
 * Asistencia con columna fija de avatar, cabecera con las cinco tareas
 * recientes (tres visibles, resto por scroll horizontal sincronizado) y
 * scroll vertical de alumnos. Solo datos mock: sin ciclo de estados,
 * persistencia ni creación de tareas (fuera de alcance).
 */
export function TasksScreen(): React.JSX.Element {
  const { width } = useWindowDimensions();
  const columnWidth = getTaskColumnWidth(width);
  const tasks = sortTasksByRecency(MOCK_TASKS);

  // Controlador de scroll estable entre renders (inicialización perezosa).
  const [sync] = useState(() => createHorizontalScrollSync());

  const handleScroll =
    (key: string) => (event: NativeSyntheticEvent<NativeScrollEvent>) =>
      sync.syncFrom(key, event.nativeEvent.contentOffset.x);

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        TAREAS
      </Text>
      <View style={styles.matrix}>
        <View style={styles.headerRow}>
          <View style={styles.avatarColumn} />
          <ScrollView
            horizontal
            onScroll={handleScroll(HEADER_SCROLL_KEY)}
            ref={sync.register(HEADER_SCROLL_KEY)}
            scrollEventThrottle={SCROLL_EVENT_THROTTLE}
            showsHorizontalScrollIndicator={false}
            style={styles.scrollableArea}
            testID="tasks-header-scroll"
          >
            {tasks.map((task) => (
              <View
                key={task.id}
                style={[styles.headerCell, { width: columnWidth }]}
                testID={`tasks-header-cell-${task.id}`}
              >
                <Text numberOfLines={2} style={styles.headerCellTitle}>
                  {task.title}
                </Text>
                <Text style={styles.headerCellDate}>
                  {formatShortDate(task.dueDate)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <ScrollView style={styles.bodyScroll} testID="tasks-body-scroll">
          {MOCK_TASK_STUDENTS.map((student) => (
            <View key={student.id} style={styles.studentRow}>
              <View style={styles.avatarColumn}>
                <StudentAvatar
                  name={student.name}
                  testID={`tasks-avatar-${student.id}`}
                />
              </View>
              <ScrollView
                horizontal
                onScroll={handleScroll(rowScrollKey(student.id))}
                ref={sync.register(rowScrollKey(student.id))}
                scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                showsHorizontalScrollIndicator={false}
                style={styles.scrollableArea}
                testID={`tasks-row-scroll-${student.id}`}
              >
                {tasks.map((task) => {
                  const state = student.deliveries[task.id] ?? 'notDelivered';
                  return (
                    <View
                      key={task.id}
                      style={[styles.deliveryCell, { width: columnWidth }]}
                    >
                      <CircularStateButton
                        accessibilityLabel={`${task.title} — ${student.name}: ${getDeliveryStateLabel(state)}`}
                        color={getDeliveryStateColor(state)}
                        testID={`tasks-cell-${student.id}-${task.id}`}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  title: {
    color: colors.ink,
    paddingVertical: spacing.md,
    textAlign: 'center',
    textDecorationLine: 'underline',
    ...typography.screenTitle,
  },
  matrix: {
    flex: 1,
    paddingHorizontal: MATRIX_SCREEN_PADDING,
  },
  headerRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  avatarColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: MATRIX_AVATAR_COLUMN_WIDTH,
  },
  scrollableArea: {
    flexGrow: 0,
  },
  headerCell: {
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.xs,
  },
  headerCellTitle: {
    color: colors.ink,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerCellDate: {
    color: colors.mutedText,
    fontSize: typography.caption.fontSize,
  },
  bodyScroll: {
    flex: 1,
  },
  studentRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 64,
  },
  deliveryCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
});
