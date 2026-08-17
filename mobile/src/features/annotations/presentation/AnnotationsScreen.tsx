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
import { EyeIcon, MailPlusIcon } from '../../../shared/components/icons';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';

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
 * Anotaciones definitiva (DESIGN.md §5.6, frame n991 de Tizaia.op): 6
 * tarjetas con avatar, nombre y acciones (ver / enviar mail / confirmar),
 * FAB de nueva anotación y TabBar.
 * Detalle, nuevo mail y persistencia quedan para la fase funcional.
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
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>ANOTACIONES</ScreenTitle>
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={INITIAL_ANNOTATIONS}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isChecked = checkedItems[item.id] ?? false;
          return (
            <GlassCard cornerRadius={22} style={styles.card}>
              <StudentAvatar
                accessibilityLabel={`Foto de ${item.studentName}`}
                initials={item.studentName.slice(0, 2).toUpperCase()}
                size={dp(90)}
              />
              <Text numberOfLines={1} style={styles.name}>
                {item.studentName}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  accessibilityLabel={`Ver alumno ${item.studentName}`}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => {
                    // La navegación a Perfil Alumno se cablea en UI-023.
                  }}
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
                  onPress={() => {
                    // Ruta futura NewMail: se cablea en UI-023.
                  }}
                  style={({ pressed }) => [
                    styles.sendButton,
                    pressed && styles.pressed,
                  ]}
                  testID={`annotation-new-mail-${item.id}`}
                >
                  <MailPlusIcon color={tizaiaColors.sendIcon} size={dp(44)} />
                </Pressable>
                <Pressable
                  accessibilityLabel={`Marcar anotación de ${item.studentName}`}
                  accessibilityRole="button"
                  accessibilityState={{ checked: isChecked }}
                  hitSlop={8}
                  onPress={() => toggleChecked(item.id)}
                  style={({ pressed }) => [
                    styles.confirmButton,
                    (pressed || !isChecked) && styles.confirmDimmed,
                  ]}
                  testID={`annotation-check-${item.id}`}
                >
                  <Text style={styles.confirmGlyph}>✓</Text>
                </Pressable>
              </View>
            </GlassCard>
          );
        }}
        style={styles.list}
      />
      <Fab accessibilityLabel="Añadir anotación" style={styles.fab} />
      <TabBar style={styles.tabBar} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(38),
  },
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    height: dp(140),
    paddingHorizontal: dp(29),
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
    paddingHorizontal: dp(40),
  },
  name: {
    color: tizaiaColors.ink,
    flex: 1,
    fontSize: dp(34),
    marginLeft: dp(29),
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
  viewButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.avatar,
    borderRadius: dp(15),
    height: dp(55),
    justifyContent: 'center',
    width: dp(76),
  },
});
