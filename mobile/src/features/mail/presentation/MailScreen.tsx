import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import {
  DataStateView,
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
  toUserMessage,
  useSchoolInvalidation,
  useSchoolResource,
} from '../../../shared/state/schoolDataProvider';
import { getNameInitials } from '../../../domain/school/models';
import type { MailFolder } from '../../../domain/school/models';
import { formatDayMonth } from '../../../domain/school/schoolDates';

const FOLDERS: { id: MailFolder; label: string }[] = [
  { id: 'inbox', label: 'Entrada' },
  { id: 'sent', label: 'Enviados' },
];

type MailListItem = {
  id: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  senderName: string;
  initials: string;
  isRead: boolean;
};

/**
 * Mails definitiva (DESIGN.md §5.5, frame n950 de Tizaia.op): tarjetas de
 * correo (avatar, remitente, fecha, asunto), FAB de composición y TabBar.
 * Bandejas entrada/enviados y listado servidos por la API (#67). La búsqueda
 * filtra la bandeja cargada en cliente. Pulsar una tarjeta despliega el
 * detalle y marca como leído con **actualización optimista y rollback**.
 */
export function MailScreen(): React.JSX.Element {
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const onPressTab = useTabBarPress();
  const schoolRepository = useSchoolRepository();
  const invalidate = useSchoolInvalidation();

  const [folder, setFolder] = useState<MailFolder>('inbox');
  const [query, setQuery] = useState('');
  const resource = useSchoolResource(
    () => schoolRepository.getMails(folder),
    [folder],
  );

  /** Overrides optimistas de leído/no leído por id de correo. */
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedId, setExpandedId] = useState<string | undefined>(undefined);

  const mails: MailListItem[] =
    resource.state.status === 'success'
      ? resource.state.data.map((mail) => {
          const senderName =
            mail.senderLabel.trim().length > 0 ? mail.senderLabel : 'Familias';
          return {
            id: mail.id,
            subject: mail.subject,
            preview: mail.preview,
            body: mail.body,
            receivedAt: formatDayMonth(mail.receivedAt),
            senderName,
            initials: getNameInitials(senderName) || 'FA',
            isRead: readOverrides[mail.id] ?? mail.isRead,
          };
        })
      : [];

  const normalizedQuery = query.trim().toLowerCase();
  const visibleMails =
    normalizedQuery.length === 0
      ? mails
      : mails.filter((mail) =>
          `${mail.subject} ${mail.body} ${mail.senderName}`
            .toLowerCase()
            .includes(normalizedQuery),
        );

  const openMail = (item: MailListItem): void => {
    // Detalle inline del MVP: expandir el cuerpo dentro de la tarjeta.
    setExpandedId((current) => (current === item.id ? undefined : item.id));
    if (item.isRead || folder !== 'inbox') return;
    setReadOverrides((current) => ({ ...current, [item.id]: true }));
    void (async () => {
      try {
        await schoolRepository.setMailRead(item.id, true);
        invalidate();
      } catch (error) {
        setReadOverrides((current) => {
          const next = { ...current };
          delete next[item.id];
          return next;
        });
        Alert.alert('No se pudo marcar como leído', toUserMessage(error));
      }
    })();
  };

  return (
    <ScreenBackground>
      <View style={styles.titleBlock}>
        <ScreenTitle>MAILS</ScreenTitle>
      </View>

      <View style={styles.folderRow}>
        {FOLDERS.map((option) => {
          const isActive = folder === option.id;
          return (
            <Pressable
              accessibilityLabel={`Bandeja ${option.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              key={option.id}
              onPress={() => setFolder(option.id)}
              style={({ pressed }) => [
                styles.folderChip,
                isActive && styles.folderChipActive,
                pressed && styles.pressed,
              ]}
              testID={`mail-folder-${option.id}`}
            >
              <Text
                style={[styles.folderText, isActive && styles.folderTextActive]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.searchBox}>
        <TextInput
          accessibilityLabel="Buscar correos"
          autoCorrect={false}
          onChangeText={setQuery}
          placeholder="Buscar en la bandeja…"
          placeholderTextColor={tizaiaColors.textMenuSecondary}
          style={styles.searchInput}
          testID="mail-search-input"
          value={query}
        />
      </View>

      <DataStateView
        emptyMessage={
          normalizedQuery.length > 0
            ? 'Ningún correo coincide con la búsqueda.'
            : 'La bandeja está vacía.'
        }
        onRetry={resource.reload}
        state={resource.state}
      />
      {resource.state.status === 'success' && (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={visibleMails}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GlassCard cornerRadius={22} style={styles.mailCard}>
              <Pressable
                accessibilityLabel={`Abrir correo de ${item.senderName}: ${item.subject}`}
                accessibilityRole="button"
                onPress={() => openMail(item)}
                style={styles.mailContent}
                testID={`mail-item-${item.id}`}
              >
                <View style={styles.mailHeaderRow}>
                  <StudentAvatar
                    accessibilityLabel={`Foto de ${item.senderName}`}
                    initials={item.initials}
                    size={dp(98)}
                  />
                  <View style={styles.mailInfo}>
                    <View style={styles.mailHeader}>
                      <Text numberOfLines={1} style={styles.senderName}>
                        {item.senderName}
                      </Text>
                      <Text style={styles.receivedAt}>{item.receivedAt}</Text>
                    </View>
                    <View style={styles.subjectRow}>
                      {!item.isRead && (
                        <View
                          accessibilityLabel="Correo sin leer"
                          style={styles.unreadDot}
                        />
                      )}
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.subject,
                          !item.isRead && styles.subjectUnread,
                        ]}
                      >
                        {item.subject}
                      </Text>
                    </View>
                    <Text numberOfLines={1} style={styles.preview}>
                      {item.preview}
                    </Text>
                    {expandedId === item.id && (
                      <Text style={styles.body}>{item.body}</Text>
                    )}
                  </View>
                </View>
              </Pressable>
            </GlassCard>
          )}
          style={styles.list}
        />
      )}
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
  folderChip: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.white,
    borderColor: tizaiaColors.fieldBorder,
    borderRadius: dp(18),
    borderWidth: 1,
    flex: 1,
    height: dp(56),
    justifyContent: 'center',
  },
  folderChipActive: {
    backgroundColor: tizaiaColors.inkButton,
    borderColor: tizaiaColors.inkButton,
  },
  folderRow: {
    flexDirection: 'row',
    gap: dp(14),
    paddingHorizontal: dp(35),
  },
  folderText: {
    color: tizaiaColors.ink,
    fontSize: dp(19),
    fontWeight: '600',
  },
  folderTextActive: {
    color: tizaiaColors.white,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: dp(280),
    paddingHorizontal: dp(35),
  },
  mailCard: {
    minHeight: dp(170),
    paddingVertical: dp(20),
    paddingHorizontal: dp(29),
  },
  mailContent: {
    flex: 1,
  },
  mailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(16),
    justifyContent: 'space-between',
  },
  mailHeaderRow: {
    flexDirection: 'row',
  },
  mailInfo: {
    flex: 1,
    gap: dp(8),
    marginLeft: dp(22),
  },
  preview: {
    color: tizaiaColors.textMenuSecondary,
    fontSize: dp(20),
  },
  pressed: {
    opacity: 0.8,
  },
  receivedAt: {
    color: tizaiaColors.ink,
    fontSize: dp(26),
  },
  searchBox: {
    backgroundColor: tizaiaColors.white,
    borderColor: tizaiaColors.fieldBorder,
    borderRadius: dp(20),
    borderWidth: 1,
    marginVertical: dp(20),
    marginHorizontal: dp(35),
    paddingHorizontal: dp(24),
  },
  searchInput: {
    color: tizaiaColors.ink,
    fontSize: dp(19),
    minHeight: dp(60),
  },
  separator: {
    height: dp(28),
  },
  senderName: {
    color: tizaiaColors.ink,
    flex: 1,
    fontSize: dp(30),
    fontWeight: '500',
  },
  subject: {
    color: tizaiaColors.ink,
    flex: 1,
    fontSize: dp(24),
    fontWeight: '500',
  },
  subjectRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: dp(10),
  },
  subjectUnread: {
    fontWeight: '800',
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
  unreadDot: {
    backgroundColor: tizaiaColors.warnTriangle,
    borderRadius: dp(8),
    height: dp(16),
    width: dp(16),
  },
  body: {
    color: tizaiaColors.ink,
    fontSize: dp(20),
    lineHeight: dp(30),
    marginTop: dp(10),
  },
});
