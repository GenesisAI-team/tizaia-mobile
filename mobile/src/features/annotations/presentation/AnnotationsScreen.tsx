import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import {
  DataStateView,
  Fab,
  GlassCard,
  ScreenBackground,
  ScreenTitle,
  StudentAvatar,
  TabBar,
} from '../../../shared/components';
import { EyeIcon, MailPlusIcon } from '../../../shared/components/icons';
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
  getStudentFullName,
  getStudentInitials,
} from '../../../domain/school/models';
import type { AnnotationType } from '../../../domain/school/models';
import { formatDayMonth } from '../../../domain/school/schoolDates';

type AnnotationListItem = {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  type: AnnotationType;
  description: string;
  managed: boolean;
  dateLabel: string;
};

const ANNOTATION_TYPE_LABELS: Record<AnnotationType, string> = {
  positive: 'Positiva',
  contrary: 'Contraria',
  aggravating: 'Grave',
};

/**
 * Anotaciones definitiva (DESIGN.md §5.6, frame n991 de Tizaia.op): tarjetas
 * con avatar, nombre, descripción, tipo y acciones (ver / enviar mail /
 * confirmar), FAB de nueva anotación y TabBar.
 * Listado servido por la API (#67); el check de gestionada aplica el PATCH
 * con **actualización optimista y rollback** (BR-ANOT-002).
 */
