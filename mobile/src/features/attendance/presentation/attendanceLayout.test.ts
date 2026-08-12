import {
  ATTENDANCE_DATE_COUNT,
  ATTENDANCE_VISIBLE_COLUMNS,
  AVATAR_COLUMN_WIDTH,
  computeDateCellWidth,
  formatDateLabel,
} from './attendanceLayout';

describe('attendanceLayout', () => {
  it('fija cinco fechas totales y tres columnas visibles (HU-004)', () => {
    expect(ATTENDANCE_DATE_COUNT).toBe(5);
    expect(ATTENDANCE_VISIBLE_COLUMNS).toBe(3);
    expect(AVATAR_COLUMN_WIDTH).toBeGreaterThan(0);
  });

  it('reparte el ancho disponible entre las tres columnas visibles', () => {
    expect(computeDateCellWidth(300)).toBe(100);
    expect(computeDateCellWidth(678)).toBe(226);
  });

  it('permite otro número de columnas visibles', () => {
    expect(computeDateCellWidth(400, 4)).toBe(100);
  });

  it('devuelve cero ante medidas no válidas', () => {
    expect(computeDateCellWidth(0)).toBe(0);
    expect(computeDateCellWidth(-10)).toBe(0);
    expect(computeDateCellWidth(100, 0)).toBe(0);
  });

  it('formatea la etiqueta de fecha con día de semana y día a dos dígitos', () => {
    // 2026-08-10 es lunes.
    expect(formatDateLabel('2026-08-10')).toEqual({
      day: '10',
      weekday: 'LUN',
    });
    expect(formatDateLabel('2026-08-09')).toEqual({
      day: '09',
      weekday: 'DOM',
    });
  });
});
