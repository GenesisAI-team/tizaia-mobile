import { colors, radius, spacing, typography } from './designTokens';

describe('designTokens', () => {
  it('expone los colores de acción acordados para las pantallas visuales', () => {
    expect(colors.info).toBe('#2563eb');
    expect(colors.warning).toBe('#f59e0b');
    expect(colors.danger).toBe('#dc2626');
    expect(colors.success).toBe('#16a34a');
  });

  it('mantiene tokens básicos consistentes', () => {
    expect(spacing.md).toBe(16);
    expect(radius.md).toBe(10);
    expect(typography.title.fontSize).toBeGreaterThan(20);
  });
});
