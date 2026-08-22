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
} from '../../domain/models.js';
import type { SchoolRepository } from '../../domain/schoolRepository.js';
import { createSeedData, type SeedData } from '../../seeds/createSeedData.js';

/**
 * Repositorio en memoria (RFC-001 §6): UNA instancia por proceso, creada al
 * arrancar, inicializada con seeds deterministas. Las mutaciones sobreviven
 * entre peticiones mientras viva el proceso; reiniciar o recrear el contenedor
 * restaura el seed. No soporta varias réplicas (cada una tendría memoria
 * distinta); la persistencia futura será otro adaptador de `SchoolRepository`.
 */
export class MemorySchoolRepository implements SchoolRepository {
  private seed: SeedData;
  private attendanceSeq: number;
  private submissionSeq: number;
  private annotationSeq: number;
  private mailSeq: number;

  public constructor(referenceDate?: Date) {
    this.seed = createSeedData(referenceDate ?? new Date());
    this.attendanceSeq = this.seed.attendance.length;
    this.submissionSeq = this.seed.submissions.length;
    this.annotationSeq = this.seed.annotations.length;
    this.mailSeq = this.seed.mails.length;
  }

  // ---------- Consultas ----------

  public async getTeacher(): Promise<Teacher> {
    return this.seed.teacher;
  }

  public async getActiveClassId(): Promise<string> {
    return this.seed.activeClassId;
  }

  public async getClasses(): Promise<SchoolClass[]> {
    return [...this.seed.classes];
  }

  public async getClass(classId: string): Promise<SchoolClass | undefined> {
    return this.seed.classes.find((schoolClass) => schoolClass.id === classId);
  }

  public async getStudents(classId?: string): Promise<Student[]> {
    return this.seed.students.filter(
      (student) => classId === undefined || student.classId === classId,
    );
  }

  public async getStudent(studentId: string): Promise<Student | undefined> {
    return this.seed.students.find((student) => student.id === studentId);
  }

  public async getContacts(studentId: string): Promise<StudentContact[]> {
    return this.seed.contacts.filter(
      (contact) => contact.studentId === studentId,
    );
  }

  public async getAllContacts(): Promise<StudentContact[]> {
    return [...this.seed.contacts];
  }

  public async getSchoolDays(): Promise<SchoolDay[]> {
    return [...this.seed.schoolDays];
  }

  public async isSchoolDay(date: string): Promise<boolean> {
    return this.seed.schoolDays.some((day) => day.date === date);
  }

  public async getAttendanceForClass(
    classId: string,
  ): Promise<AttendanceRecord[]> {
    const classStudentIds = new Set(
      (await this.getStudents(classId)).map((student) => student.id),
    );
    return this.seed.attendance.filter((record) =>
      classStudentIds.has(record.studentId),
    );
  }

  public async getAttendanceByStudent(
    studentId: string,
  ): Promise<AttendanceRecord[]> {
    return this.seed.attendance.filter(
      (record) => record.studentId === studentId,
    );
  }

  public async getAssignments(classId?: string): Promise<Assignment[]> {
    return this.seed.assignments.filter(
      (assignment) => classId === undefined || assignment.classId === classId,
    );
  }

  public async getAssignment(
    assignmentId: string,
  ): Promise<Assignment | undefined> {
    return this.seed.assignments.find(
      (assignment) => assignment.id === assignmentId,
    );
  }

  public async getSubmissions(
    assignmentId: string,
  ): Promise<AssignmentSubmission[]> {
    return this.seed.submissions.filter(
      (submission) => submission.assignmentId === assignmentId,
    );
  }

  public async getAnnotations(): Promise<Annotation[]> {
    return [...this.seed.annotations];
  }

  public async getAnnotation(
    annotationId: string,
  ): Promise<Annotation | undefined> {
    return this.seed.annotations.find(
      (annotation) => annotation.id === annotationId,
    );
  }

  public async getMails(): Promise<Mail[]> {
    return [...this.seed.mails];
  }

  public async getMail(mailId: string): Promise<Mail | undefined> {
    return this.seed.mails.find((mail) => mail.id === mailId);
  }

  // ---------- Escrituras ----------

