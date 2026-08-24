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
import { createMockSchoolData, type MockSchoolData } from './mockSchoolData';

const DEMO_TEACHER: Teacher = {
  id: 'teacher-1',
  name: 'Laura Martínez',
  email: 'laura@tizaia.es',
};

/**
 * Fake del puerto `SchoolRepository` para tests y desarrollo sin backend.
 * Implementa el mismo contrato asíncrono que `ApiSchoolRepository` con la
 * latencia resuelta inmediatamente; las mutaciones viven en memoria local.
 * No se usa en producción: el composition root inyecta el adaptador HTTP.
 */
export class InMemorySchoolRepository implements SchoolRepository {
  private readonly data: MockSchoolData;
  private readonly activeClassId: string;
  private attendanceSeq: number;
  private submissionSeq: number;
  private annotationSeq: number;
  private mailSeq: number;

  public constructor(referenceDate: Date = new Date()) {
    this.data = createMockSchoolData(referenceDate);
    this.activeClassId = this.data.classes[0]?.id ?? 'class-1';
    this.attendanceSeq = this.data.attendance.length;
    this.submissionSeq = this.data.submissions.length;
    this.annotationSeq = this.data.annotations.length;
    this.mailSeq = this.data.mails.length;
  }

  // ---------- Consultas ----------

  public async getBootstrap(): Promise<SchoolBootstrap> {
    // Paridad con `/v1/bootstrap` (backend #67): el agregado sirve datos de
    // TODO el centro, sin filtrar por clase activa ni carpeta de correo. Las
    // pantallas que solo representan la clase activa seleccionan con
    // `selectActiveClassData`; así el fake no oculta mezclas entre clases.
    return {
      teacher: DEMO_TEACHER,
      activeClassId: this.activeClassId,
      classes: [...this.data.classes],
      schoolDays: [...this.data.schoolDays],
      students: [...this.data.students],
      attendance: [...this.data.attendance],
      assignments: [...this.data.assignments],
      submissions: [...this.data.submissions],
      annotations: [...this.data.annotations],
      mails: [...this.data.mails],
    };
  }

  public async getMe(): Promise<{
    teacher: Teacher;
    activeClass: SchoolClass;
  }> {
    return {
      teacher: DEMO_TEACHER,
      activeClass: this.requireClass(this.activeClassId),
    };
  }

  public async getClasses(): Promise<SchoolClass[]> {
    return [...this.data.classes];
  }

  public async getStudents(classId: string): Promise<Student[]> {
    return this.data.students.filter((student) => student.classId === classId);
  }

  public async getStudentProgress(studentId: string): Promise<StudentProgress> {
    const student = this.requireStudent(studentId);
    const schoolClass = this.requireClass(student.classId);
    const records = this.data.attendance.filter(
      (record) => record.studentId === student.id,
    );
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const annotations = this.data.annotations.filter(
      (annotation) => annotation.studentId === student.id,
    );
    const submissions = this.data.assignments
      .filter((assignment) => assignment.classId === student.classId)
      .flatMap((assignment) =>
        this.data.submissions.filter(
          (submission) =>
            submission.assignmentId === assignment.id &&
            submission.studentId === student.id,
        ),
      );

    return {
      student,
      class: schoolClass,
      attendance: {
        totalDays: records.length,
        present,
        absent,
        late,
        attendanceRate:
          records.length === 0
            ? 0
            : Math.round(((records.length - absent) / records.length) * 100),
      },
      annotations: {
        positive: annotations.filter((a) => a.type === 'positive').length,
        contrary: annotations.filter((a) => a.type === 'contrary').length,
        aggravating: annotations.filter((a) => a.type === 'aggravating').length,
        unmanaged: annotations.filter((a) => !a.managed).length,
      },
      tasks: {
        total: submissions.length,
        submitted: submissions.filter((s) => s.status === 'submitted').length,
        notSubmitted: submissions.filter((s) => s.status === 'notSubmitted')
          .length,
        pending: submissions.filter((s) => s.status === 'pending').length,
      },
    };
  }

  public async getAnnotations(): Promise<Annotation[]> {
    return [...this.data.annotations];
  }

  public async getMails(folder?: MailFolder): Promise<Mail[]> {
    const target = folder ?? 'inbox';
    return this.data.mails.filter((mail) => mail.folder === target);
  }

  public async searchRecipients(query?: string): Promise<MailRecipientRef[]> {
    const normalizedQuery = query?.trim().toLowerCase();
    const matches = (label: string): boolean =>
      normalizedQuery === undefined ||
      normalizedQuery.length === 0 ||
      label.toLowerCase().includes(normalizedQuery);

    const families: MailRecipientRef[] = [];
    for (const student of this.data.students) {
      families.push({
        kind: 'family',
        id: `family-${student.id}`,
        label: `Familia de ${student.firstName}`,
      });
    }
    const groups: MailRecipientRef[] = this.data.classes.map((schoolClass) => ({
      kind: 'group' as const,
      id: `group-${schoolClass.id}`,
      label: schoolClass.groupName,
    }));
    return [...families, ...groups].filter((recipient) =>
      matches(recipient.label),
    );
  }

  // ---------- Escrituras ----------

