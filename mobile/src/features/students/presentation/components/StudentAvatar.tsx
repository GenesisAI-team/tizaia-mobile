import { StyleSheet, Text, View } from 'react-native';

export type StudentAvatarProps = {
  /** Nombre completo del alumno; se usan sus iniciales como contenido. */
  name: string;
  /** Lado del avatar circular en dp. */
  size?: number;
};

const DEFAULT_SIZE = 48;

/**
 * Devuelve las iniciales (máximo dos) de un nombre completo.
 * Función pura para facilitar su prueba y reutilización.
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : '';
  return `${first}${last}`.toUpperCase();
}

/**
 * Avatar circular de alumno con iniciales.
 *
 * NOTA (UI-000, #16): componente local provisional de `students`. Replica el
 * contrato visual compartido (nombre + tamaño, iniciales, circular) hasta que
 * el `StudentAvatar` de `mobile/src/shared/` esté disponible; entonces esta
 * pantalla deberá consumir el compartido y eliminar esta copia. Es decorativo:
 * el nombre del alumno se muestra al lado y aporta el contexto accesible.
 */
export function StudentAvatar({
  name,
  size = DEFAULT_SIZE,
}: StudentAvatarProps): React.JSX.Element {
  return (
    <View
      accessible={false}
      style={[
        styles.avatar,
        {
          borderRadius: size / 2,
          height: size,
          width: size,
        },
      ]}
      testID="student-avatar"
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
  },
  initials: {
    color: '#1e3a8a',
    fontWeight: '700',
  },
});
