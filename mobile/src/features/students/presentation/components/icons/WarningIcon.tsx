import Svg, { Path } from 'react-native-svg';

import type { ActionIconProps } from './EyeIcon';

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = '#eab308';

/**
 * Icono "warning" triangular amarillo de la acción Añadir anotación.
 * Decorativo: el botón que lo envuelve aporta la etiqueta accesible.
 *
 * NOTA (UI-000, #16): icono local provisional de `students` hasta que exista
 * el set de iconos compartido en `mobile/src/shared/`.
 */
export function WarningIcon({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
}: ActionIconProps): React.JSX.Element {
  return (
    <Svg accessible={false} height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M12 3 L22 20 H2 Z"
        fill={color}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <Path
        d="M12 9.5 V14"
        fill="none"
        stroke="#1f2937"
        strokeLinecap="round"
        strokeWidth={2}
      />
      <Path
        d="M12 17.2 V17.3"
        fill="none"
        stroke="#1f2937"
        strokeLinecap="round"
        strokeWidth={2.4}
      />
    </Svg>
  );
}
