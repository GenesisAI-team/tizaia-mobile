import Svg, { Ellipse, Rect } from 'react-native-svg';

import { tizaiaColors } from '../../theme/tizaiaTheme';

type GlobeIconProps = {
  color?: string;
  size?: number;
};

/** Icono globo de la TabBar (n1533..n1536 de Tizaia.op, viewBox 44×44). */
export function GlobeIcon({
  color = tizaiaColors.ink,
  size = 22,
}: GlobeIconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 44 44" width={size}>
      <Ellipse
        cx={22}
        cy={22}
        fill="none"
        rx={20}
        ry={20}
        stroke={color}
        strokeWidth={3}
      />
      <Ellipse
        cx={22}
        cy={22}
        fill="none"
        rx={10}
        ry={20}
        stroke={color}
        strokeWidth={3}
      />
      <Rect fill={color} height={3} rx={1.5} width={40} x={2} y={20.5} />
    </Svg>
  );
}
