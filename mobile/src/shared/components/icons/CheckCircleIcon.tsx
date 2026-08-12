import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../../theme/designTokens';

type CheckCircleIconProps = {
  color?: string;
  size?: number;
};

export function CheckCircleIcon({
  color = colors.success,
  size = 24,
}: CheckCircleIconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Circle
        cx={12}
        cy={12}
        fill="none"
        r={9}
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="m8 12 3 3 5-6"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}
