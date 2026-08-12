import { FlatList, StyleSheet, Text, View } from 'react-native';

import {
  ActionIconButton,
  ScreenTitle,
  StudentAvatar,
} from '../../../shared/components';
import { MailPlusIcon } from '../../../shared/components/icons';
import { colors, radius, spacing } from '../../../shared/theme/designTokens';

type MailListItem = {
  id: string;
  preview: string;
  receivedAt: string;
  senderName: string;
};

const MOCK_MAILS: MailListItem[] = [
  {
    id: 'mail-1',
    preview: 'Lorem ipsum dolor sit amet elit.',
    receivedAt: '16:00',
    senderName: 'Clara',
  },
  {
    id: 'mail-2',
    preview: 'Nunc maximus, nulla ut commodo',
    receivedAt: '14:00',
    senderName: 'Mike',
  },
  {
    id: 'mail-3',
    preview: 'Vivamus feugiat elit porttitor',
    receivedAt: '10:00',
    senderName: 'Eva',
  },
  {
    id: 'mail-4',
    preview: 'Nullam fringilla feugiat nisl',
    receivedAt: '09:00',
    senderName: 'Jessica',
  },
  {
    id: 'mail-5',
    preview: 'Suspendisse ut venenatis libero',
    receivedAt: 'Yesterday',
    senderName: 'Pedro',
  },
  {
    id: 'mail-6',
    preview: 'Seguimiento semanal disponible',
    receivedAt: 'Monday',
    senderName: 'Lucía',
  },
  {
    id: 'mail-7',
    preview: 'Confirmación de tutoría',
    receivedAt: 'Monday',
    senderName: 'Marta',
  },
  {
    id: 'mail-8',
    preview: 'Material para la próxima clase',
    receivedAt: 'Friday',
    senderName: 'Hugo',
  },
  {
    id: 'mail-9',
    preview: 'Recordatorio de reunión',
    receivedAt: 'Friday',
    senderName: 'Sara',
  },
  {
    id: 'mail-10',
    preview: 'Actualización de calendario',
    receivedAt: 'Thursday',
    senderName: 'Daniel',
  },
];

/** Diseño visual HU-010..HU-012. Bandeja real, detalle y composición quedan pendientes. */
export function MailScreen(): React.JSX.Element {
  return (
    <View style={styles.screen}>
      <ScreenTitle>MAILS</ScreenTitle>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={MOCK_MAILS}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mailCard}>
            <StudentAvatar
              accessibilityLabel={`Foto de ${item.senderName}`}
              initials={item.senderName.slice(0, 2).toUpperCase()}
              size={48}
            />
            <View style={styles.mailContent}>
              <View style={styles.mailHeader}>
                <Text numberOfLines={1} style={styles.senderName}>
                  {item.senderName}
                </Text>
                <Text style={styles.receivedAt}>{item.receivedAt}</Text>
              </View>
              <Text numberOfLines={2} style={styles.preview}>
                {item.preview}
              </Text>
            </View>
          </View>
        )}
      />
      <View style={styles.footerAction}>
        <ActionIconButton
          accessibilityLabel="Crear nuevo mail"
          onPress={() => {
            // La ruta de composición se añadirá en la iteración funcional.
          }}
          size={56}
          testID="new-mail-button"
        >
          <MailPlusIcon size={32} />
        </ActionIconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerAction: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.sm,
  },
  mailCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 72,
    padding: spacing.sm,
  },
  mailContent: {
    flex: 1,
    gap: spacing.xs,
  },
  mailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  preview: {
    color: colors.textMuted,
    fontSize: 14,
  },
  receivedAt: {
    color: colors.textMuted,
    fontSize: 12,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.md,
  },
  senderName: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  separator: {
    height: spacing.sm,
  },
});
