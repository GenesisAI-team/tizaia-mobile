/**
 * Contratos HTTP servidos por el backend #67 (serializados en ISO-8601).
 * Son copias locales de la forma del wire: el móvil no importa modelos del
 * backend; la traducción a dominio ocurre en `mappers.ts`.
 */

export type TeacherDto = {
  id: string;
  name: string;
  email: string;
};

export type SchoolClassDto = {
  id: string;
  groupName: string;
  subject: string;
};

export type StudentDto = {
  id: string;
  classId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  schoolEmail: string;
  description: string | null;
};

export type SchoolDayDto = {
  date: string;
  label: string;
  secondaryLabel: string;
};

export type AttendanceRecordDto = {
  id: string;
  studentId: string;
  date: string;
  status: string;
};

export type AssignmentDto = {
  id: string;
  classId: string;
  title: string;
  dueDate: string;
};

export type SubmissionDto = {
  id: string;
  assignmentId: string;
  studentId: string;
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

export type MailRecipientRefDto = {
  kind: string;
  id: string;
  label: string;
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
  recipients: MailRecipientRefDto[];
};

export type StudentContactDto = {
  id: string;
  studentId: string;
  fullName: string;
  relationship: string;
  email: string;
};

export type BootstrapResponseDto = {
  teacher: TeacherDto;
  activeClassId: string;
  classes: SchoolClassDto[];
  schoolDays: SchoolDayDto[];
  students: StudentDto[];
  attendance: AttendanceRecordDto[];
  assignments: AssignmentDto[];
  submissions: SubmissionDto[];
  annotations: AnnotationDto[];
  mails: MailDto[];
};

export type MeResponseDto = {
  teacher: TeacherDto;
  activeClass?: SchoolClassDto | null;
};

export type StudentProgressResponseDto = {
  student: StudentDto;
  class: SchoolClassDto;
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

export type RecipientDto = {
  kind: string;
  id: string;
  label: string;
};
