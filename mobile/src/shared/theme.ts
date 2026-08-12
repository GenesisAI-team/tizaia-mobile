/**
 * Tema visual compartido mínimo (contrato UI-000, issue #16).
 *
 * Subconjunto provisional implementado por HU-007 (#19) porque UI-000 aún no
 * estaba mergeado: solo los tokens que consumen las pantallas de matriz.
 * Cuando UI-000 aterrice, este archivo debe reconciliarse con el contrato
 * definitivo sin cambiar los nombres exportados.
 */

export const colors = {
  /** Texto y bordes principales (mismo tono que AppLogo). */
  ink: '#1e293b',
  /** Fondo de pantalla y tarjetas. */
  surface: '#ffffff',
  /** Bordes suaves y separadores. */
  border: '#cbd5e1',
  /** Fondos neutros (cabeceras, chips). */
  mutedSurface: '#e6e6e6',
  /** Texto secundario. */
  mutedText: '#555555',
  /** Estado positivo: Entregada (HU-007). */
  success: '#2e7d32',
  /** Estado negativo: No entregada (HU-007). */
  danger: '#c62828',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  pill: 999,
} as const;

export const typography = {
  /** Título visual de pantalla (p. ej. TAREAS), consistente con Home. */
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
  },
  caption: {
    fontSize: 12,
  },
} as const;
