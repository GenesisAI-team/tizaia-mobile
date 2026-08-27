import type {
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  Student,
} from './models';
import {
  selectActiveClassData,
  type ClassScopedSource,
} from './activeClassData';

const STUDENTS: Student[] = [
  {
    id: 'student-1',
    classId: 'class-1',
    firstName: 'Ana',
    lastName: 'García',
    description: null,
  },
  {
    id: 'student-2',
    classId: 'class-1',
    firstName: 'Bruno',
    lastName: 'Díaz',
    description: null,
  },
  {
    id: 'student-3',
    classId: 'class-2',
    firstName: 'Carla',
    lastName: 'Ruiz',
    description: null,
  },
];

const ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    studentId: 'student-1',
    date: '2026-08-19',
    status: 'present',
  },
  {
    id: 'att-2',
    studentId: 'student-3',
    date: '2026-08-19',
    status: 'absent',
  },
];

const ASSIGNMENTS: Assignment[] = [
  {
    id: 'assignment-1',
    classId: 'class-1',
    title: 'Práctica 1',
    dueDate: '2026-08-19',
  },
  {
    id: 'assignment-other',
    classId: 'class-2',
    title: 'Tarea de otra clase',
    dueDate: '2026-08-19',
  },
];

const SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub-1',
    assignmentId: 'assignment-1',
    studentId: 'student-1',
    status: 'submitted',
  },
  {
    id: 'sub-other',
    assignmentId: 'assignment-other',
    studentId: 'student-3',
    status: 'pending',
  },
];

function createSource(): ClassScopedSource {
  return {
    activeClassId: 'class-1',
    students: STUDENTS,
    attendance: ATTENDANCE,
    assignments: ASSIGNMENTS,
    submissions: SUBMISSIONS,
  };
}

describe('selectActiveClassData', () => {
  it('acota alumnos y asistencia a la clase activa', () => {
    const data = selectActiveClassData(createSource());

    expect(data.activeClassId).toBe('class-1');
    expect(data.students.map((student) => student.id)).toEqual([
      'student-1',
      'student-2',
    ]);
    // La asistencia del alumno de otra clase queda excluida.
    expect(
      data.attendance.some((record) => record.studentId === 'student-3'),
    ).toBe(false);
  });

  it('acota tareas y entregas a la clase activa', () => {
    const data = selectActiveClassData(createSource());

    expect(data.assignments.map((assignment) => assignment.id)).toEqual([
      'assignment-1',
    ]);
    expect(data.submissions.map((submission) => submission.id)).toEqual([
      'sub-1',
    ]);
  });
});
