import {
  formatDayMonth,
  getDayMonthLabel,
  getRecentSchoolDays,
  getWeekdayLabel,
  toIsoDate,
} from './schoolDates';

describe('schoolDates', () => {
  describe('getRecentSchoolDays', () => {
    it('excluye sábados y domingos', () => {
      const days = getRecentSchoolDays(new Date(2026, 7, 21), 5);
      for (const isoDate of days) {
        const dayOfWeek = new Date(isoDate).getDay();
        expect([1, 2, 3, 4, 5]).toContain(dayOfWeek);
      }
    });

    it('devuelve el número de días pedido en orden descendente', () => {
      const days = getRecentSchoolDays(new Date(2026, 7, 19), 10);
      expect(days).toHaveLength(10);
      expect(days[0]).toBe('2026-08-19');
      expect(days[1]).toBe('2026-08-18');
    });

    it('si cae en fin de semana, el primer día lectivo es el viernes anterior', () => {
      const days = getRecentSchoolDays(new Date(2026, 7, 23), 1);
      expect(days).toHaveLength(1);
      expect(days[0]).toBe('2026-08-21');
    });
  });

  describe('etiquetas', () => {
    it('devuelve la etiqueta de día de semana', () => {
      expect(getWeekdayLabel('2026-08-19')).toBe('Mié');
      expect(getWeekdayLabel('2026-08-21')).toBe('Vie');
    });

    it('devuelve etiqueta vacía para fin de semana', () => {
      expect(getWeekdayLabel('2026-08-23')).toBe('');
    });

    it('formatea el día y mes con dos dígitos', () => {
      expect(getDayMonthLabel('2026-08-05')).toBe('05/08');
    });

    it('formatea la fecha a dd/mm', () => {
      expect(formatDayMonth(new Date(2026, 7, 19))).toBe('19/08');
      expect(formatDayMonth(new Date(2026, 0, 3))).toBe('03/01');
    });
  });

  it('serializa una fecha a ISO local YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 7, 19))).toBe('2026-08-19');
  });
});
