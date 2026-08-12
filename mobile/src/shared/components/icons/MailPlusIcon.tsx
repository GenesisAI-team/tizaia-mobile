import Svg, { Line, Path, Polyline } from 'react-native-svg';

import { colors } from '../../theme/theme';
import type { IconProps } from './types';

const DEFAULT_SIZE = 24;
const STROKE_WIDTH = 2;

/**
 * Icono sobre con "+": acción "Nuevo mail" en Anotaciones (HU-008,
 * RF-NOTE-002) y botón inferior de Mails (HU-010/HU-011). Contrato UI-000
 * (issue #16).
 */
export function MailPlusIcon({
  size = DEFAULT_SIZE,
  color = colors.primary,
}: IconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M4 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
      <Polyline
        fill="none"
        points="2.5 7.5 9.5 12.5 16.5 7.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
      <Line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        x1={20.5}
        x2={20.5}
        y1={1.5}
        y2={7.5}
      />
      <Line
        stroke={color}
        strokeLinecap="round"
        strokeWidth={STROKE_WIDTH}
        x1={17.5}
        x2={23.5}
        y1={4.5}
        y2={4.5}
      />
    </Svg>
  );
}
