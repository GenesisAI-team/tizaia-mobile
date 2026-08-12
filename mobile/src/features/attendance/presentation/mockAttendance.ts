import { ATTENDANCE_DATE_COUNT } from './attendanceLayout';

/**
 * Datos mock locales para maquetar la pantalla Asistencia (HU-004, issue #17).
 * No representan reglas de negocio: RF-ASIS-001..006, BR-ASIS-001 y
 * DAT-ASIS-001 quedan pendientes para iteraciones posteriores.
 */

export type MockAttendanceStatus = 'attended' | 'absent' | 'late' | 'unmarked';

export type MockStudent = {
  id: string;
  name: string;
  photoUrl?: string;
};

export const MOCK_STUDENTS: readonly MockStudent[] = [
  { id: 'stu-01', name: 'Aitana Romero' },
  { id: 'stu-02', name: 'Bruno Cabrera' },
  { id: 'stu-03', name: 'Carla Vidal' },
  { id: 'stu-04', name: 'Daniel Serrano' },
  { id: 'stu-05', name: 'Elena Fuentes' },
  { id: 'stu-06', name: 'Hugo Navarro' },
  { id: 'stu-07', name: 'Julia Ortega' },
  { id: 'stu-08', name: 'Marco Ibáñez' },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Cinco fechas recientes descendentes terminando en `referenceDate`
 * (estructura visual de HU-004; sin regla lectiva definida todavía).
 */
export function buildRecentDates(
  referenceDate: Date,
  count: number = ATTENDANCE_DATE_COUNT,
): string[] {
  const dates: string[] = [];
  for (let index = 0; index < count; index += 1) {
    dates.push(
      toIsoDate(new Date(referenceDate.getTime() - index * MS_PER_DAY)),
    );
  }
  return dates;
}

/** Iniciales visuales del avatar (contrato StudentAvatar de UI-000, #16). */
export function getStudentInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

const MOCK_STATUS_CYCLE: readonly MockAttendanceStatus[] = [
  'attended',
  'late',
  'absent',
  'attended',
  'unmarked',
];

/**
 * Estado mock determinista para una celda (fila/columna). Solo sirve para
 * mostrar los tres colores y el estado sin marcar al maquetar.
 */
export function mockStatusAt(
  rowIndex: number,
  columnIndex: number,
): MockAttendanceStatus {
  return (
    MOCK_STATUS_CYCLE[(rowIndex + columnIndex) % MOCK_STATUS_CYCLE.length] ??
    'unmarked'
  );
}
