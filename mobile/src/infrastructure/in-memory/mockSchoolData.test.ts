import { createMockSchoolData } from './mockSchoolData';

const REFERENCE_DATE = new Date(2026, 7, 19, 10, 0, 0);

describe('createMockSchoolData', () => {
  it('genera las 6 clases de ejemplo con sus asignaturas', () => {
    const data = createMockSchoolData(REFERENCE_DATE);
    expect(data.classes.map((schoolClass) => schoolClass.groupName)).toEqual([
      '1.º BACHILLER D',
      '2 ESO G',
      '2º ESO C/D',
      '3 ESO A',
      '1 ESO B',
      '4 ESO C',
    ]);
    expect(data.classes[0]?.subject).toBe('Tecnología');
  });

  it('genera entre 20 y 30 alumnos por clase', () => {
    const data = createMockSchoolData(REFERENCE_DATE);
    for (const schoolClass of data.classes) {
      const count = data.students.filter(
        (student) => student.classId === schoolClass.id,
      ).length;
      expect(count).toBeGreaterThanOrEqual(20);
      expect(count).toBeLessThanOrEqual(30);
    }
  });

  it('asigna identificadores únicos a los alumnos', () => {
    const data = createMockSchoolData(REFERENCE_DATE);
    const ids = new Set(data.students.map((student) => student.id));
    expect(ids.size).toBe(data.students.length);
  });

  it('todos los alumnos tienen nombre y apellido', () => {
    const data = createMockSchoolData(REFERENCE_DATE);
    for (const student of data.students) {
      expect(student.firstName.length).toBeGreaterThan(0);
      expect(student.lastName.length).toBeGreaterThan(0);
    }
  });

  it('genera 10 días lectivos con etiquetas de fecha', () => {
    const data = createMockSchoolData(REFERENCE_DATE);
    expect(data.schoolDays).toHaveLength(10);
    expect(data.schoolDays[0]?.label).toBe('Mié');
    expect(data.schoolDays[0]?.secondaryLabel).toBe('19/08');
  });

  it('cada alumno tiene un registro de asistencia por día lectivo', () => {
    const data = createMockSchoolData(REFERENCE_DATE);
    for (const student of data.students) {
      const records = data.attendance.filter(
        (record) => record.studentId === student.id,
      );
      expect(records).toHaveLength(10);
      for (const record of records) {
        expect(['present', 'absent', 'late']).toContain(record.status);
      }
    }
  });

  it('cada clase tiene una tarea por día lectivo con título no vacío', () => {
    const data = createMockSchoolData(REFERENCE_DATE);
    for (const schoolClass of data.classes) {
      const classAssignments = data.assignments.filter(
        (assignment) => assignment.classId === schoolClass.id,
      );
      expect(classAssignments).toHaveLength(10);
      for (const assignment of classAssignments) {
        expect(assignment.title.length).toBeGreaterThan(0);
        expect(assignment.dueDate).toBeTruthy();
      }
    }
  });

  it('cada tarea tiene una entrega por alumno de su clase', () => {
    const data = createMockSchoolData(REFERENCE_DATE);
    for (const assignment of data.assignments) {
      const classStudents = data.students.filter(
        (student) => student.classId === assignment.classId,
      );
      const submissions = data.submissions.filter(
        (submission) => submission.assignmentId === assignment.id,
      );
      expect(submissions).toHaveLength(classStudents.length);
      for (const submission of submissions) {
        expect(['submitted', 'notSubmitted', 'pending']).toContain(
          submission.status,
        );
      }
    }
  });

  it('genera anotaciones y mails con remitentes existentes', () => {
    const data = createMockSchoolData(REFERENCE_DATE);
    expect(data.annotations.length).toBeGreaterThan(0);
    expect(data.mails.length).toBeGreaterThan(0);
    expect(data.mails.length).toBeLessThanOrEqual(30);

    const studentIds = new Set(data.students.map((student) => student.id));
    for (const mail of data.mails) {
      if (mail.senderStudentId === null) continue;
      expect(studentIds.has(mail.senderStudentId)).toBe(true);
    }

    const annotationStudentIds = new Set(
      data.annotations.map((annotation) => annotation.studentId),
    );
    for (const studentId of annotationStudentIds) {
      expect(studentIds.has(studentId)).toBe(true);
    }
  });

  it('es determinista: dos generaciones producen el mismo dataset', () => {
    const first = createMockSchoolData(REFERENCE_DATE);
    const second = createMockSchoolData(REFERENCE_DATE);
    expect(first.students).toEqual(second.students);
    expect(first.attendance).toEqual(second.attendance);
    expect(first.assignments).toEqual(second.assignments);
    expect(first.submissions).toEqual(second.submissions);
  });
});
