import {
  buildRecentDates,
  MOCK_STUDENTS,
  mockStatusAt,
} from './mockAttendance';

describe('mockAttendance', () => {
  it('genera cinco fechas recientes descendentes en formato ISO', () => {
    const dates = buildRecentDates(new Date(2026, 7, 12));
    expect(dates).toEqual([
      '2026-08-12',
      '2026-08-11',
      '2026-08-10',
      '2026-08-09',
      '2026-08-08',
    ]);
  });

  it('cruza de mes correctamente', () => {
    const dates = buildRecentDates(new Date(2026, 7, 1), 3);
    expect(dates).toEqual(['2026-08-01', '2026-07-31', '2026-07-30']);
  });

  it('ofrece alumnos mock suficientes para el scroll vertical', () => {
    expect(MOCK_STUDENTS.length).toBeGreaterThanOrEqual(6);
    const ids = MOCK_STUDENTS.map((student) => student.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('asigna estados mock deterministas dentro del conjunto previsto', () => {
    const allowed = new Set(['attended', 'absent', 'late', 'unmarked']);
    for (let row = 0; row < MOCK_STUDENTS.length; row += 1) {
      for (let column = 0; column < 5; column += 1) {
        const status = mockStatusAt(row, column);
        expect(allowed.has(status)).toBe(true);
        expect(mockStatusAt(row, column)).toBe(status);
      }
    }
  });
});
