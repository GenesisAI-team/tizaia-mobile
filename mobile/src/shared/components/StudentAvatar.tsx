import { Image, StyleSheet, Text, View } from 'react-native';

import { tizaiaColors } from '../theme/tizaiaTheme';

type StudentAvatarProps = {
  accessibilityLabel?: string;
  imageUri?: string;
  initials?: string;
  size?: number;
};

const DEFAULT_SIZE = 46;

/**
 * Avatar circular de alumno/remitente (DESIGN.md §4.5): fondo #B9D9F4 con
 * iniciales en tinta. Tamaños de diseño: 92/95/98/90/108/96/66/56px
 * (el componente recibe dp, p. ej. 46 para la variante de 92px).
 */
export function StudentAvatar({
  accessibilityLabel = 'Foto del alumno',
  imageUri,
  initials = 'AL',
  size = DEFAULT_SIZE,
}: StudentAvatarProps): React.JSX.Element {
  const dimensions = {
    borderRadius: size / 2,
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
      <Text style={[styles.initials, { fontSize: size * 0.39 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: tizaiaColors.avatar,
  },
  initials: {
    color: tizaiaColors.ink,
    fontWeight: '400',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
