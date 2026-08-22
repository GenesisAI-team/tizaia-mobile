/**
 * Modelos de dominio del backend (API-001). Espejo ampliado de los modelos del
 * móvil (`mobile/src/domain/school/models.ts`): mismos identificadores y
 * relaciones, más los campos mínimos exigidos por la issue #67 (nacimiento,
 * correo educativo, contactos, cuerpo/destinatarios de correo y estado
 * gestionado de anotaciones).
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

export type StudentContact = {
  id: string;
  studentId: string;
  fullName: string;
  relationship: 'madre' | 'padre' | 'tutor legal';
  email: string;
};

export type Student = {
  id: string;
  classId: string;
  firstName: string;
  lastName: string;
  /** Fecha de nacimiento en ISO local `YYYY-MM-DD` (DAT-STU-001). */
  birthDate: string;
  /** Correo educativo (DAT-STU-001). */
  schoolEmail: string;
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
  /** BR-ANOT-002: gestionada (check verde) frente a no gestionada (X roja). */
  managed: boolean;
  createdAt: Date;
};

export type MailFolder = 'inbox' | 'sent';

/** Destinatario de un mail enviado por el docente (`family-<studentId>` / `group-<classId>`). */
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

export const getStudentFullName = (
  student: Pick<Student, 'firstName' | 'lastName'>,
): string => `${student.firstName} ${student.lastName}`;

export const getStudentInitials = (
  student: Pick<Student, 'firstName' | 'lastName'>,
): string =>
  `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
