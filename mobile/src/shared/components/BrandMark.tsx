import { StyleSheet, Text, View } from 'react-native';

import { tizaiaColors } from '../theme/tizaiaTheme';

/**
 * Marca de Tizaia (DESIGN.md §5.8, nodo BrandMark n1686): círculo
 * #FFFFFFC7 con halo melocotón #F8C4A6 y la letra "T" en tinta.
 *
 * Fuente única (single source) del logotipo. `login` y `loading` escalan por
 * ratios desde el diámetro `login` (168px de diseño, → 84dp de radio, halo
 * 120, T 64). `header` usa medidas enteras y círculos anidados centrados por
 * Flexbox para evitar fracciones y offsets absolutos a 40dp.
 *
 * Variantes:
 * - `login`: 168dp, tamaño completo del Login (comportamiento inicial intacto).
 * - `header`: 40dp exterior / 28dp halo interior, geometría entera, sin
 *   offsets fraccionarios, sin sombra, concéntrico por Flexbox (fix visual
 *   header: evita grosor desigual por antialiasing a 40dp).
 * - `loading`: 72dp intermedio para la transición de autenticación estática
 *   con spinner (refine #98).
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

/** Sombra/elevación por variante. `header` sin sombra para evitar desplazamiento óptico a 40dp. */
const VARIANT_SHADOW: Record<
  Exclude<BrandMarkVariant, 'header'>,
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
  if (variant === 'header') {
    // Medidas enteras y círculos anidados centrados por Flexbox.
    // 40dp exterior + 28dp halo interior (validado vs 30dp: 28 mantiene
    // proporción 70% cercana al 71.4% del login y deja 6dp de corona blanca
    // uniforme; 30dp da 5dp y se percibe más pesado). Sin left/top fraccionarios
    // y sin sombra para evitar grosor desigual por antialiasing.
    return (
      <View
        accessibilityLabel={accessible ? 'Logotipo de Tizaia' : undefined}
        accessibilityRole={accessible ? 'image' : undefined}
        accessible={accessible}
        style={[styles.mark, styles.markHeader]}
      >
        <View style={styles.haloHeader}>
          <Text style={styles.letterHeader}>T</Text>
        </View>
      </View>
    );
  }

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
  haloHeader: {
    alignItems: 'center',
    backgroundColor: tizaiaColors.peach,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  letter: {
    color: tizaiaColors.inkButton,
    fontWeight: '700',
    textAlign: 'center',
  },
  letterHeader: {
    color: tizaiaColors.inkButton,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 15,
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
  markHeader: {
    alignItems: 'center',
    backgroundColor: '#FFFFFFC7',
    borderColor: tizaiaColors.white,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 0,
    height: 40,
    justifyContent: 'center',
    shadowOpacity: 0,
    width: 40,
  },
});
