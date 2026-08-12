import Svg, { Path, Rect } from 'react-native-svg';

import { colors } from '../../theme/designTokens';

type WarningIconProps = {
  color?: string;
  size?: number;
};

export function WarningIcon({
  color = colors.warning,
  size = 24,
}: WarningIconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M12 3 22 20H2L12 3Z"
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Rect fill={color} height={6} rx={1} width={2} x={11} y={9} />
      <Rect fill={color} height={2} rx={1} width={2} x={11} y={17} />
    </Svg>
  );
}
