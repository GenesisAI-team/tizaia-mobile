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
 * Puerto de datos del centro, asíncrono para ser compatible con I/O real.
 * Lo satisface la implementación en memoria (`infrastructure/memory`) y,
 * en hitos posteriores, un adaptador Supabase sin cambiar servicios ni
 * rutas (RFC-001 §9).
 */
export interface SchoolRepository {
  // Consultas
  getTeacher(): Promise<Teacher>;
  getActiveClassId(): Promise<string>;
  getClasses(): Promise<SchoolClass[]>;
  getClass(classId: string): Promise<SchoolClass | undefined>;
  /** Alumnos de una clase; sin clase devuelve todo el alumnado. */
  getStudents(classId?: string): Promise<Student[]>;
  getStudent(studentId: string): Promise<Student | undefined>;
  getContacts(studentId: string): Promise<StudentContact[]>;
  getAllContacts(): Promise<StudentContact[]>;
  getSchoolDays(): Promise<SchoolDay[]>;
  isSchoolDay(date: string): Promise<boolean>;
  getAttendanceForClass(classId: string): Promise<AttendanceRecord[]>;
  getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]>;
  getAssignments(classId?: string): Promise<Assignment[]>;
  getAssignment(assignmentId: string): Promise<Assignment | undefined>;
  getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]>;
  getAnnotations(): Promise<Annotation[]>;
  getAnnotation(annotationId: string): Promise<Annotation | undefined>;
  getMails(): Promise<Mail[]>;
  getMail(mailId: string): Promise<Mail | undefined>;

  // Escrituras (persisten mientras viva el proceso)
  upsertAttendanceStatus(input: {
    studentId: string;
    date: string;
    status: AttendanceStatus;
  }): Promise<AttendanceRecord>;
  setSubmissionStatus(input: {
    assignmentId: string;
    studentId: string;
    status: SubmissionStatus;
  }): Promise<AssignmentSubmission>;
  createAnnotation(input: {
    studentId: string;
    type: AnnotationType;
    description: string;
    createdAt?: Date;
  }): Promise<Annotation>;
  setAnnotationManaged(
    annotationId: string,
    managed: boolean,
  ): Promise<Annotation>;
  updateStudent(
    studentId: string,
    patch: { firstName?: string; lastName?: string },
  ): Promise<Student>;
  deleteStudentCascade(studentId: string): Promise<void>;
  createMail(input: {
    subject: string;
    body: string;
    recipients: MailRecipientRef[];
    createdAt?: Date;
  }): Promise<Mail>;
  setMailRead(mailId: string, isRead: boolean): Promise<Mail>;

  // Ciclo de vida
  resetToSeed(referenceDate?: Date): Promise<void>;
}
