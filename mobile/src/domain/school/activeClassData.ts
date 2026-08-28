import type {
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  Student,
} from './models';

/**
 * Vista acotada a la clase activa. Antes filtraba el bootstrap completo
 * (`#76`); ahora los boards devuelven datos ya aislados por clase y el
 * selector queda como utilidad pura para tests o fallback, sin ocultar mezclas
 * entre clases en el fake.
 */
export type ActiveClassData = {
  activeClassId: string;
  students: Student[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
};

/**
 * Fuente acotada por clase. Ya no depende de `SchoolBootstrap` mínimo (#76):
 * hoy llega de boards `attendance-board`/`task-board`, pero el selector no
 * cambia.
 */
export type ClassScopedSource = {
  activeClassId: string;
  students: Student[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
};

export const selectActiveClassData = (
  source: ClassScopedSource,
): ActiveClassData => {
  const { activeClassId } = source;
  const students = source.students.filter(
    (student) => student.classId === activeClassId,
  );
  const studentIds = new Set(students.map((student) => student.id));
  const assignments = source.assignments.filter(
    (assignment) => assignment.classId === activeClassId,
  );
  const assignmentIds = new Set(assignments.map((assignment) => assignment.id));
  return {
    activeClassId,
    students,
    attendance: source.attendance.filter((record) =>
      studentIds.has(record.studentId),
    ),
    assignments,
    submissions: source.submissions.filter((submission) =>
      assignmentIds.has(submission.assignmentId),
    ),
  };
};
