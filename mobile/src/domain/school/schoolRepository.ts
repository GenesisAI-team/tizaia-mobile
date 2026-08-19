import type {
  Annotation,
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  Mail,
  SchoolClass,
  SchoolDay,
  Student,
} from './models';

/**
 * Contrato de datos del centro. En el MVP lo satisface una implementación en
 * memoria; en hitos posteriores lo implementará el acceso a Supabase sin
 * cambiar las pantallas.
 */
export interface SchoolRepository {
  getActiveClassId(): string;
  getActiveClass(): SchoolClass;
  getClasses(): SchoolClass[];
  /** Alumnos de una clase; por defecto los de la clase activa. */
  getStudents(classId?: string): Student[];
  getStudent(studentId: string): Student | undefined;
  /** Últimos días lectivos, de más reciente a más antiguo. */
  getSchoolDays(): SchoolDay[];
  getAttendance(studentId: string): AttendanceRecord[];
  getAttendanceForClass(classId?: string): AttendanceRecord[];
  getAssignments(classId?: string): Assignment[];
  getSubmissions(assignmentId: string): AssignmentSubmission[];
  getAnnotations(): Annotation[];
  getMails(): Mail[];
  getStudentFamilyLabel(studentId: string): string;
}
