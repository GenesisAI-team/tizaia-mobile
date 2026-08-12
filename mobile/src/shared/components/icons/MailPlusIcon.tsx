import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../../theme/designTokens';

type MailPlusIconProps = {
  color?: string;
  size?: number;
};

export function MailPlusIcon({
  color = colors.primary,
  size = 24,
}: MailPlusIconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M3 6h18v12H3V6Z"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Path
        d="m3 7 9 6 9-6"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Circle cx={19} cy={19} fill={colors.background} r={4.5} />
      <Path
        d="M19 16.5v5M16.5 19h5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={2}
      />
    </Svg>
  );
}
