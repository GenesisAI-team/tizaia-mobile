import { StyleSheet, Text, View } from 'react-native';

import { tizaiaColors } from '../theme/tizaiaTheme';

/**
 * Marca de Tizaia (DESIGN.md §5.8, nodo BrandMark n1686): círculo
 * #FFFFFFC7 con halo melocotón #F8C4A6 y la letra "T" en tinta.
 *
 * Fuente única (single source) del logotipo. Todas las variantes derivan del
 * mismo base y escalan sus proporciones a partir del diámetro `login` (168px
 * de diseño, → 84dp de radio, halo 120, T 64). No se crean copias manuales.
 *
 * Variantes:
 * - `login`: 168dp, tamaño completo del Login (comportamiento inicial intacto).
 * - `header`: ~40dp, logo compacto que cabe en el header común sin aumentar su
 *   altura ni recortar el halo ni desplazar el menú. Sombra más ligera para
 *   evitar desplazamiento óptico a tamaño pequeño (refine #98).
 * - `loading`: tamaño intermedio (~72dp) para la transición de autenticación
 *   estática con spinner (refine #98, antes animada en #94).
 *
 * La sombra/elevación se escala por variante para mantener círculos
 * concéntricos y `T` visualmente centrada a todas las escalas.
 */
export type BrandMarkVariant = 'login' | 'header' | 'loading';

type BrandMarkProps = {
  variant?: BrandMarkVariant;
  /** true (por defecto) expone el logo al lector de pantalla como imagen.
      Pasa false cuando el logo va dentro de otro elemento accesible (p. ej. el
      botón del header) para evitar doble lectura. */
  accessible?: boolean;
};

/** Diámetro (dp) del círculo base por variante. */
const VARIANT_SIZE: Record<BrandMarkVariant, number> = {
  login: 168,
  header: 40,
  loading: 72,
};

/** Sombra/elevación por variante: la de `header` es más ligera para evitar desplazamiento óptico a 40dp. */
const VARIANT_SHADOW: Record<
  BrandMarkVariant,
  {
    elevation: number;
    shadowOffset: { height: number; width: number };
    shadowOpacity: number;
    shadowRadius: number;
  }
> = {
  login: {
    elevation: 6,
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.19,
    shadowRadius: 17,
  },
  loading: {
    elevation: 4,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  header: {
    elevation: 2,
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
};

/**
 * Fracciones derivadas del diámetro `login` (168 dp) para escalar todas las
 * proporciones del resto de variantes sin duplicar estilos.
 */
const RATIOS = {
  /** Halo melocotón: 120/168 */
  halo: 120 / 168,
  /** Desplazamiento del halo respecto a la esquina: 24/168 */
  haloOffset: 24 / 168,
  /** Letra "T": 64/168 */
  letter: 64 / 168,
} as const;

export function BrandMark({
  variant = 'login',
  accessible = true,
}: BrandMarkProps): React.JSX.Element {
  const size = VARIANT_SIZE[variant];
  const haloSize = size * RATIOS.halo;
  const haloOffset = size * RATIOS.haloOffset;
  const letterSize = size * RATIOS.letter;
  const shadow = VARIANT_SHADOW[variant];

  return (
    <View
      accessibilityLabel={accessible ? 'Logotipo de Tizaia' : undefined}
      accessibilityRole={accessible ? 'image' : undefined}
      accessible={accessible}
      style={[
        styles.mark,
        {
          borderRadius: size / 2,
          elevation: shadow.elevation,
          height: size,
          shadowOffset: shadow.shadowOffset,
          shadowOpacity: shadow.shadowOpacity,
          shadowRadius: shadow.shadowRadius,
          width: size,
        },
      ]}
    >
      <View
        style={[
          styles.halo,
          {
            borderRadius: haloSize / 2,
            height: haloSize,
            left: haloOffset,
            top: haloOffset,
            width: haloSize,
          },
        ]}
      />
      <Text style={[styles.letter, { fontSize: letterSize }]}>T</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    backgroundColor: tizaiaColors.peach,
    position: 'absolute',
  },
  letter: {
    color: tizaiaColors.inkButton,
    fontWeight: '700',
    textAlign: 'center',
  },
  mark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFFC7',
    borderColor: tizaiaColors.white,
    borderWidth: 1,
    justifyContent: 'center',
    shadowColor: '#8D5A43',
  },
});
