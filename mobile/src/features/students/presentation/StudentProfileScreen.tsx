import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import {
  GlassCard,
  ScreenBackground,
  ScreenTitle,
  TabBar,
} from '../../../shared/components';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';
import { useTabBarPress } from '../../../navigation/useTabBarPress';
import type { RootDrawerParamList } from '../../../navigation/types';
import { schoolRepository } from '../../../infrastructure/in-memory';
import {
  getStudentFullName,
  getStudentInitials,
} from '../../../domain/school/models';
import type { AnnotationType } from '../../../domain/school/models';
import { MetricRing } from './MetricRing';

const ANNOTATION_TYPE_LABELS: Record<AnnotationType, string> = {
  positive: 'Positivas',
  contrary: 'Contrarias',
  aggravating: 'Graves',
};

const ANNOTATION_TYPE_COLORS: Record<AnnotationType, string> = {
  positive: tizaiaColors.success,
  contrary: tizaiaColors.warning,
  aggravating: tizaiaColors.danger,
};

/**
 * Perfil Alumno definitivo (DESIGN.md §5.12, frame n1867 de Tizaia.op):
 * resumen del alumno con badge ACTIVO, botón de edición, métricas de
 * asistencia/comportamiento/tareas con anillos y descripción.
 * Las métricas se derivan de los datos en memoria del alumno recibido por
 * navegación; sin alumno se muestra un estado vacío. La edición y la
 * persistencia quedan para la fase funcional.
 */
