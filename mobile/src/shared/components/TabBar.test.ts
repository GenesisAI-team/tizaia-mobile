import { getTabColors } from './TabBar';
import { tizaiaColors } from '../theme/tizaiaTheme';

describe('TabBar (DESIGN.md §4.2)', () => {
  it('la pestaña activa usa fondo oscuro e icono blanco', () => {
    expect(getTabColors(true)).toEqual({
      backgroundColor: tizaiaColors.inkButton,
      iconColor: tizaiaColors.white,
    });
  });

  it('la pestaña inactiva es transparente con icono tinta', () => {
    expect(getTabColors(false)).toEqual({
      backgroundColor: 'transparent',
      iconColor: tizaiaColors.ink,
    });
  });
});
