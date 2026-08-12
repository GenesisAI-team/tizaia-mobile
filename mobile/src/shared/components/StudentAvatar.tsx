import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../theme/theme';

type StudentAvatarProps = {
  /** Nombre del alumno; alimenta las iniciales y la etiqueta accesible. */
  name: string;
  /** URL remota de la foto; si falta o es null se muestran iniciales. */
  uri?: string | null;
  size?: number;
  /** Por defecto `Foto de <name>`. */
  accessibilityLabel?: string;
  testID?: string;
};

const DEFAULT_SIZE = 48;
const MAX_INITIALS = 2;

/**
 * Deriva las iniciales visibles del avatar (máximo dos, en mayúsculas).
 * Helper puramente presentacional del contrato UI-000 (issue #16).
 */
export function getAvatarInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '?';
  }
  return words
    .slice(0, MAX_INITIALS)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Foto circular del alumno con fallback de iniciales (UI-000, issue #16).
 * Contrato compartido por Asistencia (HU-004), Alumnos (HU-005/HU-006),
 * Tareas (HU-007), Anotaciones (HU-008) y Mails (HU-010): todas muestran la
 * foto del alumno/remitente (RF-ASIS-003, RF-ALUM-002, RF-NOTE-002).
 * Componente puramente visual, sin lógica de negocio.
 */
export function StudentAvatar({
  name,
  uri,
  size = DEFAULT_SIZE,
  accessibilityLabel,
  testID,
}: StudentAvatarProps): React.JSX.Element {
  const label = accessibilityLabel ?? `Foto de ${name}`;
  const circleStyle = {
    borderRadius: size / 2,
    height: size,
    width: size,
  };

  if (uri) {
    return (
      <Image
        accessibilityLabel={label}
        accessibilityRole="image"
        source={{ uri }}
        style={[styles.image, circleStyle]}
        testID={testID}
      />
    );
  }

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="image"
      style={[styles.fallback, circleStyle]}
      testID={testID}
    >
      <Text
        style={[styles.initials, { fontSize: size * 0.4 }]}
        testID={testID ? `${testID}-initials` : undefined}
      >
        {getAvatarInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface,
  },
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.border,
    justifyContent: 'center',
  },
  initials: {
    color: colors.textSecondary,
    fontWeight: typography.label.fontWeight,
    letterSpacing: 0.5,
  },
});
