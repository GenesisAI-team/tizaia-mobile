import { useState } from 'react';
import {
  Alert,
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

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

type Recipient = {
  id: string;
  kind: 'family' | 'group';
  label: string;
};

const MAX_MESSAGE_LENGTH = 1000;

/**
 * Nuevo Mail definitivo (DESIGN.md §5.11, frame n1825 de Tizaia.op): chips de
 * destinatarios (añadir/quitar), asunto, editor con contador y composer con
 * adjuntar y enviar. Si llega un alumno (p. ej. desde Anotaciones) se
 * precargan su familia y su grupo; +Familias/+Grupos resuelven el resto vía
 * `/v1/mail-recipients`. El envío aplica `POST /v1/mails` contra el almacén
 * en memoria: es un **envío simulado** (sin correo real), y se indica así.
 */
export function NewMailScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootDrawerParamList, 'NewMail'>>();
  const headerHeight = useHeaderHeight();
  const onPressTab = useTabBarPress();
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const schoolRepository = useSchoolRepository();
  const invalidate = useSchoolInvalidation();

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [pickerKind, setPickerKind] = useState<'family' | 'group' | undefined>(
    undefined,
  );
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  /** Familia y grupo del alumno precargado por ruta (anotaciones/lista). */
  const preloadResource = useSchoolResource(async () => {
    const studentId = route.params?.studentId;
    if (studentId === undefined) return undefined;
    const bootstrap = await schoolRepository.getBootstrap();
    return {
      student: bootstrap.students.find((item) => item.id === studentId),
      classes: bootstrap.classes,
    };
  }, []);

  /** Listado de destinatarios disponibles para el selector (+Familias/+Grupos). */
  const recipientsResource = useSchoolResource(
    () => schoolRepository.searchRecipients(),
    [],
  );

  const preloadedRecipients: Recipient[] =
    preloadResource.state.status === 'success'
      ? (() => {
          const data = preloadResource.state.data;
          if (data === undefined || data.student === undefined) return [];
          const group = data.classes.find(
            (schoolClass) => schoolClass.id === data.student!.classId,
          );
          return [
            {
              id: `family-${data.student!.id}`,
              kind: 'family' as const,
              label: `Familia de ${data.student!.firstName}`,
            },
            ...(group !== undefined
              ? [
                  {
                    id: `group-${group.id}`,
                    kind: 'group' as const,
                    label: group.groupName,
                  },
                ]
              : []),
          ];
        })()
      : [];

  const effectiveRecipients: Recipient[] = [
    ...preloadedRecipients.filter(
      (preloaded) =>
        !recipients.some((recipient) => recipient.id === preloaded.id),
    ),
    ...recipients,
  ];

  const addRecipient = (candidate: Recipient): void => {
    setRecipients((current) =>
      current.some((recipient) => recipient.id === candidate.id)
        ? current
        : [...current, candidate],
    );
  };

  const removeRecipient = (recipientId: string): void => {
    setRecipients((current) =>
      current.filter((recipient) => recipient.id !== recipientId),
    );
  };

  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();
  const canSend =
    !sending &&
    effectiveRecipients.length > 0 &&
    trimmedSubject.length > 0 &&
    trimmedMessage.length > 0;

  const sendMail = (): void => {
    if (!canSend) return;
    void (async () => {
      setSending(true);
      try {
        await schoolRepository.sendMail({
          subject: trimmedSubject,
          body: trimmedMessage,
          recipientIds: effectiveRecipients.map((recipient) => recipient.id),
        });
        invalidate();
        Alert.alert(
          'Mensaje Enviado',
          'Envío simulado en modo demo: el mensaje aparece en la carpeta Enviados del backend.',
        );
        navigation.goBack();
      } catch (error) {
        Alert.alert('No se pudo enviar el correo', toUserMessage(error));
      } finally {
        setSending(false);
      }
    })();
  };

  const pickerRecipients: Recipient[] =
    pickerKind !== undefined && recipientsResource.state.status === 'success'
      ? recipientsResource.state.data
          .filter((recipient) => recipient.kind === pickerKind)
          .map((recipient) => ({
            id: recipient.id,
            kind: recipient.kind === 'group' ? 'group' : 'family',
            label: recipient.label,
          }))
      : [];

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.titleBlock}>
            <ScreenTitle variant="form">NUEVO MAIL</ScreenTitle>
          </View>

          <GlassCard cornerRadius={34} style={styles.formCard}>
            <Text style={styles.label}>Para</Text>
            <View style={styles.chipsRow}>
              <Pressable
                accessibilityLabel="Añadir familias como destinatarias"
                accessibilityRole="button"
                onPress={() =>
                  setPickerKind((current) =>
                    current === 'family' ? undefined : 'family',
                  )
                }
                style={({ pressed }) => [
                  styles.chip,
                  styles.chipAction,
                  pickerKind === 'family' && styles.chipActionActive,
                  pressed && styles.pressed,
                ]}
                testID="mail-add-families"
              >
                <Text style={styles.chipText}>+ Familias</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Añadir grupos como destinatarios"
                accessibilityRole="button"
                onPress={() =>
                  setPickerKind((current) =>
                    current === 'group' ? undefined : 'group',
                  )
                }
                style={({ pressed }) => [
                  styles.chip,
                  styles.chipAction,
                  pickerKind === 'group' && styles.chipActionActive,
                  pressed && styles.pressed,
                ]}
                testID="mail-add-groups"
              >
                <Text style={styles.chipText}>+ Grupos</Text>
              </Pressable>
            </View>

            {pickerKind !== undefined && (
              <DataStateView state={recipientsResource.state} />
            )}
            {pickerKind !== undefined &&
              recipientsResource.state.status === 'success' && (
                <View style={styles.pickerRow}>
                  {pickerRecipients.map((candidate) => {
                    const isAdded = effectiveRecipients.some(
                      (recipient) => recipient.id === candidate.id,
                    );
                    return (
                      <Pressable
                        accessibilityLabel={`Añadir a ${candidate.label}`}
                        accessibilityRole="button"
                        disabled={isAdded}
                        key={candidate.id}
                        onPress={() => addRecipient(candidate)}
                        style={[
                          styles.recipientOption,
                          isAdded && styles.recipientOptionAdded,
                        ]}
                        testID={`mail-pick-${candidate.id}`}
                      >
                        <Text numberOfLines={1} style={styles.chipText}>
                          {isAdded ? '✓ ' : '+ '}
                          {candidate.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

            <View style={styles.chipsRow}>
              {effectiveRecipients.map((recipient) => (
                <View
                  key={recipient.id}
                  style={[
                    styles.chip,
                    recipient.kind === 'family'
                      ? styles.chipFamily
                      : styles.chipGroup,
                  ]}
                >
                  <Text style={styles.chipText}>{recipient.label}</Text>
                  <Pressable
                    accessibilityLabel={`Quitar ${recipient.label}`}
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => removeRecipient(recipient.id)}
                    testID={`mail-remove-${recipient.id}`}
                  >
                    <Text style={styles.chipRemove}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <Text style={styles.label}>Asunto</Text>
            <View style={styles.subjectField}>
              <TextInput
                accessibilityLabel="Asunto del mensaje"
                onChangeText={setSubject}
                placeholder="Escribe el asunto del mensaje"
                placeholderTextColor={tizaiaColors.ink}
                style={styles.subjectInput}
                value={subject}
              />
            </View>

            <Text style={styles.label}>Mensaje</Text>
            <View style={styles.editor}>
              <TextInput
                accessibilityLabel="Cuerpo del mensaje"
                maxLength={MAX_MESSAGE_LENGTH}
                multiline
                onChangeText={setMessage}
                placeholder="Escribe aquí…"
                placeholderTextColor={tizaiaColors.ink}
                style={styles.editorInput}
                textAlignVertical="top"
                value={message}
              />
              <Text style={styles.counter}>
                {message.length} / {MAX_MESSAGE_LENGTH}
              </Text>
            </View>

            <View style={styles.composer}>
              <Pressable
                accessibilityLabel="Adjuntar archivo"
                accessibilityRole="button"
                onPress={() => {
                  // Adjuntos: fuera de alcance del MVP.
                }}
                style={({ pressed }) => [
                  styles.attachmentButton,
                  pressed && styles.pressed,
                ]}
                testID="mail-attachment-button"
              >
                <Text style={styles.attachmentGlyph}>📎</Text>
              </Pressable>
              <Text style={styles.composerHint}>
                Envío simulado · sin correo real
              </Text>
              <Pressable
                accessibilityLabel="Enviar mail simulado"
                accessibilityRole="button"
                disabled={!canSend}
                onPress={sendMail}
                style={({ pressed }) => [
                  styles.sendButton,
                  (!canSend || pressed) && styles.sendButtonDisabled,
                ]}
                testID="mail-send-button"
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
  attachmentButton: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.actionSoft,
    borderRadius: dp(24),
    height: dp(72),
    justifyContent: 'center',
    width: dp(72),
  },
  attachmentGlyph: {
    fontSize: dp(28),
  },
  chip: {
    alignItems: 'center',
    borderRadius: dp(18),
    borderWidth: 1,
    flexDirection: 'row',
    height: dp(58),
    justifyContent: 'center',
    paddingHorizontal: dp(16),
  },
  chipAction: {
    backgroundColor: tizaiaColors.white,
    borderColor: tizaiaColors.fieldBorder,
    flex: 1,
  },
  chipActionActive: {
    borderColor: tizaiaColors.inkButton,
    borderWidth: 2,
  },
  chipFamily: {
    backgroundColor: tizaiaColors.avatar,
    borderColor: tizaiaColors.inkButton,
    flex: 1,
  },
  chipGroup: {
    backgroundColor: tizaiaColors.peach,
    borderColor: tizaiaColors.inkButton,
    flex: 1,
  },
  chipRemove: {
    color: tizaiaColors.ink,
    fontSize: dp(22),
    fontWeight: '700',
    marginLeft: dp(8),
  },
  chipText: {
    color: tizaiaColors.ink,
    fontSize: dp(17),
    fontWeight: '700',
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dp(16),
    marginBottom: dp(14),
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
    marginTop: dp(28),
    paddingHorizontal: dp(10),
  },
  composerHint: {
    color: tizaiaColors.textMenuSecondary,
    flex: 1,
    fontSize: dp(16),
    fontWeight: '600',
    marginLeft: dp(20),
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
    height: dp(384),
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
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dp(10),
    marginBottom: dp(14),
  },
  pressed: {
    opacity: 0.75,
  },
  recipientOption: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.white,
    borderColor: tizaiaColors.fieldBorder,
    borderRadius: dp(16),
    borderWidth: 1,
    minHeight: dp(56),
    maxWidth: '100%',
    paddingHorizontal: dp(16),
    paddingVertical: dp(10),
  },
  recipientOptionAdded: {
    opacity: 0.5,
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
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendGlyph: {
    color: tizaiaColors.white,
    fontSize: dp(28),
    fontWeight: '700',
  },
  subjectField: {
    backgroundColor: tizaiaColors.fieldBackground,
    borderColor: tizaiaColors.fieldBorder,
    borderRadius: dp(20),
    borderWidth: 1,
    paddingHorizontal: dp(20),
  },
  subjectInput: {
    color: tizaiaColors.ink,
    fontSize: dp(19),
    minHeight: dp(64),
  },
  tabBar: {
    alignSelf: 'center',
    marginBottom: dp(24),
  },
  titleBlock: {
    marginBottom: dp(36),
    marginTop: dp(24),
  },
});
