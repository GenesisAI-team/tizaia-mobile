/**
 * Datos mock del docente y su clase activa (DESIGN.md §4.11/§4.12).
 * Se sustituirán por datos reales de sesión/Supabase en la fase funcional.
 */
export const MOCK_TEACHER_PROFILE = {
  email: 'laura@tizaia.es',
  initials: 'LM',
  label: 'CUENTA DOCENTE',
  name: 'Laura Martínez',
} as const;

export const MOCK_ACTIVE_CLASS = {
  badgeText: '1.º',
  label: 'CLASE ACTIVA',
  name: '1.º BACHILLER D',
  subject: 'Tecnología',
} as const;
