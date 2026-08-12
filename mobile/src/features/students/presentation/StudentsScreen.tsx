import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { StudentListItem } from './components/StudentListItem';
import { MOCK_STUDENTS, type MockStudent } from './mockStudents';

/**
 * Rutas futuras de navegación (pendientes, issue #18):
 * - `StudentDetail` (HU-006): se abrirá desde el botón ojo.
 * - `NewAnnotation` (HU-009): se abrirá desde el botón warning con el alumno
 *   precargado.
 * No se registran en el navegador en esta PR para evitar conflictos con las
 * PRs paralelas de UI-000 (#16) y del resto de pantallas.
 */
export const STUDENT_DETAIL_ROUTE = 'StudentDetail';
export const NEW_ANNOTATION_ROUTE = 'NewAnnotation';

const EMPTY_MESSAGE = 'No hay alumnos en la lista.';

/**
 * Alumnos (HU-005/HU-006): diseño visual aprobado del listado.
 * Mantiene el header compartido del navegador. Lista vertical con datos mock;
 * la papelera elimina la fila únicamente del estado local (sin persistencia,
 * confirmación ni reglas: BR-DELETE-001 y Q-007 siguen pendientes). La
 * navegación a `StudentDetail`/`NewAnnotation` queda preparada como pendiente.
 */
export function StudentsScreen(): React.JSX.Element {
  const [students, setStudents] =
    useState<readonly MockStudent[]>(MOCK_STUDENTS);

  const handleViewDetail = useCallback((_student: MockStudent): void => {
    // Pendiente: navigation.navigate(STUDENT_DETAIL_ROUTE, { studentId }).
  }, []);

  const handleAddAnnotation = useCallback((_student: MockStudent): void => {
    // Pendiente: navigation.navigate(NEW_ANNOTATION_ROUTE, { studentId }).
  }, []);

  const handleDelete = useCallback((student: MockStudent): void => {
    // Solo estado local mock. El borrado real requiere confirmación
    // (BR-DELETE-001) y política de retención (Q-007), ambas pendientes.
    setStudents((current) => current.filter((s) => s.id !== student.id));
  }, []);

  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        ALUMNOS
      </Text>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={students}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{EMPTY_MESSAGE}</Text>
        }
        renderItem={({ item }) => (
          <StudentListItem
            onAddAnnotation={handleAddAnnotation}
            onDelete={handleDelete}
            onViewDetail={handleViewDetail}
            student={item}
          />
        )}
        style={styles.list}
        testID="students-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  title: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: 16,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 8,
    padding: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
    paddingVertical: 32,
    textAlign: 'center',
  },
});
