import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../../theme/designTokens';

type EyeIconProps = {
  color?: string;
  size?: number;
};

export function EyeIcon({
  color = colors.info,
  size = 24,
}: EyeIconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Circle cx={12} cy={12} fill={color} r={2.5} />
    </Svg>
  );
}
