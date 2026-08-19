/**
 * Modelos de dominio del centro (MVP demo en memoria).
 * Preparados para sustituirse por el esquema real (Supabase) en hitos
 * posteriores: los identificadores de entidad se mantienen estables.
 */

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
  createdAt: Date;
};

export type Mail = {
  id: string;
  senderStudentId: string;
  subject: string;
  preview: string;
  receivedAt: Date;
  isRead: boolean;
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
