import type {
  Annotation,
  AnnotationType,
  AssignmentSubmission,
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
  Teacher,
} from '../../domain/school/models';
import type { SchoolRepository } from '../../domain/school/schoolRepository';
import type { ApiClient } from './apiClient';
import type {
  AnnotationDto,
  AttendanceRecordDto,
  BootstrapResponseDto,
  MailDto,
  MeResponseDto,
  RecipientDto,
  SchoolClassDto,
  StudentDto,
  StudentProgressResponseDto,
  SubmissionDto,
} from './contracts';
import {
  toAnnotation,
  toAssignmentSubmission,
  toAttendanceRecord,
  toMail,
  toMailRecipientRef,
  toMe,
  toSchoolBootstrap,
  toSchoolClass,
  toStudent,
  toStudentProgress,
} from './mappers';

/**
 * Adaptador remoto del puerto `SchoolRepository` sobre la API en memoria
 * (#67). Traduce rutas REST `/v1` a operaciones de dominio; las pantallas no
 * conocen HTTP (MOB-API-001). En hitos posteriores se sustituye por un
 * adaptador Supabase sin tocar la UI (RFC-001 §9).
 */
export class ApiSchoolRepository implements SchoolRepository {
  private readonly client: ApiClient;

  public constructor(client: ApiClient) {
    this.client = client;
  }

  // ---------- Consultas ----------

  public async getBootstrap(): Promise<SchoolBootstrap> {
    const dto = await this.client.get<BootstrapResponseDto>('/v1/bootstrap');
    return toSchoolBootstrap(dto);
  }

  public async getMe(): Promise<{
    teacher: Teacher;
    activeClass: SchoolClass;
  }> {
    const dto = await this.client.get<MeResponseDto>('/v1/me');
    return toMe(dto);
  }

  public async getClasses(): Promise<SchoolClass[]> {
    const dtos = await this.client.get<SchoolClassDto[]>('/v1/classes');
    return dtos.map(toSchoolClass);
  }

  public async getStudents(classId: string): Promise<Student[]> {
    const dtos = await this.client.get<StudentDto[]>(
      `/v1/classes/${encodeURIComponent(classId)}/students`,
    );
    return dtos.map(toStudent);
  }

  public async getStudentProgress(studentId: string): Promise<StudentProgress> {
    const dto = await this.client.get<StudentProgressResponseDto>(
      `/v1/students/${encodeURIComponent(studentId)}/progress`,
    );
    return toStudentProgress(dto);
  }

  public async getAnnotations(): Promise<Annotation[]> {
    const dtos = await this.client.get<AnnotationDto[]>('/v1/annotations');
    return dtos.map(toAnnotation);
  }

  public async getMails(folder?: MailFolder): Promise<Mail[]> {
    // El backend sirve la entrada por defecto; `sent` llega por query.
    const path =
      folder === undefined || folder === 'inbox'
        ? '/v1/mails'
        : '/v1/mails?folder=sent';
    const dtos = await this.client.get<MailDto[]>(path);
    return dtos.map(toMail);
  }

  public async searchRecipients(query?: string): Promise<MailRecipientRef[]> {
    const path =
      query === undefined || query.trim().length === 0
        ? '/v1/mail-recipients'
        : `/v1/mail-recipients?query=${encodeURIComponent(query)}`;
    const dtos = await this.client.get<RecipientDto[]>(path);
    return dtos.map(toMailRecipientRef);
  }

  // ---------- Escrituras ----------

  public async setAttendanceStatus(input: {
    classId: string;
    studentId: string;
    date: string;
    status: AttendanceStatus;
  }): Promise<AttendanceRecord> {
    const { classId, studentId, date, status } = input;
    const dto = await this.client.put<
      { status: AttendanceStatus },
      AttendanceRecordDto
    >(
      `/v1/attendance/${encodeURIComponent(classId)}/${encodeURIComponent(
        studentId,
      )}/${encodeURIComponent(date)}`,
      { status },
    );
    return toAttendanceRecord(dto);
  }

  public async setSubmissionStatus(input: {
    assignmentId: string;
    studentId: string;
    status: SubmissionStatus;
  }): Promise<AssignmentSubmission> {
    const { assignmentId, studentId, status } = input;
    const dto = await this.client.put<
      { status: SubmissionStatus },
      SubmissionDto
    >(
      `/v1/assignments/${encodeURIComponent(
        assignmentId,
      )}/submissions/${encodeURIComponent(studentId)}`,
      { status },
    );
    return toAssignmentSubmission(dto);
  }

  public async createAnnotation(input: {
    studentId: string;
    type: AnnotationType;
    description: string;
  }): Promise<Annotation> {
    const dto = await this.client.post<
      { studentId: string; type: AnnotationType; description: string },
      AnnotationDto
    >('/v1/annotations', input);
    return toAnnotation(dto);
  }

  public async setAnnotationManaged(
    annotationId: string,
    managed: boolean,
  ): Promise<Annotation> {
    const dto = await this.client.patch<{ managed: boolean }, AnnotationDto>(
      `/v1/annotations/${encodeURIComponent(annotationId)}/managed`,
      { managed },
    );
    return toAnnotation(dto);
  }

  public async updateStudentName(
    studentId: string,
    patch: { firstName?: string; lastName?: string },
  ): Promise<Student> {
    const hasFields =
      patch.firstName !== undefined || patch.lastName !== undefined;
    if (!hasFields) {
      throw new Error('Indica al menos un campo editable');
    }
    const dto = await this.client.patch<typeof patch, StudentDto>(
      `/v1/students/${encodeURIComponent(studentId)}`,
      patch,
    );
    return toStudent(dto);
  }

  public async deleteStudentCascade(studentId: string): Promise<void> {
    await this.client.delete(`/v1/students/${encodeURIComponent(studentId)}`);
  }

  public async setMailRead(mailId: string, isRead: boolean): Promise<Mail> {
    const dto = await this.client.patch<{ isRead: boolean }, MailDto>(
      `/v1/mails/${encodeURIComponent(mailId)}/read`,
      { isRead },
    );
    return toMail(dto);
  }

  public async sendMail(input: {
    subject: string;
    body: string;
    recipientIds: string[];
  }): Promise<Mail> {
    const dto = await this.client.post<
      { subject: string; body: string; recipientIds: string[] },
      MailDto
    >('/v1/mails', input);
    return toMail(dto);
  }
}
