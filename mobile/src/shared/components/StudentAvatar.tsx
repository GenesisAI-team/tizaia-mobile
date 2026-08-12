import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/designTokens';

type StudentAvatarProps = {
  accessibilityLabel?: string;
  imageUri?: string;
  initials?: string;
  size?: number;
};

const DEFAULT_SIZE = 56;

/** Avatar/foto cuadrada de alumno usado por las pantallas de listado y matrices. */
export function StudentAvatar({
  accessibilityLabel = 'Foto del alumno',
  imageUri,
  initials = 'AL',
  size = DEFAULT_SIZE,
}: StudentAvatarProps): React.JSX.Element {
  const dimensions = {
    borderRadius: radius.sm,
    height: size,
    width: size,
  };

  if (imageUri) {
    return (
      <Image
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        source={{ uri: imageUri }}
        style={[styles.avatar, dimensions]}
      />
    );
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[styles.avatar, styles.placeholder, dimensions]}
    >
      <Text style={[styles.initials, { fontSize: size / 3.2 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.textMuted,
    fontWeight: '700',
  },
});
