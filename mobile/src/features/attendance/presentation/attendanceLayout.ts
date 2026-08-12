/**
 * Helpers puramente presentacionales de la matriz de Asistencia (HU-004,
 * issue #17). Sin lógica de negocio: solo medidas y formato de etiquetas.
 */

/** Fechas totales de la matriz (HU-004: cinco fechas recientes). */
export const ATTENDANCE_DATE_COUNT = 5;

/** Columnas de fecha visibles inicialmente en pantalla. */
export const ATTENDANCE_VISIBLE_COLUMNS = 3;

/** Ancho de la columna fija de avatar/alumno. */
export const AVATAR_COLUMN_WIDTH = 72;

/** Alto de cada fila de alumno (celdas y avatar comparten alto). */
export const ATTENDANCE_ROW_HEIGHT = 56;

/** Ancho de cada celda de fecha para ver `visibleColumns` columnas. */
export function computeDateCellWidth(
  availableWidth: number,
  visibleColumns: number = ATTENDANCE_VISIBLE_COLUMNS,
): number {
  if (availableWidth <= 0 || visibleColumns <= 0) return 0;
  return Math.floor(availableWidth / visibleColumns);
}

const WEEKDAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

export type DateLabel = {
  /** Etiqueta de día de semana en mayúsculas, p. ej. "LUN". */
  weekday: string;
  /** Día del mes con dos dígitos, p. ej. "05". */
  day: string;
};

/** Etiqueta visual de una fecha ISO `YYYY-MM-DD` para la cabecera de la matriz. */
export function formatDateLabel(isoDate: string): DateLabel {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
  return {
    day: String(day ?? 1).padStart(2, '0'),
    weekday: WEEKDAY_LABELS[date.getDay()] ?? '',
  };
}
