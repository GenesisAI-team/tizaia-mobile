import Svg, { Path } from 'react-native-svg';

import { tizaiaColors } from '../../theme/tizaiaTheme';

type HomeIconProps = {
  color?: string;
  size?: number;
};

/** Icono casa de la TabBar (path n1531 de Tizaia.op, viewBox 44×40). */
export function HomeIcon({
  color = tizaiaColors.ink,
  size = 22,
}: HomeIconProps): React.JSX.Element {
  return (
    <Svg
      accessible={false}
      height={(size * 40) / 44}
      viewBox="0 0 44 40"
      width={size}
    >
      <Path
        d="M 2 19 L 22 2 L 42 19 L 38 19 L 38 39 L 27 39 L 27 26 L 17 26 L 17 39 L 6 39 L 6 19 Z"
        fill={color}
      />
    </Svg>
  );
}
