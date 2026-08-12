/**
 * Tema visual compartido mínimo (contrato UI-000, issue #16).
 *
 * Definición local hasta que la PR de UI-000 se integre en main; los nombres
 * se mantienen estables para que las cinco pantallas (Asistencia, Alumnos,
 * Tareas, Anotaciones y Mails) consuman el mismo contrato.
 */
export const theme = {
  colors: {
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#cbd5e1',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    primary: '#1e293b',
    statusSuccess: '#22c55e',
    statusDanger: '#ef4444',
    statusWarning: '#eab308',
    statusNeutral: '#ffffff',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  radius: {
    sm: 8,
    md: 12,
    pill: 999,
  },
  typography: {
    title: 22,
    body: 15,
    caption: 12,
  },
} as const;

export type Theme = typeof theme;
