import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import {
  ActionIconButton,
  ScreenTitle,
  StudentAvatar,
} from '../../../shared/components';
import {
  CheckCircleIcon,
  EyeIcon,
  MailPlusIcon,
} from '../../../shared/components/icons';
import { colors, radius, spacing } from '../../../shared/theme/designTokens';

type AnnotationListItem = {
  id: string;
  studentName: string;
};

const INITIAL_ANNOTATIONS: AnnotationListItem[] = [
  { id: 'annotation-1', studentName: 'Clara' },
  { id: 'annotation-2', studentName: 'Mike' },
  { id: 'annotation-3', studentName: 'Eva' },
  { id: 'annotation-4', studentName: 'Jessica' },
  { id: 'annotation-5', studentName: 'Pedro' },
  { id: 'annotation-6', studentName: 'Lucía' },
];

/**
 * Diseño visual HU-008/HU-009. Detalle, nuevo mail y persistencia quedan pendientes.
 */
export function AnnotationsScreen(): React.JSX.Element {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleChecked = (annotationId: string): void => {
    setCheckedItems((current) => ({
      ...current,
      [annotationId]: !current[annotationId],
    }));
  };

  return (
    <View style={styles.screen}>
      <ScreenTitle>ANOTACIONES</ScreenTitle>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={INITIAL_ANNOTATIONS}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isChecked = checkedItems[item.id] ?? false;
          return (
            <View style={styles.row}>
              <View style={styles.studentCell}>
                <StudentAvatar
                  accessibilityLabel={`Foto de ${item.studentName}`}
                  initials={item.studentName.slice(0, 2).toUpperCase()}
                />
                <Text numberOfLines={1} style={styles.name}>
                  {item.studentName}
                </Text>
              </View>
              <View style={styles.actions}>
                <ActionIconButton
                  accessibilityLabel={`Ver alumno ${item.studentName}`}
                  onPress={() => {
                    // La navegación a StudentDetail se integra desde Alumnos.
                  }}
                  testID={`annotation-view-student-${item.id}`}
                >
                  <EyeIcon />
                </ActionIconButton>
                <ActionIconButton
                  accessibilityLabel={`Crear mail para ${item.studentName}`}
                  onPress={() => {
                    // Ruta futura NewMail: pendiente de integración.
                  }}
                  testID={`annotation-new-mail-${item.id}`}
                >
                  <MailPlusIcon />
                </ActionIconButton>
                <ActionIconButton
                  accessibilityLabel={`Marcar anotación de ${item.studentName}`}
                  accessibilityState={{ checked: isChecked }}
                  onPress={() => toggleChecked(item.id)}
                  testID={`annotation-check-${item.id}`}
                >
                  <CheckCircleIcon
                    color={isChecked ? colors.success : colors.textMuted}
                  />
                </ActionIconButton>
              </View>
            </View>
          );
        }}
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
