import Svg, { Line, Path } from 'react-native-svg';

import { colors } from '../../theme/theme';
import type { IconProps } from './types';

const DEFAULT_SIZE = 24;
const STROKE_WIDTH = 2;

/**
 * Icono warning triangular amarillo: acción "Añadir anotación" en Alumnos
 * (HU-005, RF-ALUM-002). Contrato UI-000 (issue #16).
 */
export function WarningIcon({
  size = DEFAULT_SIZE,
  color = colors.warning,
}: IconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
      <Line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        x1={12}
        x2={12}
        y1={9}
        y2={13}
      />
      <Line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        x1={12}
        x2={12.01}
        y1={17}
        y2={17}
      />
    </Svg>
  );
}