export function StudentProfileScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootDrawerParamList, 'StudentProfile'>>();
  const onPressTab = useTabBarPress();

  const studentId = route.params?.studentId;
  const student = studentId
    ? schoolRepository.getStudent(studentId)
    : undefined;

  if (student === undefined) {
    return (
      <ScreenBackground>
        <View style={styles.titleBlock}>
          <ScreenTitle variant="form">ALUMNO</ScreenTitle>
        </View>
        <GlassCard cornerRadius={28} style={styles.card}>
          <Text style={styles.emptyText}>
            Selecciona un alumno desde la lista para ver su perfil.
          </Text>
        </GlassCard>
        <TabBar onPressTab={onPressTab} style={styles.tabBar} />
      </ScreenBackground>
    );
  }

  const activeClass = schoolRepository.getActiveClass();
  const attendanceRecords = schoolRepository.getAttendance(student.id);
  const totalDays = attendanceRecords.length;
  const absences = attendanceRecords.filter(
    (record) => record.status === 'absent',
  ).length;
  const lates = attendanceRecords.filter(
    (record) => record.status === 'late',
  ).length;
  const attendancePercentage =
    totalDays === 0
      ? '0%'
      : `${Math.round(((totalDays - absences) / totalDays) * 100)}%`;

  const annotations = schoolRepository
    .getAnnotations()
    .filter((annotation) => annotation.studentId === student.id);
  const annotationCounts: Record<AnnotationType, number> = {
    positive: 0,
    contrary: 0,
    aggravating: 0,
  };
  for (const annotation of annotations) {
    annotationCounts[annotation.type] += 1;
  }

  const submissions = schoolRepository
    .getAssignments(student.classId)
    .flatMap((assignment) =>
      schoolRepository
        .getSubmissions(assignment.id)
        .filter((submission) => submission.studentId === student.id),
    );
  const submitted = submissions.filter(
    (submission) => submission.status === 'submitted',
  ).length;
  const notSubmitted = submissions.filter(
    (submission) => submission.status === 'notSubmitted',
  ).length;
  const pending = submissions.filter(
    (submission) => submission.status === 'pending',
  ).length;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <ScreenTitle variant="form">ALUMNO</ScreenTitle>
          </View>
          <Pressable
            accessibilityLabel="Editar alumno"
            accessibilityRole="button"
            onPress={() => {
              // Edición limitada: fase funcional.
            }}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.pressed,
            ]}
            testID="student-edit-button"
          >
            <Svg height={dp(35)} viewBox="0 0 34 35" width={dp(34)}>
              <Path
                d="M 4 27 L 3 35 L 11 34 L 34 11 L 27 4 Z M 24 7 L 31 14"
                fill={tizaiaColors.white}
              />
            </Svg>
          </Pressable>
        </View>

        <GlassCard cornerRadius={28} style={styles.card}>
          <View style={styles.summaryRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>
                {getStudentInitials(student)}
              </Text>
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.studentName}>
                {getStudentFullName(student)}
              </Text>
              <Text style={styles.studentGroup}>{activeClass.groupName}</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVO</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        <GlassCard cornerRadius={28} style={styles.card}>
          <Text style={styles.sectionTitle}>ASISTENCIA</Text>
          <View style={styles.metricsRow}>
            <MetricRing
              color={tizaiaColors.success}
              label="Asistencia"
              value={attendancePercentage}
            />
            <MetricRing
              color={tizaiaColors.danger}
              label="Faltas"
              value={String(absences)}
            />
            <MetricRing
              color={tizaiaColors.warning}
              label="Retrasos"
              value={String(lates)}
            />
          </View>
        </GlassCard>

        {student.description != null && (
          <GlassCard cornerRadius={28} style={styles.card}>
            <Text style={styles.sectionTitle}>DESCRIPCIÓN</Text>
            <Text style={styles.description}>{student.description}</Text>
          </GlassCard>
        )}

        <GlassCard cornerRadius={28} style={styles.card}>
          <Text style={styles.sectionTitleSmall}>
            ANOTACIONES DE COMPORTAMIENTO
          </Text>
          <View style={styles.metricsRow}>
            <MetricRing
              color={ANNOTATION_TYPE_COLORS.positive}
              label={ANNOTATION_TYPE_LABELS.positive}
              value={String(annotationCounts.positive)}
            />
            <MetricRing
              color={ANNOTATION_TYPE_COLORS.contrary}
              label={ANNOTATION_TYPE_LABELS.contrary}
              value={String(annotationCounts.contrary)}
            />
            <MetricRing
              color={ANNOTATION_TYPE_COLORS.aggravating}
              label={ANNOTATION_TYPE_LABELS.aggravating}
              value={String(annotationCounts.aggravating)}
            />
          </View>
        </GlassCard>

        <GlassCard cornerRadius={28} style={styles.card}>
          <Text style={styles.sectionTitle}>TAREAS</Text>
          <View style={styles.metricsRow}>
            <MetricRing
              color={tizaiaColors.success}
              label="Completadas"
              value={String(submitted)}
            />
            <MetricRing
              color={tizaiaColors.warning}
              label="Pendientes"
              value={String(pending)}
            />
            <MetricRing
              color={tizaiaColors.danger}
              label="Sin entregar"
              value={String(notSubmitted)}
            />
          </View>
        </GlassCard>
      </ScrollView>
      <TabBar onPressTab={onPressTab} style={styles.tabBar} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  activeBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: tizaiaColors.success,
    borderRadius: dp(17),
    height: dp(34),
    justifyContent: 'center',
    marginTop: dp(10),
    width: dp(138),
  },
  activeBadgeText: {
    color: tizaiaColors.ink,
    fontSize: dp(14),
    fontWeight: '700',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.avatar,
    borderRadius: dp(48),
    height: dp(96),
    justifyContent: 'center',
    width: dp(96),
  },
  avatarInitials: {
    color: tizaiaColors.ink,
    fontSize: dp(28),
    fontWeight: '700',
  },
  card: {
    elevation: 2,
    marginBottom: dp(20),
    padding: dp(24),
    shadowColor: '#694536',
    shadowOffset: { height: 3.5, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  content: {
    paddingBottom: dp(24),
    paddingHorizontal: dp(40),
  },
  description: {
    color: tizaiaColors.ink,
    fontSize: dp(18),
    marginTop: dp(16),
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.inkButton,
    borderRadius: dp(24),
    elevation: 3,
    height: dp(72),
    justifyContent: 'center',
    shadowColor: tizaiaColors.inkButton,
    shadowOffset: { height: 2.5, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    width: dp(72),
  },
  emptyText: {
    color: tizaiaColors.textMenuSecondary,
    fontSize: dp(20),
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: dp(20),
  },
  pressed: {
    opacity: 0.75,
  },
  sectionTitle: {
    color: tizaiaColors.ink,
    fontSize: dp(19),
    fontWeight: '700',
  },
  sectionTitleSmall: {
    color: tizaiaColors.ink,
    fontSize: dp(18),
    fontWeight: '700',
  },
  studentGroup: {
    color: tizaiaColors.ink,
    fontSize: dp(19),
    fontWeight: '600',
    marginTop: dp(8),
  },
  studentName: {
    color: tizaiaColors.ink,
    fontSize: dp(29),
    fontWeight: '700',
  },
  summaryInfo: {
    flex: 1,
    marginLeft: dp(30),
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  tabBar: {
    alignSelf: 'center',
    marginBottom: dp(24),
  },
  titleBlock: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: dp(24),
    marginTop: dp(24),
  },
});
