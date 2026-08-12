import { Image, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

export type StudentAvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: number;
  testID?: string;
};

/** Iniciales visibles cuando no hay foto: primera letra de hasta dos palabras. */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/**
 * Avatar circular de alumno (contrato UI-000, issue #16).
 * Puramente visual: foto si hay `photoUrl`, iniciales en caso contrario.
 */
export function StudentAvatar({
  name,
  photoUrl,
  size = 44,
  testID,
}: StudentAvatarProps): React.JSX.Element {
  const shape = {
    borderRadius: size / 2,
    height: size,
    width: size,
  };
  return (
    <View
      accessibilityLabel={`Foto de ${name}`}
      style={[styles.container, shape]}
      testID={testID}
    >
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={shape} />
      ) : (
        <Text
          style={[styles.initials, { fontSize: size * 0.4 }]}
          maxFontSizeMultiplier={1.5}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});
