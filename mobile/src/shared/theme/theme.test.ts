import { colors, radii, spacing, typography } from './theme';

/**
 * Contrato del tema visual compartido (UI-000, issue #16): fija los tokens
 * que consumirán en paralelo los workers de HU-004..HU-012 para evitar
 * divergencias accidentales.
 */
describe('tema visual compartido (UI-000)', () => {
  it('fija los colores de estado normativos (BR-ASIS-001, BR-TASK-001, BR-ANOT-001)', () => {
    expect({
      success: colors.success,
      danger: colors.danger,
      warning: colors.warning,
    }).toEqual({
      success: '#16a34a',
      danger: '#dc2626',
      warning: '#f59e0b',
    });
  });

  it('fija el color de acción informativa (icono ojo) y los tintes de fila', () => {
    expect(colors.info).toBe('#2563eb');
    expect(colors.successSurface).toMatch(/^#/);
    expect(colors.dangerSurface).toMatch(/^#/);
    expect(colors.warningSurface).toMatch(/^#/);
  });

  it('mantiene la base neutra coherente con la app existente', () => {
    expect(colors.background).toBe('#ffffff');
    expect(colors.primary).toBe('#1e293b');
    expect(colors.onPrimary).toBe('#ffffff');
    expect(colors.border).toBe('#cbd5e1');
    expect(colors.textPrimary).toBe('#0f172a');
    expect(colors.error).toBe('#b00020');
  });

  it('define una escala de espaciados creciente', () => {
    const scale = [
      spacing.xs,
      spacing.sm,
      spacing.md,
      spacing.lg,
      spacing.xl,
      spacing.xxl,
    ];
    const sorted = [...scale].sort((a, b) => a - b);
    expect(scale).toEqual(sorted);
  });

  it('define radios incluido el radio circular para avatar y botón de estado', () => {
    expect(radii.md).toBe(8);
    expect(radii.full).toBeGreaterThanOrEqual(9999);
  });

  it('define la tipografía de título de pantalla y cuerpo', () => {
    expect(typography.screenTitle).toEqual({ fontSize: 28, fontWeight: '700' });
    expect(typography.body).toEqual({ fontSize: 16, fontWeight: '400' });
    expect(typography.label.fontWeight).toBe('600');
    expect(typography.caption.fontSize).toBeLessThan(typography.body.fontSize);
  });
});