  public async upsertAttendanceStatus(input: {
    studentId: string;
    date: string;
    status: AttendanceStatus;
  }): Promise<AttendanceRecord> {
    const existing = this.seed.attendance.find(
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
    this.seed.attendance.push(record);
    return record;
  }

  public async setSubmissionStatus(input: {
    assignmentId: string;
    studentId: string;
    status: SubmissionStatus;
  }): Promise<AssignmentSubmission> {
    const existing = this.seed.submissions.find(
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
    this.seed.submissions.push(submission);
    return submission;
  }

  public async createAnnotation(input: {
    studentId: string;
    type: AnnotationType;
    description: string;
    createdAt?: Date;
  }): Promise<Annotation> {
    const annotation: Annotation = {
      id: `annotation-${this.annotationSeq}`,
      studentId: input.studentId,
      type: input.type,
      description: input.description,
      managed: false,
      createdAt: input.createdAt ?? new Date(),
    };
    this.annotationSeq += 1;
    this.seed.annotations.push(annotation);
    return annotation;
  }

  public async setAnnotationManaged(
    annotationId: string,
    managed: boolean,
  ): Promise<Annotation> {
    const annotation = this.seed.annotations.find(
      (item) => item.id === annotationId,
    );
    if (annotation === undefined) {
      throw new Error(`Anotación inexistente: ${annotationId}`);
    }
    annotation.managed = managed;
    return annotation;
  }

  /**
   * Edición limitada del MVP: solo nombre y apellidos. El resto de campos
   * permanece de lectura hasta resolver Q-014.
   */
  public async updateStudent(
    studentId: string,
    patch: { firstName?: string; lastName?: string },
  ): Promise<Student> {
    const student = this.seed.students.find((item) => item.id === studentId);
    if (student === undefined) {
      throw new Error(`Alumno inexistente: ${studentId}`);
    }
    if (patch.firstName !== undefined) student.firstName = patch.firstName;
    if (patch.lastName !== undefined) student.lastName = patch.lastName;
    return student;
  }

  /** Borrado en cascada: sin relaciones huérfanas. */
  public async deleteStudentCascade(studentId: string): Promise<void> {
    this.seed.students = this.seed.students.filter(
      (student) => student.id !== studentId,
    );
    this.seed.contacts = this.seed.contacts.filter(
      (contact) => contact.studentId !== studentId,
    );
    this.seed.attendance = this.seed.attendance.filter(
      (record) => record.studentId !== studentId,
    );
    this.seed.submissions = this.seed.submissions.filter(
      (submission) => submission.studentId !== studentId,
    );
    this.seed.annotations = this.seed.annotations.filter(
      (annotation) => annotation.studentId !== studentId,
    );
    this.seed.mails = this.seed.mails.filter(
      (mail) => mail.folder !== 'inbox' || mail.senderStudentId !== studentId,
    );
    // Los correos enviados por el docente pueden citar a la familia del alumno
    // borrado: se elimina la referencia para no dejar destinatarios huérfanos.
    for (const mail of this.seed.mails) {
      mail.recipients = mail.recipients.filter(
        (recipient) => recipient.id !== `family-${studentId}`,
      );
    }
  }

  /** Envío mock del docente, persistido en la carpeta `sent` (HU-011). */
  public async createMail(input: {
    subject: string;
    body: string;
    recipients: MailRecipientRef[];
    createdAt?: Date;
  }): Promise<Mail> {
    const body = input.body;
    const mail: Mail = {
      id: `mail-${this.mailSeq}`,
      folder: 'sent',
      senderStudentId: null,
      senderLabel: this.seed.teacher.name,
      subject: input.subject,
      body,
      preview: `${body.slice(0, 60)}${body.length > 60 ? '…' : ''}`,
      receivedAt: input.createdAt ?? new Date(),
      isRead: true,
      recipients: input.recipients.map((recipient) => ({ ...recipient })),
    };
    this.mailSeq += 1;
    this.seed.mails.push(mail);
    return mail;
  }

  public async setMailRead(mailId: string, isRead: boolean): Promise<Mail> {
    const mail = this.seed.mails.find((item) => item.id === mailId);
    if (mail === undefined) {
      throw new Error(`Mail inexistente: ${mailId}`);
    }
    mail.isRead = isRead;
    return mail;
  }

  // ---------- Ciclo de vida ----------

  /** Restaura el seed determinista (POST /v1/dev/reset). */
  public async resetToSeed(referenceDate?: Date): Promise<void> {
    this.seed = createSeedData(referenceDate ?? new Date());
    this.attendanceSeq = this.seed.attendance.length;
    this.submissionSeq = this.seed.submissions.length;
    this.annotationSeq = this.seed.annotations.length;
    this.mailSeq = this.seed.mails.length;
  }
}
