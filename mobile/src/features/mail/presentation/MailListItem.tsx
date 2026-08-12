import { StyleSheet, Text, View } from 'react-native';

import { StudentAvatar } from '../../../shared/components';
import {
  colors,
  radius,
  spacing,
  typography,
} from '../../../shared/theme/designTokens';

/**
 * Modelo visual de una fila de la bandeja (solo presentación, issue #21).
 * Refleja DAT-MAIL-001 (remitente, asunto, fragmento, fecha, lectura) de
 * forma estática; la lectura real y su origen de datos quedan pendientes.
 */
export type MailListItemModel = {
  id: string;
  senderName: string;
  senderPhotoUrl?: string;
  subject: string;
  snippet: string;
  /** Hora o fecha ya formateada para mostrar (mock, sin lógica de fechas). */
  displayDate: string;
  /** Solo estilo visual del mock: no leído en negrita, leído atenuado. */
  isUnread: boolean;
};

type MailListItemProps = {
  mail: MailListItemModel;
};

/**
 * Deriva las iniciales visibles del remitente (máximo dos, de las dos
 * primeras palabras). Función pura, extraída para pruebas.
 */
export function getSenderInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Fila de la bandeja de Mails: avatar del remitente (StudentAvatar, contrato
 * UI-000), nombre, hora/fecha, asunto y descripción breve. No interactiva en
 * esta fase: abrir el detalle y marcar como leído pertenecen a HU-010
 * funcional (Q-005).
 */
export function MailListItem({ mail }: MailListItemProps): React.JSX.Element {
  return (
    <View style={styles.row} testID={`mail-row-${mail.id}`}>
      <StudentAvatar
        accessibilityLabel={`Avatar de ${mail.senderName}`}
        imageUri={mail.senderPhotoUrl}
        initials={getSenderInitials(mail.senderName)}
        size={48}
      />
      <View style={styles.content}>
        <View style={styles.topLine}>
          <Text
            numberOfLines={1}
            style={[styles.sender, mail.isUnread && styles.unread]}
          >
            {mail.senderName}
          </Text>
          <Text style={[styles.date, mail.isUnread && styles.unread]}>
            {mail.displayDate}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={[styles.subject, mail.isUnread && styles.unread]}
        >
          {mail.subject}
        </Text>
        <Text numberOfLines={2} style={styles.snippet}>
          {mail.snippet}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md - spacing.xs,
    padding: spacing.md - spacing.xs,
  },
  content: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  topLine: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  sender: {
    color: colors.text,
    flexShrink: 1,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  date: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  subject: {
    color: colors.text,
    fontSize: typography.body.fontSize,
  },
  snippet: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '400',
  },
  unread: {
    color: colors.text,
    fontWeight: '700',
  },
});
