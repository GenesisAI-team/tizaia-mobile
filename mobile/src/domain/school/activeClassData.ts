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

export const selectActiveClassData = (
  bootstrap: SchoolBootstrap,
): ActiveClassData => {
  const { activeClassId } = bootstrap;
  const students = bootstrap.students.filter(
    (student) => student.classId === activeClassId,
  );
  const studentIds = new Set(students.map((student) => student.id));
  const assignments = bootstrap.assignments.filter(
    (assignment) => assignment.classId === activeClassId,
  );
  const assignmentIds = new Set(assignments.map((assignment) => assignment.id));
  return {
    activeClassId,
    students,
    attendance: bootstrap.attendance.filter((record) =>
      studentIds.has(record.studentId),
    ),
    assignments,
    submissions: bootstrap.submissions.filter((submission) =>
      assignmentIds.has(submission.assignmentId),
    ),
  };
};