  public async setAttendanceStatus(input: {
    classId: string;
    studentId: string;
    date: string;
    status: AttendanceStatus;
  }): Promise<AttendanceRecord> {
    const existing = this.data.attendance.find(
      (record) =>
        record.studentId === input.studentId && record.date === input.date,
    );
    if (existing !== undefined) {
      existing.status = input.status;
      return existing;
    }
    const record: AttendanceRecord = {
      id: `attendance-${this.attendanceSeq}`,
      studentId: input.studentId,
      date: input.date,
      status: input.status,
    };
    this.attendanceSeq += 1;
    this.data.attendance.push(record);
    return record;
  }

  public async setSubmissionStatus(input: {
    assignmentId: string;
    studentId: string;
    status: SubmissionStatus;
  }): Promise<AssignmentSubmission> {
    const existing = this.data.submissions.find(
      (submission) =>
        submission.assignmentId === input.assignmentId &&
        submission.studentId === input.studentId,
    );
    if (existing !== undefined) {
      existing.status = input.status;
      return existing;
    }
    const submission: AssignmentSubmission = {
      id: `submission-${this.submissionSeq}`,
      assignmentId: input.assignmentId,
      studentId: input.studentId,
      status: input.status,
    };
    this.submissionSeq += 1;
    this.data.submissions.push(submission);
    return submission;
  }

  public async createAnnotation(input: {
    studentId: string;
    type: AnnotationType;
    description: string;
  }): Promise<Annotation> {
    if (!this.data.students.some((student) => student.id === input.studentId)) {
      throw new Error(`Alumno inexistente: ${input.studentId}`);
    }
    const annotation: Annotation = {
      id: `annotation-${this.annotationSeq}`,
      studentId: input.studentId,
      type: input.type,
      description: input.description,
      managed: false,
      createdAt: new Date(),
    };
    this.annotationSeq += 1;
    this.data.annotations.push(annotation);
    return annotation;
  }

  public async setAnnotationManaged(
    annotationId: string,
    managed: boolean,
  ): Promise<Annotation> {
    const annotation = this.data.annotations.find(
      (item) => item.id === annotationId,
    );
    if (annotation === undefined) {
      throw new Error(`Anotación inexistente: ${annotationId}`);
    }
    annotation.managed = managed;
    return annotation;
  }

  public async updateStudentName(
    studentId: string,
    patch: { firstName?: string; lastName?: string },
  ): Promise<Student> {
    const student = this.requireStudent(studentId);
    if (patch.firstName !== undefined) student.firstName = patch.firstName;
    if (patch.lastName !== undefined) student.lastName = patch.lastName;
    return student;
  }

  public async deleteStudentCascade(studentId: string): Promise<void> {
    this.data.students = this.data.students.filter(
      (student) => student.id !== studentId,
    );
    this.data.attendance = this.data.attendance.filter(
      (record) => record.studentId !== studentId,
    );
    this.data.submissions = this.data.submissions.filter(
      (submission) => submission.studentId !== studentId,
    );
    this.data.annotations = this.data.annotations.filter(
      (annotation) => annotation.studentId !== studentId,
    );
    for (const mail of this.data.mails) {
      mail.recipients = mail.recipients.filter(
        (recipient) => recipient.id !== `family-${studentId}`,
      );
    }
  }

  public async setMailRead(mailId: string, isRead: boolean): Promise<Mail> {
    const mail = this.data.mails.find((item) => item.id === mailId);
    if (mail === undefined) {
      throw new Error(`Mail inexistente: ${mailId}`);
    }
    mail.isRead = isRead;
    return mail;
  }

  public async sendMail(input: {
    subject: string;
    body: string;
    recipientIds: string[];
  }): Promise<Mail> {
    const recipients: MailRecipientRef[] = [];
    for (const recipientId of input.recipientIds) {
      if (recipientId.startsWith('family-')) {
        const student = this.data.students.find(
          (item) => item.id === recipientId.replace('family-', ''),
        );
        if (student === undefined) continue;
        recipients.push({
          kind: 'family',
          id: recipientId,
          label: `Familia de ${student.firstName}`,
        });
      } else if (recipientId.startsWith('group-')) {
        const schoolClass = this.data.classes.find(
          (item) => item.id === recipientId.replace('group-', ''),
        );
        if (schoolClass === undefined) continue;
        recipients.push({
          kind: 'group',
          id: recipientId,
          label: schoolClass.groupName,
        });
      }
    }
    if (recipients.length === 0) {
      throw new Error('Indica al menos un destinatario válido');
    }
    const body = input.body;
    const mail: Mail = {
      id: `mail-${this.mailSeq}`,
      folder: 'sent',
      senderStudentId: null,
      senderLabel: DEMO_TEACHER.name,
      subject: input.subject,
      body,
      preview: `${body.slice(0, 60)}${body.length > 60 ? '…' : ''}`,
      receivedAt: new Date(),
      isRead: true,
      recipients,
    };
    this.mailSeq += 1;
    this.data.mails.push(mail);
    return mail;
  }

  // ---------- Ayudas privadas ----------

  private requireClass(classId: string): SchoolClass {
    const schoolClass = this.data.classes.find((item) => item.id === classId);
    if (schoolClass === undefined) {
      throw new Error(`Clase inexistente: ${classId}`);
    }
    return schoolClass;
  }

  private requireStudent(studentId: string): Student {
    const student = this.data.students.find((item) => item.id === studentId);
    if (student === undefined) {
      throw new Error(`Alumno inexistente: ${studentId}`);
    }
    return student;
  }
}
