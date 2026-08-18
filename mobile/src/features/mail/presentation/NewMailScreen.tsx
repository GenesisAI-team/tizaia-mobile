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

import {
  GlassCard,
  ScreenBackground,
  ScreenTitle,
  TabBar,
} from '../../../shared/components';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';

type Recipient = {
  id: string;
  kind: 'family' | 'group';
  label: string;
};

const MAX_MESSAGE_LENGTH = 1000;

/** Destinatarios seleccionados de ejemplo (mock, DESIGN.md §5.11). */
const INITIAL_RECIPIENTS: Recipient[] = [
  { id: 'family-eva', kind: 'family', label: 'Familia de Eva' },
  { id: 'group-2eso', kind: 'group', label: '2º ESO C/D' },
];

/**
 * Nuevo Mail definitivo (DESIGN.md §5.11, frame n1825 de Tizaia.op): chips de
 * destinatarios (añadir/quitar), asunto, editor con contador y composer con
 * adjuntar y enviar. El envío y la resolución real de destinatarios quedan
 * para la fase funcional.
 */
export function NewMailScreen(): React.JSX.Element {
  const headerHeight = useHeaderHeight();
  const [recipients, setRecipients] = useState(INITIAL_RECIPIENTS);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const removeRecipient = (recipientId: string): void => {
    setRecipients((current) =>
      current.filter((recipient) => recipient.id !== recipientId),
    );
  };

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
                onPress={() => {
                  // Selector real de familias: fase funcional.
                }}
                style={({ pressed }) => [
                  styles.chip,
                  styles.chipAction,
                  pressed && styles.pressed,
                ]}
                testID="mail-add-families"
              >
                <Text style={styles.chipText}>+ Familias</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Añadir grupos como destinatarios"
                accessibilityRole="button"
                onPress={() => {
                  // Selector real de grupos: fase funcional.
                }}
                style={({ pressed }) => [
                  styles.chip,
                  styles.chipAction,
                  pressed && styles.pressed,
                ]}
                testID="mail-add-groups"
              >
                <Text style={styles.chipText}>+ Grupos</Text>
              </Pressable>
            </View>
            <View style={styles.chipsRow}>
              {recipients.map((recipient) => (
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
                  // Adjuntos: fase funcional.
                }}
                style={({ pressed }) => [
                  styles.attachmentButton,
                  pressed && styles.pressed,
                ]}
                testID="mail-attachment-button"
              >
                <Text style={styles.attachmentGlyph}>📎</Text>
              </Pressable>
              <Text style={styles.composerHint}>Borrador guardado</Text>
              <Pressable
                accessibilityLabel="Enviar mail"
                accessibilityRole="button"
                onPress={() => {
                  // Envío real: fase funcional.
                }}
                style={({ pressed }) => [
                  styles.sendButton,
                  pressed && styles.pressed,
                ]}
                testID="mail-send-button"
              >
                <Text style={styles.sendGlyph}>➤</Text>
              </Pressable>
            </View>
          </GlassCard>
        </ScrollView>
        <TabBar style={styles.tabBar} />
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
    color: tizaiaColors.ink,
    flex: 1,
    fontSize: dp(18),
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
  subjectField: {
    backgroundColor: tizaiaColors.fieldBackground,
    borderColor: tizaiaColors.fieldBorder,
    borderRadius: dp(22),
    borderWidth: 1,
    height: dp(76),
    justifyContent: 'center',
    paddingHorizontal: dp(22),
  },
  subjectInput: {
    color: tizaiaColors.ink,
    fontSize: dp(19),
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
