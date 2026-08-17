import {
  DESIGN_CANVAS,
  dp,
  tizaiaColors,
  tizaiaGradient,
  tizaiaRadius,
  tizaiaSpacing,
  tizaiaTypography,
} from './tizaiaTheme';

describe('tizaiaTheme (contrato visual definitivo, DESIGN.md §3)', () => {
  it('define el lienzo de diseño 768×1376 y la escala @2x', () => {
    expect(DESIGN_CANVAS).toEqual({ height: 1376, width: 768 });
    expect(dp(768)).toBe(384);
    expect(dp(46)).toBe(23);
  });

  it('define el degradado global pintado en las pantallas', () => {
    expect(tizaiaGradient.start).toBe('#FBC7A5');
    expect(tizaiaGradient.mid).toBe('#FCE0C3');
    expect(tizaiaGradient.end).toBe('#FFF8EC');
    expect(tizaiaGradient.midOffset).toBe(0.5);
  });

  it('expone la tinta principal y los colores de acción', () => {
    expect(tizaiaColors.ink).toBe('#3E3030');
    expect(tizaiaColors.inkButton).toBe('#403034');
    expect(tizaiaColors.success).toBe('#8FBC8F');
    expect(tizaiaColors.warning).toBe('#F4A460');
    expect(tizaiaColors.danger).toBe('#E9967A');
  });

  it('expone los colores de superficie y campos', () => {
    expect(tizaiaColors.cardGlass).toBe('#FFFFFF99');
    expect(tizaiaColors.fieldBackground).toBe('#FFF9F4');
    expect(tizaiaColors.fieldBorder).toBe('#E7CEC1');
  });

  it('mantiene los tokens declarados en Tizaia.op (px de diseño)', () => {
    expect(tizaiaSpacing).toEqual({ 1: 8, 2: 12, 3: 16, 4: 24 });
    expect(tizaiaRadius).toEqual({ sm: 10, md: 16, lg: 24 });
    expect(tizaiaTypography.screenTitle).toEqual({
      fontSize: 48,
      fontWeight: '700',
    });
    expect(tizaiaTypography.formTitle.fontSize).toBe(42);
  });
});
