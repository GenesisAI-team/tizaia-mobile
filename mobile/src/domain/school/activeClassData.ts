import type {
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  SchoolBootstrap,
  Student,
} from './models';

/**
 * Vista del bootstrap acotada a la clase activa. `/v1/bootstrap` sirve datos
 * de todo el centro (RFC-001 §7); las matrices de Asistencia y Tareas solo
 * representan la clase activa, así que cada pantalla selecciona con este
 * selector en lugar de consumir el agregado completo.
 */
export type ActiveClassData = {
  activeClassId: string;
  students: Student[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
};

/**
 * Únicos campos del bootstrap que consume el selector. El acoplamiento queda
 * explícito: hoy llegan de una sola petición a `/v1/bootstrap`; si mañana se
 * sirven desde endpoints por dominio, el selector no cambia.
 */
export type ClassScopedSource = Pick<
  SchoolBootstrap,
  'activeClassId' | 'students' | 'attendance' | 'assignments' | 'submissions'
>;

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
