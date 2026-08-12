import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import {
  ActionIconButton,
  ScreenTitle,
  StudentAvatar,
} from '../../../shared/components';
import {
  EyeIcon,
  TrashIcon,
  WarningIcon,
} from '../../../shared/components/icons';
import { colors, radius, spacing } from '../../../shared/theme/designTokens';

type StudentListItem = {
  id: string;
  name: string;
};

const INITIAL_STUDENTS: StudentListItem[] = [
  { id: 'student-1', name: 'Clara' },
  { id: 'student-2', name: 'Mike' },
  { id: 'student-3', name: 'Eva' },
  { id: 'student-4', name: 'Jessica' },
  { id: 'student-5', name: 'Pedro' },
  { id: 'student-6', name: 'Lucía' },
];

/**
 * Diseño visual HU-005/HU-006. Las rutas StudentDetail/NewAnnotation y la
 * gestión real de borrado quedan pendientes para la implementación funcional.
 */
export function StudentsScreen(): React.JSX.Element {
  const [students, setStudents] = useState(INITIAL_STUDENTS);

  const removeStudent = (studentId: string): void => {
    setStudents((current) => current.filter((item) => item.id !== studentId));
  };

  return (
    <View style={styles.screen}>
      <ScreenTitle>ALUMNOS</ScreenTitle>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={students}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay alumnos visibles.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.studentCell}>
              <StudentAvatar
                accessibilityLabel={`Foto de ${item.name}`}
                initials={item.name.slice(0, 2).toUpperCase()}
              />
              <Text numberOfLines={1} style={styles.name}>
                {item.name}
              </Text>
            </View>
            <View style={styles.actions}>
              <ActionIconButton
                accessibilityLabel={`Ver detalle de ${item.name}`}
                onPress={() => {
                  // Ruta futura StudentDetail: diseño/lógica pendientes.
                }}
                testID={`student-view-${item.id}`}
              >
                <EyeIcon />
              </ActionIconButton>
              <ActionIconButton
                accessibilityLabel={`Crear anotación para ${item.name}`}
                onPress={() => {
                  // Ruta futura NewAnnotation: diseño/lógica pendientes.
                }}
                testID={`student-new-annotation-${item.id}`}
              >
                <WarningIcon />
              </ActionIconButton>
              <ActionIconButton
                accessibilityLabel={`Eliminar a ${item.name} de la lista`}
                onPress={() => removeStudent(item.id)}
                testID={`student-delete-${item.id}`}
              >
                <TrashIcon />
              </ActionIconButton>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    padding: spacing.lg,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  name: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 72,
    padding: spacing.sm,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.md,
  },
  separator: {
    height: spacing.sm,
  },
  studentCell: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: spacing.sm,
  },
});
