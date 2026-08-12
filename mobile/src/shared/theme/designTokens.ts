export const colors = {
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceMuted: '#e2e8f0',
  border: '#cbd5e1',
  text: '#0f172a',
  textMuted: '#64748b',
  primary: '#1e293b',
  info: '#2563eb',
  warning: '#f59e0b',
  danger: '#dc2626',
  success: '#16a34a',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
  },
} as const;
