import { FlatList, StyleSheet, View } from 'react-native';

import { ActionIconButton, ScreenTitle } from '../../../shared/components';
import { MailPlusIcon } from '../../../shared/components/icons';
import { colors, spacing } from '../../../shared/theme/designTokens';
import { MailListItem, type MailListItemModel } from './MailListItem';
import { MAX_VISIBLE_MAILS, mockMails } from './mockMails';

const COMPOSE_BUTTON_SIZE = 56;

function renderMail({ item }: { item: MailListItemModel }): React.JSX.Element {
  return <MailListItem mail={item} />;
}

function keyExtractor(item: MailListItemModel): string {
  return item.id;
}

/**
 * Mails (HU-010/HU-011/HU-012, issue #21): solo diseño visual estructural.
 * Lista vertical con hasta diez correos mock y botón correo+ centrado abajo,
 * construida con los contratos compartidos de UI-000 (#16).
 *
 * Pendiente (fuera de alcance de esta fase): lectura real/no leído, detalle
 * de correo (Q-005), paginación real, proveedor de correo (Q-011), alcances
 * de comunicaciones (Q-008), Supabase y la ruta/pantalla de composición.
 */
export function MailScreen(): React.JSX.Element {
  const visibleMails = mockMails.slice(0, MAX_VISIBLE_MAILS);

  /**
   * Acción "nuevo correo" preparada pero pendiente: la pantalla de
   * composición (HU-011) y su ruta se integran en una tarea posterior.
   */
  const handleComposePress = (): void => {
    // Intencionadamente sin acción: composición fuera de alcance (#21).
  };

  return (
    <View style={styles.container}>
      <ScreenTitle>MAILS</ScreenTitle>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={visibleMails}
        keyExtractor={keyExtractor}
        renderItem={renderMail}
        style={styles.list}
        testID="mail-list"
      />
      <View style={styles.footer}>
        <ActionIconButton
          accessibilityLabel="Redactar nuevo correo"
          onPress={handleComposePress}
          size={COMPOSE_BUTTON_SIZE}
          testID="compose-mail-button"
        >
          <MailPlusIcon size={28} />
        </ActionIconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});
