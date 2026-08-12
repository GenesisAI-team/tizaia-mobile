import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type StudentAvatarProps = {
  /** Nombre completo del alumno; genera iniciales y etiqueta accesible. */
  name: string;
  /** URL de foto; si falta, se muestran iniciales (datos mock). */
  imageUrl?: string;
  size?: number;
  testID?: string;
};

const DEFAULT_SIZE = 48;

/** Paleta determinista para placeholders sin foto (datos mock). */
const PLACEHOLDER_COLORS = [
  '#7c3aed',
  '#0369a1',
  '#b45309',
  '#0f766e',
  '#be185d',
  '#4d7c0f',
] as const;

/** Iniciales (máx. 2) a partir del nombre completo. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

/** Color de fondo estable por nombre para el placeholder circular. */
export function getAvatarColor(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length]!;
}

/**
 * Avatar circular de alumno (contrato UI-000, issue #16).
 * Puramente visual: con `imageUrl` muestra la foto; sin ella, iniciales.
 */
export function StudentAvatar({
  name,
  imageUrl,
  size = DEFAULT_SIZE,
  testID,
}: StudentAvatarProps): React.JSX.Element {
  const shape = { borderRadius: size / 2, height: size, width: size };
  if (imageUrl) {
    return (
      <Image
        accessibilityLabel={name}
        accessibilityRole="image"
        source={{ uri: imageUrl }}
        style={shape}
        testID={testID}
      />
    );
  }
  return (
    <View
      accessibilityLabel={name}
      accessibilityRole="image"
      style={[
        styles.placeholder,
        shape,
        { backgroundColor: getAvatarColor(name) },
      ]}
      testID={testID}
    >
      <Text style={[styles.initials, { fontSize: size / 2.6 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.surface,
    fontWeight: '700',
  },
});
