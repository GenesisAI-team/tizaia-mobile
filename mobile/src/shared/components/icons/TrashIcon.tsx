import Svg, { Line, Path, Polyline } from 'react-native-svg';

import { colors } from '../../theme/theme';
import type { IconProps } from './types';

const DEFAULT_SIZE = 24;
const STROKE_WIDTH = 2;

/**
 * Icono papelera roja: acción "Eliminar" en Alumnos (HU-005, RF-ALUM-002 y
 * RF-ALUM-005). Contrato UI-000 (issue #16).
 */
export function TrashIcon({
  size = DEFAULT_SIZE,
  color = colors.danger,
}: IconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Polyline
        fill="none"
        points="3 6 5 6 21 6"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
      <Path
        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
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
        x1={10}
        x2={10}
        y1={11}
        y2={17}
      />
      <Line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        x1={14}
        x2={14}
        y1={11}
        y2={17}
      />
    </Svg>
  );
}
