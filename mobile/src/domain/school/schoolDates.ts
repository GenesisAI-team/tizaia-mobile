/**
 * Utilidades de fechas lectivas (MVP demo en memoria).
 * Solo se cuentan días de lunes a viernes, en orden de más reciente a más
 * antiguo. `getRecentSchoolDays` recibe una referencia local al iniciar la
 * app; si es fin de semana, el primer día lectivo es el viernes anterior.
 */

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] as const;

const pad = (value: number): string => String(value).padStart(2, '0');

export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Últimos `count` días lectivos (lun-vie), de más reciente a más antiguo. */
export const getRecentSchoolDays = (
  referenceDate: Date,
  count: number,
): string[] => {
  const isoDays: string[] = [];
  const cursor = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  while (isoDays.length < count) {
    const dayOfWeek = cursor.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      isoDays.push(toIsoDate(cursor));
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return isoDays;
};

export const getWeekdayLabel = (isoDate: string): string => {
  const year = Number(isoDate.slice(0, 4));
  const month = Number(isoDate.slice(5, 7));
  const day = Number(isoDate.slice(8, 10));
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5
    ? (WEEKDAY_LABELS[dayOfWeek - 1] ?? '')
    : '';
};

export const getDayMonthLabel = (isoDate: string): string =>
  `${isoDate.slice(8, 10)}/${isoDate.slice(5, 7)}`;

export const formatDayMonth = (date: Date): string =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
