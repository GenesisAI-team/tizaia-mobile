import Svg, { Path } from 'react-native-svg';

import { colors } from '../../theme/designTokens';

type TrashIconProps = {
  color?: string;
  size?: number;
};

export function TrashIcon({
  color = colors.danger,
  size = 24,
}: TrashIconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}
