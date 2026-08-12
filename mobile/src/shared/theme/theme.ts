/**
 * Tema visual compartido mínimo (UI-000, issue #16).
 *
 * Contrato estable para las pantallas Asistencia (HU-004), Alumnos
 * (HU-005/HU-006), Tareas (HU-007), Anotaciones (HU-008/HU-009) y Mails
 * (HU-010..HU-012). Solo tokens de diseño; sin lógica de negocio.
 *
 * Los colores de estado recogen las reglas normativas:
 * - BR-ASIS-001: Asistido verde, No asistido rojo, Tarde amarillo.
 * - BR-TASK-001: Entregada verde, No entregada rojo.
 * - BR-ANOT-001: Refuerzo positivo verde; conductas contrarias/agravantes rojo.
 * - BR-ANOT-002: No gestionada rojo transparente; gestionada check verde.
 */

export const colors = {
  // Superficies y bordes (coherentes con la paleta slate ya usada en login).
  background: '#ffffff',
  surface: '#f1f5f9',
  border: '#cbd5e1',

  // Texto.
  textPrimary: '#0f172a',
  textSecondary: '#1f2937',
  textMuted: '#64748b',

  // Acción principal (botones existentes de la app).
  primary: '#1e293b',
  onPrimary: '#ffffff',

  // Estados normativos.
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#f59e0b',
  info: '#2563eb',

  // Tintes suaves de estado para filas y tarjetas (tonos de fila de
  // BR-ANOT-002 e historiales coloreados de HU-006).
  successSurface: '#dcfce7',
  dangerSurface: '#fee2e2',
  warningSurface: '#fef3c7',

  // Errores de formulario (ya usado en LoginScreen).
  error: '#b00020',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 16,
  /** Círculos (avatar, botón de estado) y pills. */
  full: 9999,
} as const;

export const typography = {
  /** Títulos de pantalla en mayúsculas (ASISTENCIA, ALUMNOS, ...). */
  screenTitle: { fontSize: 28, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  /** Nombres de alumno y etiquetas destacadas en filas. */
  label: { fontSize: 14, fontWeight: '600' },
  /** Fechas, horas y metadatos de fila. */
  caption: { fontSize: 12, fontWeight: '400' },
} as const;
