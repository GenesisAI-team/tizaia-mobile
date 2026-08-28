import type {
  Annotation,
  AnnotationListItem,
  AnnotationType,
  AssignmentSubmission,
  AttendanceBoard,
  AttendanceRecord,
  AttendanceStatus,
  Mail,
  MailFolder,
  MailRecipientRef,
  SchoolBootstrap,
  SchoolClass,
  Student,
  StudentProgress,
  SubmissionStatus,
  TaskBoard,
  Teacher,
} from './models';

/**
 * Contrato de datos del centro, asíncrono para ser compatible con I/O real.
 * Lo satisface el adaptador HTTP (`infrastructure/api`) contra la API en
 * memoria de #67 y, en hitos posteriores, un adaptador Supabase sin cambiar
 * las pantallas (RFC-001 §9).
 */
export interface SchoolRepository {
  // Consultas
  /** Bootstrap mínimo: contexto global (teacher/activeClassId/classes) sin overfetch (#76). */
  getBootstrap(): Promise<SchoolBootstrap>;
  /** Docente activo y clase activa (`/v1/me`). */
  getMe(): Promise<{ teacher: Teacher; activeClass: SchoolClass }>;
  getClasses(): Promise<SchoolClass[]>;
  /** Alumnos de una clase (la activa en el MVP). */
  getStudents(classId: string): Promise<Student[]>;
  /** Seguimiento agregado del alumno (asistencia, anotaciones y tareas). */
  getStudentProgress(studentId: string): Promise<StudentProgress>;
  /** Boards por clase: 1 request por matriz, sin mezclar otras clases (#76). */
  getAttendanceBoard(classId: string): Promise<AttendanceBoard>;
  getTaskBoard(classId: string): Promise<TaskBoard>;
  /** Anotaciones enriquecidas con datos de presentación del alumno (Opción A #76). */
  getAnnotations(filters?: {
    classId?: string;
    studentId?: string;
    managed?: boolean;
  }): Promise<AnnotationListItem[]>;
  /** Bandeja solicitada; por defecto la entrada. */
  getMails(folder?: MailFolder): Promise<Mail[]>;
  /** Destinatarios disponibles (familias y grupos) con filtro opcional. */
  searchRecipients(query?: string): Promise<MailRecipientRef[]>;

  // Escrituras
  setAttendanceStatus(input: {
    classId: string;
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
  }): Promise<Annotation>;
  setAnnotationManaged(
    annotationId: string,
    managed: boolean,
  ): Promise<Annotation>;
  /** Edición limitada del MVP (Q-014 abierta): solo firstName/lastName. */
  updateStudentName(
    studentId: string,
    patch: { firstName?: string; lastName?: string },
  ): Promise<Student>;
  /** Borrado coherente en cascada aplicado por el backend. */
  deleteStudentCascade(studentId: string): Promise<void>;
  setMailRead(mailId: string, isRead: boolean): Promise<Mail>;
  /** Envío mock del docente; aparece en la carpeta `sent` del backend. */
  sendMail(input: {
    subject: string;
    body: string;
    recipientIds: string[];
  }): Promise<Mail>;
}
