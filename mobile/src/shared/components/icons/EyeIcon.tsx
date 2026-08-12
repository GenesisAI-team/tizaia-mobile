import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../../theme/theme';
import type { IconProps } from './types';

const DEFAULT_SIZE = 24;
const STROKE_WIDTH = 2;

/**
 * Icono ojo azul: acción "Ver detalles" en Alumnos (HU-005, RF-ALUM-002) y
 * Anotaciones (HU-008, RF-NOTE-002). Contrato UI-000 (issue #16), sin
 * dependencias nuevas (react-native-svg ya es dependencia del proyecto).
 */
export function EyeIcon({
  size = DEFAULT_SIZE,
  color = colors.info,
}: IconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
      <Circle
        cx={12}
        cy={12}
        fill="none"
        r={3}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
      />
    </Svg>
  );
}
