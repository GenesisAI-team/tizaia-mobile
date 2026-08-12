import Svg, { Path } from 'react-native-svg';

import type { ActionIconProps } from './EyeIcon';

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = '#dc2626';

/**
 * Icono "papelera" roja de la acción Eliminar. Decorativo: el botón que lo
 * envuelve aporta la etiqueta accesible.
 *
 * NOTA (UI-000, #16): icono local provisional de `students` hasta que exista
 * el set de iconos compartido en `mobile/src/shared/`.
 */
export function TrashIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}: ActionIconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M4 7 H20"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={2}
      />
      <Path
        d="M9 7 V5 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 v2"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Path
        d="M6.5 7 L7.5 19.5 a1.5 1.5 0 0 0 1.5 1.5 h6 a1.5 1.5 0 0 0 1.5 -1.5 L17.5 7"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Path
        d="M10 11 V17 M14 11 V17"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={2}
      />
    </Svg>
  );
}
