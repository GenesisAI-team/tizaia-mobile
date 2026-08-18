import { FlatList, StyleSheet, Text, View } from 'react-native';

import {
  Fab,
  GlassCard,
  ScreenBackground,
  ScreenTitle,
  StudentAvatar,
  TabBar,
} from '../../../shared/components';
import { dp, tizaiaColors } from '../../../shared/theme/tizaiaTheme';

type MailListItem = {
  id: string;
  preview: string;
  receivedAt: string;
  senderName: string;
};

const MOCK_MAILS: MailListItem[] = [
  {
    id: 'mail-1',
    preview: 'Re: Parent Teacher Conference',
    receivedAt: '11:45 AM',
    senderName: 'Clara Lopez',
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

/**
 * Mails definitiva (DESIGN.md §5.5, frame n950 de Tizaia.op): tarjetas de
 * correo (avatar, remitente, fecha, asunto), FAB de composición y TabBar.
 * Bandeja real, detalle y composición quedan para la fase funcional.
 */
export function MailScreen(): React.JSX.Element {
  return (
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>MAILS</ScreenTitle>
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={MOCK_MAILS}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GlassCard cornerRadius={22} style={styles.mailCard}>
            <StudentAvatar
              accessibilityLabel={`Foto de ${item.senderName}`}
              initials={item.senderName.slice(0, 2).toUpperCase()}
              size={dp(98)}
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
          </GlassCard>
        )}
        style={styles.list}
      />
      <Fab
        accessibilityLabel="Crear nuevo mail"
        icon="compose"
        style={styles.fab}
        testID="new-mail-button"
      />
      <TabBar style={styles.tabBar} />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
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
  mailCard: {
    alignItems: 'center',
    flexDirection: 'row',
    height: dp(160),
    paddingHorizontal: dp(29),
  },
  mailContent: {
    flex: 1,
    gap: dp(10),
    marginLeft: dp(22),
  },
  mailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(16),
    justifyContent: 'space-between',
  },
  preview: {
    color: tizaiaColors.ink,
    fontSize: dp(25),
  },
  receivedAt: {
    color: tizaiaColors.ink,
    fontSize: dp(26),
  },
  senderName: {
    color: tizaiaColors.ink,
    flex: 1,
    fontSize: dp(30),
    fontWeight: '500',
  },
  separator: {
    height: dp(28),
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
});
