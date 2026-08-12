import Svg, { Polyline } from 'react-native-svg';

import { colors } from '../../theme/theme';
import type { IconProps } from './types';

const DEFAULT_SIZE = 24;
const STROKE_WIDTH = 2;

/**
 * Icono check verde: estado "gestionada" de una anotación (HU-008,
 * RF-NOTE-005, BR-ANOT-002). Contrato UI-000 (issue #16). El color es
 * sobreescribible para variantes atenuadas/transparentes.
 */
export function CheckIcon({
  size = DEFAULT_SIZE,
  color = colors.success,
}: IconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Polyline
        fill="none"
        points="20 6 9 17 4 12"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
      />
    </Svg>
  );
}
