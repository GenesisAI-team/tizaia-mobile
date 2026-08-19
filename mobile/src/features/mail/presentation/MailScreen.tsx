import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import {
  Fab,
  GlassCard,
  ScreenBackground,
  ScreenTitle,
  StudentAvatar,
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
import { formatDayMonth } from '../../../domain/school/schoolDates';

type MailListItem = {
  id: string;
  subject: string;
  preview: string;
  receivedAt: string;
  senderName: string;
  initials: string;
};

/**
 * Mails definitiva (DESIGN.md §5.5, frame n950 de Tizaia.op): tarjetas de
 * correo (avatar, remitente, fecha, asunto), FAB de composición y TabBar.
 * La bandeja procede del repositorio en memoria; el detalle y el envío
 * quedan para la fase funcional.
 */
export function MailScreen(): React.JSX.Element {
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const onPressTab = useTabBarPress();
  const schoolRepository = useSchoolRepository();

  const mails: MailListItem[] = schoolRepository.getMails().map((mail) => {
    const sender = schoolRepository.getStudent(mail.senderStudentId);
    return {
      id: mail.id,
      subject: mail.subject,
      preview: mail.preview,
      receivedAt: formatDayMonth(mail.receivedAt),
      senderName: sender ? getStudentFullName(sender) : 'Familias',
      initials: sender ? getStudentInitials(sender) : 'FA',
    };
  });

  return (
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>MAILS</ScreenTitle>
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={mails}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GlassCard cornerRadius={22} style={styles.mailCard}>
            <StudentAvatar
              accessibilityLabel={`Foto de ${item.senderName}`}
              initials={item.initials}
              size={dp(98)}
            />
            <View style={styles.mailContent}>
              <View style={styles.mailHeader}>
                <Text numberOfLines={1} style={styles.senderName}>
                  {item.senderName}
                </Text>
                <Text style={styles.receivedAt}>{item.receivedAt}</Text>
              </View>
              <Text numberOfLines={1} style={styles.subject}>
                {item.subject}
              </Text>
              <Text numberOfLines={1} style={styles.preview}>
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
        onPress={() => navigation.navigate('NewMail')}
        style={styles.fab}
        testID="new-mail-button"
      />
      <TabBar onPressTab={onPressTab} style={styles.tabBar} />
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
    height: dp(170),
    paddingHorizontal: dp(29),
  },
  mailContent: {
    flex: 1,
    gap: dp(8),
    marginLeft: dp(22),
  },
  mailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(16),
    justifyContent: 'space-between',
  },
  preview: {
    color: tizaiaColors.textMenuSecondary,
    fontSize: dp(20),
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
  subject: {
    color: tizaiaColors.ink,
    fontSize: dp(24),
    fontWeight: '600',
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
