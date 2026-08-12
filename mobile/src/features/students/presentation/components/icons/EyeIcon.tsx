import Svg, { Circle, Path } from 'react-native-svg';

export type ActionIconProps = {
  /** Color principal del trazo. */
  color?: string;
  /** Tamaño del lienzo cuadrado en dp. */
  size?: number;
};

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = '#2563eb';

/**
 * Icono "ojo" de la acción Ver detalle (azul). Decorativo: el botón que lo
 * envuelve aporta la etiqueta accesible.
 *
 * NOTA (UI-000, #16): icono local provisional de `students` hasta que exista
 * el set de iconos compartido en `mobile/src/shared/`.
 */
export function EyeIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}: ActionIconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Circle cx={12} cy={12} fill={color} r={3} />
    </Svg>
  );
}
