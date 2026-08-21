import type {
  Annotation,
  AnnotationType,
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  AttendanceStatus,
  Mail,
  MailRecipientRef,
  SchoolClass,
  SchoolDay,
  Student,
  StudentContact,
  SubmissionStatus,
  Teacher,
} from './models.js';

/**
 * Puerto de datos del centro. Lo satisface la implementación en memoria
 * (`infrastructure/memory`) y, en hitos posteriores, un adaptador Supabase
 * sin cambiar servicios ni rutas (RFC-001 §9).
 */
export interface SchoolRepository {
  // Consultas
  getTeacher(): Teacher;
  getActiveClassId(): string;
  getClasses(): SchoolClass[];
  getClass(classId: string): SchoolClass | undefined;
  /** Alumnos de una clase; sin clase devuelve todo el alumnado. */
  getStudents(classId?: string): Student[];
  getStudent(studentId: string): Student | undefined;
  getContacts(studentId: string): StudentContact[];
  getAllContacts(): StudentContact[];
  getSchoolDays(): SchoolDay[];
  isSchoolDay(date: string): boolean;
  getAttendanceForClass(classId: string): AttendanceRecord[];
  getAttendanceByStudent(studentId: string): AttendanceRecord[];
  getAssignments(classId?: string): Assignment[];
  getAssignment(assignmentId: string): Assignment | undefined;
  getSubmissions(assignmentId: string): AssignmentSubmission[];
  getAnnotations(): Annotation[];
  getAnnotation(annotationId: string): Annotation | undefined;
  getMails(): Mail[];
  getMail(mailId: string): Mail | undefined;

  // Escrituras (persisten mientras viva el proceso)
  upsertAttendanceStatus(input: {
    studentId: string;
    date: string;
    status: AttendanceStatus;
  }): AttendanceRecord;
  setSubmissionStatus(input: {
    assignmentId: string;
    studentId: string;
    status: SubmissionStatus;
  }): AssignmentSubmission;
  createAnnotation(input: {
    studentId: string;
    type: AnnotationType;
    description: string;
    createdAt?: Date;
  }): Annotation;
  setAnnotationManaged(annotationId: string, managed: boolean): Annotation;
  updateStudent(
    studentId: string,
    patch: { firstName?: string; lastName?: string },
  ): Student;
  deleteStudentCascade(studentId: string): void;
  createMail(input: {
    subject: string;
    body: string;
    recipients: MailRecipientRef[];
    createdAt?: Date;
  }): Mail;
  setMailRead(mailId: string, isRead: boolean): Mail;

  // Ciclo de vida
  resetToSeed(referenceDate?: Date): void;
}
