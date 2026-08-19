import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
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
import { useSchoolRepository } from '../../../app/AppDependenciesProvider';
import {
  getStudentFullName,
  getStudentInitials,
} from '../../../domain/school/models';
import type { AnnotationType } from '../../../domain/school/models';

const MAX_NOTES_LENGTH = 500;

const ANNOTATION_TYPES: {
  color: string;
  id: AnnotationType;
  label: string;
}[] = [
  {
    color: tizaiaColors.warning,
    id: 'contrary',
    label: 'Conductas contrarias',
  },
  {
    color: tizaiaColors.danger,
    id: 'aggravating',
    label: 'Conductas agravantes',
  },
  {
    color: tizaiaColors.success,
    id: 'positive',
    label: 'Refuerzo positivo',
  },
];

/**
 * Nueva Anotación definitiva (DESIGN.md §5.10, frame n1779 de Tizaia.op):
 * selector de alumno, tipo de anotación (3 opciones), editor con contador
 * y composer de envío. Si llega un alumno (p. ej. desde la lista de alumnos)
 * se precarga en el selector. La persistencia queda para la fase funcional.
 */
export function NewAnnotationScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootDrawerParamList, 'NewAnnotation'>>();
  const headerHeight = useHeaderHeight();
  const onPressTab = useTabBarPress();
  const schoolRepository = useSchoolRepository();
  const [selectedType, setSelectedType] = useState<AnnotationType>('positive');
  const [notes, setNotes] = useState('');

  const studentId = route.params?.studentId;
  const student = studentId
    ? schoolRepository.getStudent(studentId)
    : undefined;
  const group = student
    ? schoolRepository
        .getClasses()
        .find((schoolClass) => schoolClass.id === student.classId)
    : undefined;

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleBlock}>
            <ScreenTitle variant="form">NUEVA ANOTACIÓN</ScreenTitle>
          </View>

          <GlassCard cornerRadius={34} style={styles.formCard}>
            <Text style={styles.label}>Alumno</Text>
            <View style={styles.studentSelector}>
              <View style={styles.studentAvatar}>
                <Text style={styles.studentInitials}>
                  {student ? getStudentInitials(student) : 'AL'}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                  {student ? getStudentFullName(student) : 'Sin alumno'}
                </Text>
                <Text style={styles.studentGroup}>
                  {student && group ? group.groupName : 'Selecciona un alumno'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>

            <Text style={styles.label}>Tipo de anotación</Text>
            <View style={styles.typeList}>
              {ANNOTATION_TYPES.map((option) => {
                const isSelected = selectedType === option.id;
                return (
                  <Pressable
                    accessibilityLabel={option.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    key={option.id}
                    onPress={() => setSelectedType(option.id)}
                    style={({ pressed }) => [
                      styles.optionRow,
                      isSelected && {
                        backgroundColor: option.color,
                        borderColor: option.color,
                      },
                      pressed && styles.pressed,
                    ]}
                    testID={`annotation-type-${option.id}`}
                  >
                    <View
                      style={[
                        styles.optionIndicator,
                        { borderColor: option.color },
                        isSelected && styles.optionIndicatorSelected,
                      ]}
                    >
                      {isSelected && <Text style={styles.optionCheck}>✓</Text>}
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Descripción</Text>
            <View style={styles.editor}>
              <TextInput
                accessibilityLabel="Detalles de la anotación"
                maxLength={MAX_NOTES_LENGTH}
                multiline
                onChangeText={setNotes}
                placeholder="Escribe aquí los detalles de la anotación…"
                placeholderTextColor={tizaiaColors.ink}
                style={styles.editorInput}
                textAlignVertical="top"
                value={notes}
              />
              <Text style={styles.counter}>
                {notes.length} / {MAX_NOTES_LENGTH}
              </Text>
            </View>

            <View style={styles.composer}>
              <Text style={styles.composerHint}>Lista para guardar</Text>
              <Pressable
                accessibilityLabel="Guardar anotación"
                accessibilityRole="button"
                onPress={() => {
                  // Persistencia: fase funcional.
                }}
                style={({ pressed }) => [
                  styles.sendButton,
                  pressed && styles.pressed,
                ]}
                testID="annotation-save-button"
              >
                <Text style={styles.sendGlyph}>➤</Text>
              </Pressable>
            </View>
          </GlassCard>
        </ScrollView>
        <TabBar onPressTab={onPressTab} style={styles.tabBar} />
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  chevron: {
    color: tizaiaColors.ink,
    fontSize: dp(30),
    marginRight: dp(24),
  },
  composer: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.white,
    borderColor: tizaiaColors.fieldBorder,
    borderRadius: dp(28),
    borderWidth: 1,
    flexDirection: 'row',
    height: dp(92),
    justifyContent: 'space-between',
    marginTop: dp(26),
    paddingLeft: dp(26),
    paddingRight: dp(10),
  },
  composerHint: {
    color: tizaiaColors.ink,
    fontSize: dp(18),
    fontWeight: '600',
  },
  content: {
    paddingBottom: dp(24),
    paddingHorizontal: dp(40),
  },
  counter: {
    alignSelf: 'flex-end',
    color: tizaiaColors.ink,
    fontSize: dp(14),
  },
  editor: {
    backgroundColor: tizaiaColors.fieldBackground,
    borderColor: tizaiaColors.fieldBorder,
    borderRadius: dp(24),
    borderWidth: 1,
    height: dp(300),
    justifyContent: 'space-between',
    padding: dp(24),
  },
  editorInput: {
    color: tizaiaColors.ink,
    flex: 1,
    fontSize: dp(20),
  },
  flex: {
    flex: 1,
  },
  formCard: {
    elevation: 3,
    padding: dp(36),
    shadowColor: '#694536',
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
  },
  label: {
    color: tizaiaColors.ink,
    fontSize: dp(18),
    fontWeight: '700',
    marginBottom: dp(10),
    marginTop: dp(28),
  },
  optionIndicator: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.fieldBackground,
    borderRadius: dp(16),
    borderWidth: 3,
    height: dp(32),
    justifyContent: 'center',
    marginLeft: dp(20),
    width: dp(32),
  },
  optionCheck: {
    color: tizaiaColors.ink,
    fontSize: dp(20),
    fontWeight: '700',
  },
  optionIndicatorSelected: {
    backgroundColor: tizaiaColors.white,
  },
  optionLabel: {
    color: tizaiaColors.ink,
    fontSize: dp(21),
    fontWeight: '600',
    marginLeft: dp(20),
  },
  optionLabelSelected: {
    fontWeight: '700',
  },
  optionRow: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.fieldBackground,
    borderColor: tizaiaColors.white,
    borderRadius: dp(20),
    borderWidth: 1,
    flexDirection: 'row',
    height: dp(68),
  },
  pressed: {
    opacity: 0.75,
  },
  sendButton: {
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
  sendGlyph: {
    color: tizaiaColors.white,
    fontSize: dp(28),
    fontWeight: '700',
  },
  studentAvatar: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.avatar,
    borderRadius: dp(28),
    height: dp(56),
    justifyContent: 'center',
    marginLeft: dp(16),
    width: dp(56),
  },
  studentGroup: {
    color: tizaiaColors.ink,
    fontSize: dp(16),
    marginTop: dp(4),
  },
  studentInfo: {
    flex: 1,
    marginLeft: dp(20),
  },
  studentInitials: {
    color: tizaiaColors.ink,
    fontSize: dp(18),
    fontWeight: '700',
  },
  studentName: {
    color: tizaiaColors.ink,
    fontSize: dp(23),
    fontWeight: '700',
  },
  studentSelector: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.fieldBackground,
    borderColor: tizaiaColors.fieldBorder,
    borderRadius: dp(22),
    borderWidth: 1,
    flexDirection: 'row',
    height: dp(82),
  },
  tabBar: {
    alignSelf: 'center',
    marginBottom: dp(24),
  },
  titleBlock: {
    marginBottom: dp(36),
    marginTop: dp(24),
  },
  typeList: {
    gap: dp(12),
  },
});
