/**
 * Resolución de fechas relativas del asistente (AI-001): «hoy» y «ayer» se
 * calculan en el backend con la zona `Europe/Madrid` (Q de comportamiento) y
 * con un reloj inyectable para que las pruebas sean deterministas. El formato
 * canónico es ISO local `YYYY-MM-DD`, igual que los seeds.
 */

const MADRID_TIMEZONE = 'Europe/Madrid';

/** Formateador `en-CA`: produce `YYYY-MM-DD` directamente. */
const madridIsoFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: MADRID_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Fecha `YYYY-MM-DD` correspondiente a un instante en `Europe/Madrid`. */
export function isoDateInMadrid(instant: Date): string {
  return madridIsoFormatter.format(instant);
}

/** Desplaza una fecha ISO local `YYYY-MM-DD` en días naturales. */
export function shiftIsoDate(isoDate: string, days: number): string {
  const parts = isoDate.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    throw new Error(`Fecha ISO inválida: ${isoDate}`);
  }
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export type FlexibleDate = 'hoy' | 'ayer' | (string & {});

/**
 * Normaliza la referencia de fecha elegida por el modelo: «hoy»/«ayer» se
 * resuelven contra el reloj inyectado en `Europe/Madrid`; un ISO válido pasa
 * tal cual. La validación de formato corresponde al esquema Zod de cada tool.
 */
export function resolveFlexibleDate(
  value: FlexibleDate | undefined,
  now: () => Date,
): string {
  const today = isoDateInMadrid(now());
  if (value === undefined || value === 'hoy') {
    return today;
  }
  if (value === 'ayer') {
    return shiftIsoDate(today, -1);
  }
  return value;
}
