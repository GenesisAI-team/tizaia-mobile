import type {
  Annotation,
  AnnotationListItem,
  AnnotationType,
  Assignment,
  AssignmentSubmission,
  AttendanceBoard,
  AttendanceRecord,
  AttendanceStatus,
  Mail,
  MailFolder,
  MailRecipientRef,
  SchoolBootstrap,
  SchoolClass,
  SchoolDay,
  Student,
  StudentProgress,
  SubmissionStatus,
  TaskBoard,
  Teacher,
} from '../../domain/school/models';
import type {
  AnnotationDto,
  AnnotationListItemDto,
  AssignmentDto,
  AttendanceBoardResponseDto,
  AttendanceRecordDto,
  BootstrapResponseDto,
  MailDto,
  MeResponseDto,
  RecipientDto,
  SchoolClassDto,
  SchoolDayDto,
  StudentDto,
  StudentProgressResponseDto,
  SubmissionDto,
  TaskBoardResponseDto,
  TeacherDto,
} from './contracts';

/**
 * Traducción DTO HTTP → modelo de dominio. Las fechas ISO se parsean a `Date`
 * y los literales de unión se validan para no propagar basura de red al resto
 * de la app.
 */

export const toTeacher = (dto: TeacherDto): Teacher => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
});

export const toSchoolClass = (dto: SchoolClassDto): SchoolClass => ({
  id: dto.id,
  groupName: dto.groupName,
  subject: dto.subject,
});

export const toStudent = (dto: StudentDto): Student => ({
  id: dto.id,
  classId: dto.classId,
  firstName: dto.firstName,
  lastName: dto.lastName,
  // El backend añade birthDate/schoolEmail (#67); el MVP móvil no los usa.
  description: dto.description,
});

export const toSchoolDay = (dto: SchoolDayDto): SchoolDay => ({
  date: dto.date,
  label: dto.label,
  secondaryLabel: dto.secondaryLabel,
});

const ATTENDANCE_STATUSES: readonly AttendanceStatus[] = [
  'present',
  'absent',
  'late',
];

const assertAttendanceStatus = (value: string): AttendanceStatus => {
  if ((ATTENDANCE_STATUSES as readonly string[]).includes(value)) {
    return value as AttendanceStatus;
  }
  throw new Error(`Estado de asistencia desconocido: ${value}`);
};

export const toAttendanceRecord = (
  dto: AttendanceRecordDto,
): AttendanceRecord => ({
  id: dto.id,
  studentId: dto.studentId,
  date: dto.date,
  status: assertAttendanceStatus(dto.status),
});

export const toAssignment = (dto: AssignmentDto): Assignment => ({
  id: dto.id,
  classId: dto.classId,
  title: dto.title,
  dueDate: dto.dueDate,
});

const SUBMISSION_STATUSES: readonly SubmissionStatus[] = [
  'submitted',
  'notSubmitted',
  'pending',
];

const assertSubmissionStatus = (value: string): SubmissionStatus => {
  if ((SUBMISSION_STATUSES as readonly string[]).includes(value)) {
    return value as SubmissionStatus;
  }
  throw new Error(`Estado de entrega desconocido: ${value}`);
};

export const toAssignmentSubmission = (
  dto: SubmissionDto,
): AssignmentSubmission => ({
  id: dto.id,
  assignmentId: dto.assignmentId,
  studentId: dto.studentId,
  status: assertSubmissionStatus(dto.status),
});

const ANNOTATION_TYPES: readonly AnnotationType[] = [
  'positive',
  'contrary',
  'aggravating',
];

const assertAnnotationType = (value: string): AnnotationType => {
  if ((ANNOTATION_TYPES as readonly string[]).includes(value)) {
    return value as AnnotationType;
  }
  throw new Error(`Tipo de anotación desconocido: ${value}`);
};

export const toAnnotation = (dto: AnnotationDto): Annotation => ({
  id: dto.id,
  studentId: dto.studentId,
  type: assertAnnotationType(dto.type),
  description: dto.description,
  managed: dto.managed,
  createdAt: new Date(dto.createdAt),
});

const MAIL_FOLDERS: readonly MailFolder[] = ['inbox', 'sent'];

const toMailFolder = (value: string): MailFolder => {
  if ((MAIL_FOLDERS as readonly string[]).includes(value)) {
    return value as MailFolder;
  }
  return 'inbox';
};

const toMailRecipient = (dto: RecipientDto): MailRecipientRef => ({
  kind: dto.kind === 'group' ? 'group' : 'family',
  id: dto.id,
  label: dto.label,
});

export const toMail = (dto: MailDto): Mail => ({
  id: dto.id,
  folder: toMailFolder(dto.folder),
  senderStudentId: dto.senderStudentId,
  senderLabel: dto.senderLabel,
  subject: dto.subject,
  body: dto.body,
  preview: dto.preview,
  receivedAt: new Date(dto.receivedAt),
  isRead: dto.isRead,
  recipients: dto.recipients.map(toMailRecipient),
});

export const toMailRecipientRef = (dto: RecipientDto): MailRecipientRef =>
  toMailRecipient(dto);

export const toStudentProgress = (
  dto: StudentProgressResponseDto,
): StudentProgress => ({
  student: toStudent(dto.student),
  class: toSchoolClass(dto.class),
  attendance: { ...dto.attendance },
  annotations: { ...dto.annotations },
  tasks: { ...dto.tasks },
});

export const toSchoolBootstrap = (
  dto: BootstrapResponseDto,
): SchoolBootstrap => ({
  teacher: toTeacher(dto.teacher),
  activeClassId: dto.activeClassId,
  classes: dto.classes.map(toSchoolClass),
});

export const toAttendanceBoard = (
  dto: AttendanceBoardResponseDto,
): AttendanceBoard => ({
  students: dto.students.map(toStudent),
  schoolDays: dto.schoolDays.map(toSchoolDay),
  attendance: dto.attendance.map(toAttendanceRecord),
});

export const toTaskBoard = (dto: TaskBoardResponseDto): TaskBoard => ({
  students: dto.students.map(toStudent),
  assignments: dto.assignments.map(toAssignment),
  submissions: dto.submissions.map(toAssignmentSubmission),
});

export const toAnnotationListItem = (
  dto: AnnotationListItemDto,
): AnnotationListItem => ({
  id: dto.id,
  studentId: dto.studentId,
  studentName: dto.studentName,
  studentInitials: dto.studentInitials,
  type: assertAnnotationType(dto.type),
  description: dto.description,
  managed: dto.managed,
  createdAt: new Date(dto.createdAt),
});

/** `/v1/me`: docente activo y clase activa. La clase debe existir siempre. */
export const toMe = (
  dto: MeResponseDto,
): { teacher: Teacher; activeClass: SchoolClass } => {
  if (dto.activeClass == null) {
    throw new Error('El backend no devolvió clase activa');
  }
  return {
    teacher: toTeacher(dto.teacher),
    activeClass: toSchoolClass(dto.activeClass),
  };
};
