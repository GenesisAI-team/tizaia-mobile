/**
 * Modelos de dominio del centro (MVP demo en memoria).
 * Preparados para sustituirse por el esquema real (Supabase) en hitos
 * posteriores: los identificadores de entidad se mantienen estables.
 */

export type Teacher = {
  id: string;
  name: string;
  email: string;
};

export type SchoolClass = {
  id: string;
  groupName: string;
  subject: string;
};

export type Student = {
  id: string;
  classId: string;
  firstName: string;
  lastName: string;
  /** Descripción de actitud/participación; ausente en ~1 de cada 3 alumnos. */
  description: string | null;
};

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type AttendanceRecord = {
  id: string;
  studentId: string;
  /** Día lectivo en formato ISO local `YYYY-MM-DD`. */
  date: string;
  status: AttendanceStatus;
};

export type Assignment = {
  id: string;
  classId: string;
  title: string;
  /** Día lectivo en formato ISO local `YYYY-MM-DD`. */
  dueDate: string;
};

export type SubmissionStatus = 'submitted' | 'notSubmitted' | 'pending';

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
};

export type AnnotationType = 'contrary' | 'aggravating' | 'positive';

export type Annotation = {
  id: string;
  studentId: string;
  type: AnnotationType;
  description: string;
  /** BR-ANOT-002: gestionada (check verde) frente a no gestionada. */
  managed: boolean;
  createdAt: Date;
};

export type MailFolder = 'inbox' | 'sent';

/** Destinatario de un mail enviado por el docente (HU-011 demo). */
export type MailRecipientRef = {
  kind: 'family' | 'group';
  id: string;
  label: string;
};

export type Mail = {
  id: string;
  folder: MailFolder;
  /** Alumno remitente en la bandeja de entrada; `null` si lo envió el docente. */
  senderStudentId: string | null;
  /** Etiqueta de remitente servida por el backend. */
  senderLabel: string;
  subject: string;
  body: string;
  preview: string;
  receivedAt: Date;
  isRead: boolean;
  recipients: MailRecipientRef[];
};

/** Día lectivo con etiquetas de presentación (`Mié` / `19/08`). */
export type SchoolDay = {
  /** Fecha ISO local `YYYY-MM-DD`. */
  date: string;
  label: string;
  secondaryLabel: string;
};

/**
 * Agregado de seguimiento servido por `/v1/students/:studentId/progress`.
 * Mismo contrato que el backend (RFC-001 §5.1).
 */
export type StudentProgress = {
  student: Student;
  class: SchoolClass;
  attendance: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    attendanceRate: number;
  };
  annotations: {
    positive: number;
    contrary: number;
    aggravating: number;
    unmanaged: number;
  };
  tasks: {
    total: number;
    submitted: number;
    notSubmitted: number;
    pending: number;
  };
};

/** Grafo común servido por `/v1/bootstrap` para hidratar el móvil. */
export type SchoolBootstrap = {
  teacher: Teacher;
  activeClassId: string;
  classes: SchoolClass[];
  schoolDays: SchoolDay[];
  students: Student[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  annotations: Annotation[];
  mails: Mail[];
};

export const getStudentFullName = (
  student: Pick<Student, 'firstName' | 'lastName'>,
): string => `${student.firstName} ${student.lastName}`;

export const getStudentInitials = (
  student: Pick<Student, 'firstName' | 'lastName'>,
): string =>
  `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();

/** Iniciales de un nombre completo de persona (docente, contacto…). */
export const getNameInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