export function AnnotationsScreen(): React.JSX.Element {
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const onPressTab = useTabBarPress();
  const schoolRepository = useSchoolRepository();
  const invalidate = useSchoolInvalidation();

  const resource = useSchoolResource(async () => {
    const [annotations, bootstrap] = await Promise.all([
      schoolRepository.getAnnotations(),
      schoolRepository.getBootstrap(),
    ]);
    return { annotations, studentsById: bootstrap.students };
  }, []);

  /** Overrides optimistas del estado gestionado por id de anotación. */
  const [managedOverrides, setManagedOverrides] = useState<
    Record<string, boolean>
  >({});
  const [savingId, setSavingId] = useState<string | undefined>(undefined);

  const annotations: AnnotationListItem[] =
    resource.state.status === 'success'
      ? (() => {
          const { annotations, studentsById } = resource.state.data;
          return annotations.map((annotation) => {
            const student = studentsById.find(
              (item) => item.id === annotation.studentId,
            );
            return {
              id: annotation.id,
              studentId: annotation.studentId,
              studentName: student ? getStudentFullName(student) : 'Alumno',
              initials: student ? getStudentInitials(student) : 'AL',
              type: annotation.type,
              description: annotation.description,
              managed: managedOverrides[annotation.id] ?? annotation.managed,
              dateLabel: formatDayMonth(annotation.createdAt),
            };
          });
        })()
      : [];

  const toggleChecked = (item: AnnotationListItem): void => {
    if (savingId !== undefined) return;
    const nextManaged = !item.managed;
    setManagedOverrides((current) => ({
      ...current,
      [item.id]: nextManaged,
    }));
    setSavingId(item.id);
    void (async () => {
      try {
        await schoolRepository.setAnnotationManaged(item.id, nextManaged);
        invalidate();
      } catch (error) {
        setManagedOverrides((current) => {
          const next = { ...current };
          delete next[item.id];
          return next;
        });
        Alert.alert('No se pudo actualizar', toUserMessage(error));
      } finally {
        setSavingId(undefined);
      }
    })();
  };

  return (
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>ANOTACIONES</ScreenTitle>
      </View>
      <DataStateView
        emptyMessage="No hay anotaciones registradas."
        onRetry={resource.reload}
        state={resource.state}
      />
      {resource.state.status === 'success' && (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={annotations}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GlassCard cornerRadius={22} style={styles.card}>
              <StudentAvatar
                accessibilityLabel={`Foto de ${item.studentName}`}
                initials={item.initials}
                size={dp(90)}
              />
              <View style={styles.info}>
                <Text numberOfLines={1} style={styles.name}>
                  {item.studentName}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.typeLabel}>
                    {ANNOTATION_TYPE_LABELS[item.type]}
                  </Text>
                  <Text style={styles.dateLabel}>{item.dateLabel}</Text>
                </View>
                <Text numberOfLines={2} style={styles.description}>
                  {item.description}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  accessibilityLabel={`Ver alumno ${item.studentName}`}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() =>
                    navigation.navigate('StudentProfile', {
                      studentId: item.studentId,
                    })
                  }
                  style={({ pressed }) => [
                    styles.viewButton,
                    pressed && styles.pressed,
                  ]}
                  testID={`annotation-view-student-${item.id}`}
                >
                  <EyeIcon color={tizaiaColors.inkButton} size={dp(40)} />
                </Pressable>
                <Pressable
                  accessibilityLabel={`Crear mail para ${item.studentName}`}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() =>
                    navigation.navigate('NewMail', {
                      studentId: item.studentId,
                      source: 'annotation',
                    })
                  }
                  style={({ pressed }) => [
                    styles.sendButton,
                    pressed && styles.pressed,
                  ]}
                  testID={`annotation-new-mail-${item.id}`}
                >
                  <MailPlusIcon color={tizaiaColors.sendIcon} size={dp(44)} />
                </Pressable>
                <Pressable
                  accessibilityLabel={
                    item.managed
                      ? `Desmarcar gestión de la anotación de ${item.studentName}`
                      : `Marcar anotación de ${item.studentName} como gestionada`
                  }
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: item.managed }}
                  disabled={savingId === item.id}
                  hitSlop={8}
                  onPress={() => toggleChecked(item)}
                  style={({ pressed }) => [
                    styles.confirmButton,
                    (pressed || !item.managed) && styles.confirmDimmed,
                  ]}
                  testID={`annotation-check-${item.id}`}
                >
                  <Text style={styles.confirmGlyph}>✓</Text>
                </Pressable>
              </View>
            </GlassCard>
          )}
          style={styles.list}
        />
      )}
      <Fab
        accessibilityLabel="Añadir anotación"
        onPress={() => navigation.navigate('NewAnnotation')}
        style={styles.fab}
      />
      <TabBar onPressTab={onPressTab} style={styles.tabBar} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(28),
  },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: dp(150),
    paddingHorizontal: dp(24),
    paddingVertical: dp(16),
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.confirm,
    borderRadius: dp(26),
    height: dp(52),
    justifyContent: 'center',
    width: dp(52),
  },
  confirmDimmed: {
    opacity: 0.45,
  },
  confirmGlyph: {
    color: tizaiaColors.white,
    fontSize: dp(24),
    fontWeight: '700',
  },
  dateLabel: {
    color: tizaiaColors.textMenuSecondary,
    fontSize: dp(17),
  },
  description: {
    color: tizaiaColors.ink,
    fontSize: dp(20),
    marginTop: dp(6),
  },
  fab: {
    bottom: dp(141),
    position: 'absolute',
    right: dp(35),
  },
  info: {
    flex: 1,
    marginLeft: dp(26),
    marginRight: dp(12),
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: dp(280),
    paddingHorizontal: dp(40),
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(12),
    marginTop: dp(4),
  },
  name: {
    color: tizaiaColors.ink,
    fontSize: dp(30),
  },
  pressed: {
    opacity: 0.7,
  },
  sendButton: {
    alignItems: 'center',
    height: dp(52),
    justifyContent: 'center',
    width: dp(52),
  },
  separator: {
    height: dp(16),
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
  typeLabel: {
    color: tizaiaColors.textMenuSecondary,
    fontSize: dp(17),
    fontWeight: '600',
  },
  viewButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.avatar,
    borderRadius: dp(15),
    height: dp(55),
    justifyContent: 'center',
    width: dp(76),
  },
});
