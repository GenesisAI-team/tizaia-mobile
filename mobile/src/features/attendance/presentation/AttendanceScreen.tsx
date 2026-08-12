import { useMemo, useRef } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatusCircleButton } from '../../../shared/components/StatusCircleButton';
import { StudentAvatar } from '../../../shared/components/StudentAvatar';
import {
  colors,
  spacing,
  typography,
} from '../../../shared/theme/designTokens';
import {
  ATTENDANCE_ROW_HEIGHT,
  AVATAR_COLUMN_WIDTH,
  computeDateCellWidth,
  formatDateLabel,
} from './attendanceLayout';
import {
  buildRecentDates,
  getStudentInitials,
  MOCK_STUDENTS,
  mockStatusAt,
} from './mockAttendance';
import type { MockAttendanceStatus } from './mockAttendance';
import { syncHeaderScroll } from './scrollSync';

const STATUS_COLORS: Record<MockAttendanceStatus, string> = {
  absent: colors.danger,
  attended: colors.success,
  late: colors.warning,
  unmarked: colors.surface,
};

const STATUS_LABELS: Record<MockAttendanceStatus, string> = {
  absent: 'No asistido',
  attended: 'Asistido',
  late: 'Tarde',
  unmarked: 'Sin marcar',
};

/**
 * Issue #17: los botones son pulsables solo a nivel visual. El ciclo
 * Asistido → No asistido → Tarde (BR-ASIS-001) y la persistencia son
 * RF-ASIS pendientes, así que la pulsación no cambia estado.
 */
const handleVisualPress = (): void => undefined;

/**
 * Diseño visual de Asistencia (HU-004, issue #17): matriz con columna fija de
 * avatares, cinco fechas recientes (tres visibles) y scroll horizontal
 * sincronizado entre cabecera y celdas. Solo datos mock; sin lógica RF.
 * Consume los contratos compartidos de UI-000 (#16, PR #22).
 */
export function AttendanceScreen(): React.JSX.Element {
  const dates = useMemo(() => buildRecentDates(new Date()), []);
  const headerScrollRef = useRef<ScrollView>(null);
  const windowWidth = Dimensions.get('window').width;
  const cellWidth = computeDateCellWidth(windowWidth - AVATAR_COLUMN_WIDTH);

  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        ASISTENCIA
      </Text>
      <View style={styles.headerRow}>
        <View style={styles.headerCorner} />
        <ScrollView
          horizontal
          ref={headerScrollRef}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.datesHeader}
          testID="attendance-dates-scroll"
        >
          {dates.map((date) => {
            const label = formatDateLabel(date);
            return (
              <View
                accessibilityLabel={`Fecha ${label.weekday} ${label.day}`}
                key={date}
                style={[styles.dateCell, { width: cellWidth }]}
              >
                <Text style={styles.dateWeekday}>{label.weekday}</Text>
                <Text style={styles.dateDay}>{label.day}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView style={styles.body} testID="attendance-body-scroll">
        <View style={styles.bodyRow}>
          <View style={styles.avatarColumn} testID="attendance-avatar-column">
            {MOCK_STUDENTS.map((student) => (
              <View key={student.id} style={styles.avatarCell}>
                <StudentAvatar
                  accessibilityLabel={`Foto de ${student.name}`}
                  imageUri={student.photoUrl}
                  initials={getStudentInitials(student.name)}
                  size={40}
                />
              </View>
            ))}
          </View>
          <ScrollView
            horizontal
            onScroll={(event) => syncHeaderScroll(headerScrollRef, event)}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator
            testID="attendance-cells-scroll"
          >
            <View>
              {MOCK_STUDENTS.map((student, rowIndex) => (
                <View key={student.id} style={styles.cellsRow}>
                  {dates.map((date, columnIndex) => {
                    const status = mockStatusAt(rowIndex, columnIndex);
                    const label = formatDateLabel(date);
                    return (
                      <View
                        key={date}
                        style={[styles.statusCell, { width: cellWidth }]}
                      >
                        <StatusCircleButton
                          accessibilityLabel={`${student.name}, ${label.weekday} ${label.day}: ${STATUS_LABELS[status]}`}
                          color={STATUS_COLORS[status]}
                          onPress={handleVisualPress}
                          testID={`attendance-cell-${student.id}-${date}`}
                        />
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    paddingVertical: spacing.md,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  headerRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  headerCorner: {
    width: AVATAR_COLUMN_WIDTH,
  },
  datesHeader: {
    flexGrow: 0,
  },
  dateCell: {
    alignItems: 'center',
    borderLeftColor: colors.border,
    borderLeftWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  dateWeekday: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
  },
  dateDay: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  bodyRow: {
    flexDirection: 'row',
  },
  avatarColumn: {
    borderRightColor: colors.border,
    borderRightWidth: 1,
    width: AVATAR_COLUMN_WIDTH,
  },
  avatarCell: {
    alignItems: 'center',
    height: ATTENDANCE_ROW_HEIGHT,
    justifyContent: 'center',
  },
  cellsRow: {
    flexDirection: 'row',
    height: ATTENDANCE_ROW_HEIGHT,
  },
  statusCell: {
    alignItems: 'center',
    borderLeftColor: colors.border,
    borderLeftWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
});
