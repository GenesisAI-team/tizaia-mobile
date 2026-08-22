import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import {
  DataStateView,
  GlassCard,
  ScreenBackground,
  ScreenTitle,
  TabBar,
} from '../../../shared/components';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';
import { useTabBarPress } from '../../../navigation/useTabBarPress';
import type { RootDrawerParamList } from '../../../navigation/types';
import { useSchoolRepository } from '../../../app/AppDependenciesProvider';
import {
  toUserMessage,
  useSchoolInvalidation,
  useSchoolResource,
} from '../../../shared/state/schoolDataProvider';
import {
  getStudentInitials,
  type AnnotationType,
  type StudentProgress,
} from '../../../domain/school/models';
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
 * El seguimiento llega del endpoint agregado `/v1/students/:id/progress`
 * (#67); la edición limitada aplica el PATCH y solo se refleja si el
 * backend lo confirma (Q-014).
 */
export function StudentProfileScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootDrawerParamList, 'StudentProfile'>>();
  const onPressTab = useTabBarPress();
  const schoolRepository = useSchoolRepository();
  const invalidate = useSchoolInvalidation();

  const studentId = route.params?.studentId;

  const resource = useSchoolResource<StudentProgress | undefined>(async () => {
    if (studentId === undefined) return undefined;
    return schoolRepository.getStudentProgress(studentId);
  }, [studentId]);

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  if (studentId === undefined) {
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

  if (resource.state.status === 'error' || resource.state.status === 'empty') {
    return (
      <ScreenBackground>
        <View style={styles.titleBlock}>
          <ScreenTitle variant="form">ALUMNO</ScreenTitle>
        </View>
        <DataStateView
          emptyMessage="Este alumno ya no existe."
          onRetry={resource.reload}
          state={resource.state}
        />
        <TabBar onPressTab={onPressTab} style={styles.tabBar} />
      </ScreenBackground>
    );
  }

  if (
    resource.state.status !== 'success' ||
    resource.state.data === undefined
  ) {
    return (
      <ScreenBackground>
        <View style={styles.titleBlock}>
          <ScreenTitle variant="form">ALUMNO</ScreenTitle>
        </View>
        <DataStateView state={{ status: 'loading' }} />
        <TabBar onPressTab={onPressTab} style={styles.tabBar} />
      </ScreenBackground>
    );
  }

  const progress: StudentProgress = resource.state.data;
  const { student } = progress;

  const startEditing = (): void => {
    setFirstName(student.firstName);
    setLastName(student.lastName);
    setIsEditing(true);
  };

  const saveEdits = (): void => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    if (trimmedFirst.length === 0 && trimmedLast.length === 0) return;
    void (async () => {
      setSaving(true);
      try {
        await schoolRepository.updateStudentName(student.id, {
          ...(trimmedFirst.length > 0 ? { firstName: trimmedFirst } : {}),
          ...(trimmedLast.length > 0 ? { lastName: trimmedLast } : {}),
        });
        setIsEditing(false);
        // Recarga del perfil con los datos confirmados por el backend.
        invalidate();
      } catch (error) {
        Alert.alert('No se pudo guardar', toUserMessage(error));
      } finally {
        setSaving(false);
      }
    })();
  };

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
            onPress={startEditing}
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

        {isEditing ? (
          <GlassCard cornerRadius={28} style={styles.card}>
            <Text style={styles.sectionTitleSmall}>EDITAR ALUMNO</Text>
            <Text style={styles.formLabel}>Nombre</Text>
            <TextInput
              accessibilityLabel="Nombre del alumno"
              autoCapitalize="words"
              onChangeText={setFirstName}
              style={styles.formInput}
              testID="student-first-name-input"
              value={firstName}
            />
            <Text style={styles.formLabel}>Apellidos</Text>
            <TextInput
              accessibilityLabel="Apellidos del alumno"
              autoCapitalize="words"
              onChangeText={setLastName}
              style={styles.formInput}
              testID="student-last-name-input"
              value={lastName}
            />
            <View style={styles.formActions}>
              <Pressable
                accessibilityLabel="Cancelar edición"
                accessibilityRole="button"
                disabled={saving}
                onPress={() => setIsEditing(false)}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
                testID="student-edit-cancel"
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Guardar cambios del alumno"
                accessibilityRole="button"
                disabled={
                  saving ||
                  (firstName.trim().length === 0 &&
                    lastName.trim().length === 0)
                }
                onPress={saveEdits}
                style={({ pressed }) => [
                  styles.saveButton,
                  (pressed || saving) && styles.pressed,
                ]}
                testID="student-edit-save"
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </Text>
              </Pressable>
            </View>
          </GlassCard>
        ) : (
          <GlassCard cornerRadius={28} style={styles.card}>
            <View style={styles.summaryRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>
                  {getStudentInitials(student)}
                </Text>
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.studentName}>
                  {[student.firstName, student.lastName].join(' ')}
                </Text>
                <Text style={styles.studentGroup}>
                  {progress.class.groupName}
                </Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVO</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        )}

        <GlassCard cornerRadius={28} style={styles.card}>
          <Text style={styles.sectionTitle}>ASISTENCIA</Text>
          <View style={styles.metricsRow}>
            <MetricRing
              color={tizaiaColors.success}
              label="Asistencia"
              value={`${progress.attendance.attendanceRate}%`}
            />
            <MetricRing
              color={tizaiaColors.danger}
              label="Faltas"
              value={String(progress.attendance.absent)}
            />
            <MetricRing
              color={tizaiaColors.warning}
              label="Retrasos"
              value={String(progress.attendance.late)}
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
              value={String(progress.annotations.positive)}
            />
            <MetricRing
              color={ANNOTATION_TYPE_COLORS.contrary}
              label={ANNOTATION_TYPE_LABELS.contrary}
              value={String(progress.annotations.contrary)}
            />
            <MetricRing
              color={ANNOTATION_TYPE_COLORS.aggravating}
              label={ANNOTATION_TYPE_LABELS.aggravating}
              value={String(progress.annotations.aggravating)}
            />
          </View>
        </GlassCard>

        <GlassCard cornerRadius={28} style={styles.card}>
          <Text style={styles.sectionTitle}>TAREAS</Text>
          <View style={styles.metricsRow}>
            <MetricRing
              color={tizaiaColors.success}
              label="Completadas"
              value={String(progress.tasks.submitted)}
            />
            <MetricRing
              color={tizaiaColors.warning}
              label="Pendientes"
              value={String(progress.tasks.pending)}
            />
            <MetricRing
              color={tizaiaColors.danger}
              label="Sin entregar"
              value={String(progress.tasks.notSubmitted)}
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
  cancelButton: {
    alignItems: 'center',
    borderRadius: dp(18),
    borderWidth: 1,
    borderColor: tizaiaColors.fieldBorder,
    flex: 1,
    height: dp(64),
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: tizaiaColors.ink,
    fontSize: dp(19),
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
  formActions: {
    flexDirection: 'row',
    gap: dp(16),
    marginTop: dp(24),
  },
  formInput: {
    backgroundColor: tizaiaColors.fieldBackground,
    borderColor: tizaiaColors.fieldBorder,
    borderRadius: dp(18),
    borderWidth: 1,
    color: tizaiaColors.ink,
    fontSize: dp(19),
    minHeight: dp(64),
    paddingHorizontal: dp(20),
  },
  formLabel: {
    color: tizaiaColors.textMenuSecondary,
    fontSize: dp(17),
    fontWeight: '600',
    marginBottom: dp(8),
    marginTop: dp(16),
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: dp(20),
  },
  pressed: {
    opacity: 0.75,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.inkButton,
    borderRadius: dp(18),
    flex: 1,
    height: dp(64),
    justifyContent: 'center',
  },
  saveButtonText: {
    color: tizaiaColors.white,
    fontSize: dp(19),
    fontWeight: '700',
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
