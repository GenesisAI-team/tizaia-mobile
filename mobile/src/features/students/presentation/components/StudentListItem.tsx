import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StudentAvatar } from './StudentAvatar';
import { EyeIcon } from './icons/EyeIcon';
import { TrashIcon } from './icons/TrashIcon';
import { WarningIcon } from './icons/WarningIcon';
import type { MockStudent } from '../mockStudents';

export type StudentListItemProps = {
  student: MockStudent;
  onViewDetail: (student: MockStudent) => void;
  onAddAnnotation: (student: MockStudent) => void;
  onDelete: (student: MockStudent) => void;
};

/**
 * Fila del listado de Alumnos (diseño visual HU-005/HU-006, issue #18):
 * avatar compartido + nombre + acciones (ojo azul, warning amarillo,
 * papelera roja). Sin lógica de negocio: cada acción se delega al padre.
 */
export function StudentListItem({
  student,
  onViewDetail,
  onAddAnnotation,
  onDelete,
}: StudentListItemProps): React.JSX.Element {
  return (
    <View style={styles.row} testID={`student-row-${student.id}`}>
      <StudentAvatar name={student.name} />
      <Text numberOfLines={2} style={styles.name}>
        {student.name}
      </Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={`Ver detalle de ${student.name}`}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onViewDetail(student)}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionPressed,
          ]}
          testID={`view-student-${student.id}`}
        >
          <EyeIcon />
        </Pressable>
        <Pressable
          accessibilityLabel={`Añadir anotación a ${student.name}`}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onAddAnnotation(student)}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionPressed,
          ]}
          testID={`add-annotation-${student.id}`}
        >
          <WarningIcon />
        </Pressable>
        <Pressable
          accessibilityLabel={`Eliminar a ${student.name}`}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onDelete(student)}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionPressed,
          ]}
          testID={`delete-student-${student.id}`}
        >
          <TrashIcon />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  name: {
    color: '#0f172a',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  actionPressed: {
    opacity: 0.6,
  },
});
