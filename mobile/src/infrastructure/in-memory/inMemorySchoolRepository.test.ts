import { createInMemorySchoolRepository } from './index';

/**
 * #76: bootstrap mínimo solo contexto global; los boards por clase evitan overfetch.
 */
describe('InMemorySchoolRepository.getBootstrap', () => {
  it('devuelve solo teacher/activeClassId/classes sin overfetch', async () => {
    const repository = createInMemorySchoolRepository(new Date('2026-08-19'));

    const bootstrap = await repository.getBootstrap();

    expect(bootstrap.activeClassId).toBe('class-1');
    expect(bootstrap.classes.length).toBeGreaterThan(1);
    expect(
      (bootstrap as unknown as { students: unknown }).students,
    ).toBeUndefined();
    expect(
      (bootstrap as unknown as { attendance: unknown }).attendance,
    ).toBeUndefined();
    expect(
      (bootstrap as unknown as { assignments: unknown }).assignments,
    ).toBeUndefined();
  });
});

describe('InMemorySchoolRepository boards (#76)', () => {
  it('attendance-board aísla por clase sin mezclar otras', async () => {
    const repository = createInMemorySchoolRepository(new Date('2026-08-19'));
    const board = await repository.getAttendanceBoard('class-1');
    const otherStudents = await repository.getStudents('class-2');
    const otherIds = new Set(otherStudents.map((s) => s.id));
    expect(board.students.every((s) => s.classId === 'class-1')).toBe(true);
    expect(board.attendance.every((r) => !otherIds.has(r.studentId))).toBe(
      true,
    );
    expect(board.schoolDays.length).toBeGreaterThan(0);
  });

  it('task-board evita N+1 y aísla por clase', async () => {
    const repository = createInMemorySchoolRepository(new Date('2026-08-19'));
    const board = await repository.getTaskBoard('class-1');
    expect(board.students.every((s) => s.classId === 'class-1')).toBe(true);
    expect(board.assignments.every((a) => a.classId === 'class-1')).toBe(true);
    const assignmentIds = new Set(board.assignments.map((a) => a.id));
    expect(
      board.submissions.every((s) => assignmentIds.has(s.assignmentId)),
    ).toBe(true);
  });

  it('annotations enriquecidas filtran por clase y traen studentName', async () => {
    const repository = createInMemorySchoolRepository(new Date('2026-08-19'));
    const all = await repository.getAnnotations();
    expect(all.length).toBeGreaterThan(0);
    for (const item of all) {
      expect(typeof item.studentName).toBe('string');
      expect(item.studentInitials.length).toBeGreaterThanOrEqual(2);
    }
    const byClass = await repository.getAnnotations({ classId: 'class-1' });
    const class1Students = await repository.getStudents('class-1');
    const class1Ids = new Set(class1Students.map((s) => s.id));
    for (const item of byClass)
      expect(class1Ids.has(item.studentId)).toBe(true);
  });
});
