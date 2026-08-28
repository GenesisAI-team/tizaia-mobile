import type {
  Annotation,
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  Mail,
  SchoolDay,
  Student,
} from '../../domain/models.js';

/**
 * Serializadores HTTP: fechas ISO-8601 y sin exponer campos internos.
 * Los DTO son la forma estable de los contratos REST documentados en el README.
 */

export type AttendanceRecordDto = {
  id: string;
  studentId: string;
  date: string;
  status: string;
};

export type AnnotationDto = {
  id: string;
  studentId: string;
  type: string;
  description: string;
  managed: boolean;
  createdAt: string;
};

export type SubmissionDto = {
  id: string;
  assignmentId: string;
  studentId: string;
  status: string;
};

export type MailDto = {
  id: string;
  folder: string;
  senderStudentId: string | null;
  senderLabel: string;
  subject: string;
  body: string;
  preview: string;
  receivedAt: string;
  isRead: boolean;
  recipients: { kind: string; id: string; label: string }[];
};

export const toAttendanceDto = (
  record: AttendanceRecord,
): AttendanceRecordDto => ({
  id: record.id,
  studentId: record.studentId,
  date: record.date,
  status: record.status,
});

export const toAnnotationDto = (annotation: Annotation): AnnotationDto => ({
  id: annotation.id,
  studentId: annotation.studentId,
  type: annotation.type,
  description: annotation.description,
  managed: annotation.managed,
  createdAt: annotation.createdAt.toISOString(),
});

export const toSubmissionDto = (
  submission: AssignmentSubmission,
): SubmissionDto => ({
  id: submission.id,
  assignmentId: submission.assignmentId,
  studentId: submission.studentId,
  status: submission.status,
});

/** Serializa un mail o una lista de mails (fechas ISO-8601). */
export function toMailDto(mail: Mail): MailDto;
export function toMailDto(mails: Mail[]): MailDto[];
export function toMailDto(input: Mail | Mail[]): MailDto | MailDto[] {
  if (Array.isArray(input)) return input.map(serializeMail);
  return serializeMail(input);
}

function serializeMail(mail: Mail): MailDto {
  return {
    id: mail.id,
    folder: mail.folder,
    senderStudentId: mail.senderStudentId,
    senderLabel: mail.senderLabel,
    subject: mail.subject,
    body: mail.body,
    preview: mail.preview,
    receivedAt: mail.receivedAt.toISOString(),
    isRead: mail.isRead,
    recipients: mail.recipients.map((recipient) => ({ ...recipient })),
  };
}

/** Alumno serializado (todos los campos ya son primitivos). */
export const toStudentDto = (student: Student): Student => ({ ...student });

/** Aggregado de asistencia por clase (#76): students + schoolDays + attendance. */
export type AttendanceBoardDto = {
  students: Student[];
  schoolDays: SchoolDay[];
  attendance: AttendanceRecordDto[];
};

export const toAttendanceBoardDto = (board: {
  students: Student[];
  schoolDays: SchoolDay[];
  attendance: AttendanceRecord[];
}): AttendanceBoardDto => ({
  students: board.students.map(toStudentDto),
  schoolDays: board.schoolDays.map((day) => ({ ...day })),
  attendance: board.attendance.map(toAttendanceDto),
});

/** Agregado de tareas por clase (#76): students + assignments + submissions en 1 request. */
export type TaskBoardDto = {
  students: Student[];
  assignments: Assignment[];
  submissions: SubmissionDto[];
};

export const toTaskBoardDto = (board: {
  students: Student[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
}): TaskBoardDto => ({
  students: board.students.map(toStudentDto),
  assignments: board.assignments.map((assignment) => ({ ...assignment })),
  submissions: board.submissions.map(toSubmissionDto),
});

/** Anotación enriquecida para UI (Opción A #76) con datos de presentación del alumno. */
export type AnnotationListItemDto = AnnotationDto & {
  studentName: string;
  studentInitials: string;
};

export const toAnnotationListItemDto = (
  item: Annotation & { studentName: string; studentInitials: string },
): AnnotationListItemDto => ({
  ...toAnnotationDto(item),
  studentName: item.studentName,
  studentInitials: item.studentInitials,
});
