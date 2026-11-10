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
} from '../domain/models.js';
import type { SchoolRepository } from '../domain/schoolRepository.js';

/**
 * Decorador de test/benchmark que cuenta las llamadas a `SchoolRepository`
 * sin cambiar el contrato de dominio (issue #104). Sirve para detectar
 * patrones N+1 ocultos por el almacén en memoria (v. #74): con Supabase, una
 * ruta con `getX` repetida por fila sería cara aunque hoy sea instantánea.
 *
 * Es SOLO de test/benchmark (vive en `src/test/`, excluido del build de
 * producción): no se introduce en el proceso real porque ahí no aporta valor.
 */
export class CountingSchoolRepository implements SchoolRepository {
  private readonly counts: Record<string, number> = {};
  private inner: SchoolRepository;

  public constructor(inner: SchoolRepository) {
    this.inner = inner;
  }

  /** Copia del mapa de operaciones → llamadas acumuladas. */
  public getCounts(): Readonly<Record<string, number>> {
    return { ...this.counts };
  }

  /** Cuenta una operación y delega en el repositorio interno. */
  private count<K extends keyof SchoolRepository>(key: K): void {
    this.counts[key] = (this.counts[key] ?? 0) + 1;
  }

  // ---------- Consultas ----------
  public getTeacher(): Promise<Teacher> {
    this.count('getTeacher');
    return this.inner.getTeacher();
  }
  public getActiveClassId(): Promise<string> {
    this.count('getActiveClassId');
    return this.inner.getActiveClassId();
  }
  public getClasses(): Promise<SchoolClass[]> {
    this.count('getClasses');
    return this.inner.getClasses();
  }
  public getClass(classId: string): Promise<SchoolClass | undefined> {
    this.count('getClass');
    return this.inner.getClass(classId);
  }
  public getStudents(classId?: string): Promise<Student[]> {
    this.count('getStudents');
    return this.inner.getStudents(classId);
  }
  public getStudent(studentId: string): Promise<Student | undefined> {
    this.count('getStudent');
    return this.inner.getStudent(studentId);
  }
  public getContacts(studentId: string): Promise<StudentContact[]> {
    this.count('getContacts');
    return this.inner.getContacts(studentId);
  }
  public getAllContacts(): Promise<StudentContact[]> {
    this.count('getAllContacts');
    return this.inner.getAllContacts();
  }
  public getSchoolDays(): Promise<SchoolDay[]> {
    this.count('getSchoolDays');
    return this.inner.getSchoolDays();
  }
  public isSchoolDay(date: string): Promise<boolean> {
    this.count('isSchoolDay');
    return this.inner.isSchoolDay(date);
  }
  public getAttendanceForClass(classId: string): Promise<AttendanceRecord[]> {
    this.count('getAttendanceForClass');
    return this.inner.getAttendanceForClass(classId);
  }
  public getAttendanceByStudent(
    studentId: string,
  ): Promise<AttendanceRecord[]> {
    this.count('getAttendanceByStudent');
    return this.inner.getAttendanceByStudent(studentId);
  }
  public getAssignments(classId?: string): Promise<Assignment[]> {
    this.count('getAssignments');
    return this.inner.getAssignments(classId);
  }
  public getAssignment(assignmentId: string): Promise<Assignment | undefined> {
    this.count('getAssignment');
    return this.inner.getAssignment(assignmentId);
  }
  public getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    this.count('getSubmissions');
    return this.inner.getSubmissions(assignmentId);
  }
  public getAnnotations(): Promise<Annotation[]> {
    this.count('getAnnotations');
    return this.inner.getAnnotations();
  }
  public getAnnotation(annotationId: string): Promise<Annotation | undefined> {
    this.count('getAnnotation');
    return this.inner.getAnnotation(annotationId);
  }
  public getMails(): Promise<Mail[]> {
    this.count('getMails');
    return this.inner.getMails();
  }
  public getMail(mailId: string): Promise<Mail | undefined> {
    this.count('getMail');
    return this.inner.getMail(mailId);
  }

  // ---------- Escrituras ----------
  public upsertAttendanceStatus(input: {
    studentId: string;
    date: string;
    status: AttendanceStatus;
  }): Promise<AttendanceRecord> {
    this.count('upsertAttendanceStatus');
    return this.inner.upsertAttendanceStatus(input);
  }
  public setSubmissionStatus(input: {
    assignmentId: string;
    studentId: string;
    status: SubmissionStatus;
  }): Promise<AssignmentSubmission> {
    this.count('setSubmissionStatus');
    return this.inner.setSubmissionStatus(input);
  }
  public createAnnotation(input: {
    studentId: string;
    type: AnnotationType;
    description: string;
    createdAt?: Date;
  }): Promise<Annotation> {
    this.count('createAnnotation');
    return this.inner.createAnnotation(input);
  }
  public setAnnotationManaged(
    annotationId: string,
    managed: boolean,
  ): Promise<Annotation> {
    this.count('setAnnotationManaged');
    return this.inner.setAnnotationManaged(annotationId, managed);
  }
  public updateStudent(
    studentId: string,
    patch: { firstName?: string; lastName?: string },
  ): Promise<Student> {
    this.count('updateStudent');
    return this.inner.updateStudent(studentId, patch);
  }
  public deleteStudentCascade(studentId: string): Promise<void> {
    this.count('deleteStudentCascade');
    return this.inner.deleteStudentCascade(studentId);
  }
  public createMail(input: {
    subject: string;
    body: string;
    recipients: MailRecipientRef[];
    createdAt?: Date;
  }): Promise<Mail> {
    this.count('createMail');
    return this.inner.createMail(input);
  }
  public setMailRead(mailId: string, isRead: boolean): Promise<Mail> {
    this.count('setMailRead');
    return this.inner.setMailRead(mailId, isRead);
  }

  // ---------- Ciclo de vida ----------
  public resetToSeed(referenceDate?: Date): Promise<void> {
    this.count('resetToSeed');
    return this.inner.resetToSeed(referenceDate);
  }
}
