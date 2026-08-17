import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  Fab,
  GlassCard,
  ScreenBackground,
  ScreenTitle,
  StudentAvatar,
  TabBar,
} from '../../../shared/components';
import {
  EyeIcon,
  TrashIcon,
  WarningIcon,
} from '../../../shared/components/icons';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';

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
 * Alumnos definitiva (DESIGN.md §5.3, frame n883 de Tizaia.op): 6 tarjetas
 * con avatar, nombre y acciones (ver / aviso / borrar), FAB de alta y TabBar.
 * Las rutas StudentDetail/NewAnnotation y el borrado real quedan para la
 * fase funcional (UI-023 cablea las rutas).
 */
export function StudentsScreen(): React.JSX.Element {
  const [students, setStudents] = useState(INITIAL_STUDENTS);

  const removeStudent = (studentId: string): void => {
    setStudents((current) => current.filter((item) => item.id !== studentId));
  };

  return (
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>ALUMNOS</ScreenTitle>
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={students}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay alumnos visibles.</Text>
        }
        renderItem={({ item }) => (
          <GlassCard cornerRadius={22} style={styles.card}>
            <StudentAvatar
              accessibilityLabel={`Foto de ${item.name}`}
              initials={item.name.slice(0, 2).toUpperCase()}
              size={dp(95)}
            />
            <Text numberOfLines={1} style={styles.name}>
              {item.name}
            </Text>
            <View style={styles.actions}>
              <Pressable
                accessibilityLabel={`Ver detalle de ${item.name}`}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => {
                  // Ruta futura StudentDetail: se cablea en UI-023.
                }}
                style={({ pressed }) => [
                  styles.viewButton,
                  pressed && styles.pressed,
                ]}
                testID={`student-view-${item.id}`}
              >
                <EyeIcon color={tizaiaColors.inkButton} size={dp(40)} />
              </Pressable>
              <Pressable
                accessibilityLabel={`Crear anotación para ${item.name}`}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => {
                  // Ruta futura NewAnnotation: se cablea en UI-023.
                }}
                style={({ pressed }) => [
                  styles.warnButton,
                  pressed && styles.pressed,
                ]}
                testID={`student-new-annotation-${item.id}`}
              >
                <WarningIcon color={tizaiaColors.warnTriangle} size={dp(46)} />
              </Pressable>
              <Pressable
                accessibilityLabel={`Eliminar a ${item.name} de la lista`}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => removeStudent(item.id)}
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.pressed,
                ]}
                testID={`student-delete-${item.id}`}
              >
                <TrashIcon color={tizaiaColors.deleteIcon} size={dp(36)} />
              </Pressable>
            </View>
          </GlassCard>
        )}
        style={styles.list}
      />
      <Fab accessibilityLabel="Añadir alumno" style={styles.fab} />
      <TabBar style={styles.tabBar} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(24),
  },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    height: dp(145),
    paddingHorizontal: dp(45),
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.deleteBackground,
    borderRadius: dp(15),
    height: dp(55),
    justifyContent: 'center',
    width: dp(62),
  },
  emptyText: {
    color: tizaiaColors.textMenuSecondary,
    padding: dp(48),
    textAlign: 'center',
  },
  fab: {
    bottom: dp(141),
    position: 'absolute',
    right: dp(35),
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: dp(280),
    paddingHorizontal: dp(35),
  },
  name: {
    color: tizaiaColors.ink,
    flex: 1,
    fontSize: dp(38),
    fontWeight: '600',
    marginLeft: dp(45),
  },
  pressed: {
    opacity: 0.7,
  },
  separator: {
    height: dp(31),
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
  viewButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.avatar,
    borderRadius: dp(15),
    height: dp(55),
    justifyContent: 'center',
    width: dp(76),
  },
  warnButton: {
    alignItems: 'center',
    height: dp(55),
    justifyContent: 'center',
    width: dp(52),
  },
});
