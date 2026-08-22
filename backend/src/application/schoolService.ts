import type {
  Annotation,
  AnnotationType,
  AssignmentSubmission,
  AttendanceRecord,
  AttendanceStatus,
  MailRecipientRef,
  SchoolClass,
  Student,
  SubmissionStatus,
} from '../domain/models.js';
import type { SchoolRepository } from '../domain/schoolRepository.js';
import { NotFoundError, NonSchoolDayError, ValidationError } from './errors.js';
import { toIsoDate } from '../seeds/schoolDates.js';

/**
 * Casos de uso y consultas del centro. Orquestan validaciones de negocio sobre
 * el puerto `SchoolRepository`; ni Express ni las rutas acceden al store.
 * Las herramientas del futuro asistente reutilizarán estos mismos servicios
 * (RFC-001 §5.1).
 */
export class SchoolService {
  public constructor(private readonly repository: SchoolRepository) {}

  // ---------- Sistema y bootstrap ----------

  public async getBootstrap(): Promise<Record<string, unknown>> {
    const repository = this.repository;
    const classes = await repository.getClasses();
    const assignments = await repository.getAssignments();
    const attendance: AttendanceRecord[] = [];
    for (const schoolClass of classes) {
      attendance.push(
        ...(await repository.getAttendanceForClass(schoolClass.id)),
      );
    }
    const submissions: AssignmentSubmission[] = [];
    for (const assignment of assignments) {
      submissions.push(...(await repository.getSubmissions(assignment.id)));
    }
    return {
      teacher: await repository.getTeacher(),
      activeClassId: await repository.getActiveClassId(),
      classes,
      schoolDays: await repository.getSchoolDays(),
      students: await repository.getStudents(),
      contacts: await repository.getAllContacts(),
      attendance,
      assignments,
      submissions,
      annotations: await repository.getAnnotations(),
      mails: await repository.getMails(),
    };
  }

  public async me(): Promise<{
    teacher: unknown;
    activeClass: SchoolClass | undefined;
  }> {
    const teacher = await this.repository.getTeacher();
    const activeClassId = await this.repository.getActiveClassId();
    return {
      teacher,
      activeClass: await this.repository.getClass(activeClassId),
    };
  }

  /** Reinicia el almacén al seed determinista (solo con ENABLE_DEV_RESET). */
  public async resetStore(): Promise<void> {
    await this.repository.resetToSeed(new Date());
  }

  // ---------- Clases ----------

  public async listClasses(): Promise<SchoolClass[]> {
    return this.repository.getClasses();
  }

  public async getClass(classId: string): Promise<SchoolClass> {
    return this.requireClass(classId);
  }

  public async getClassSummary(
    classId: string,
  ): Promise<Record<string, unknown>> {
    const schoolClass = await this.requireClass(classId);
    const students = await this.repository.getStudents(classId);
    const referenceDay = await this.referenceSchoolDay();
    const classAttendance =
      await this.repository.getAttendanceForClass(classId);
    const recordsToday = classAttendance.filter(
      (record) => record.date === referenceDay.date,
    );
    const countByStatus = (status: AttendanceStatus): number =>
      recordsToday.filter((record) => record.status === status).length;
    const unmanagedAnnotations: Annotation[] = [];
    for (const annotation of await this.repository.getAnnotations()) {
      const student = await this.repository.getStudent(annotation.studentId);
      if (student?.classId === classId && annotation.managed === false) {
        unmanagedAnnotations.push(annotation);
      }
    }

    return {
      class: schoolClass,
      totalStudents: students.length,
      referenceDay: referenceDay.date,
      attendanceToday: {
        present: countByStatus('present'),
        absent: countByStatus('absent'),
        late: countByStatus('late'),
        unrecorded: students.length - recordsToday.length,
      },
      assignmentsTotal: (await this.repository.getAssignments(classId)).length,
      annotationsUnmanaged: unmanagedAnnotations.length,
    };
  }

  // ---------- Alumnado ----------

  public async listStudents(classId?: string): Promise<Student[]> {
    if (classId !== undefined) {
      await this.requireClass(classId);
      return this.repository.getStudents(classId);
    }
    return this.repository.getStudents();
  }

  public async getStudentDetail(
    studentId: string,
  ): Promise<Record<string, unknown>> {
    const student = await this.requireStudent(studentId);
    return {
      student,
      contacts: await this.repository.getContacts(student.id),
    };
  }

  public async getStudentProgress(
    studentId: string,
  ): Promise<Record<string, unknown>> {
    const student = await this.requireStudent(studentId);
    const attendanceRecords = await this.repository.getAttendanceByStudent(
      student.id,
    );
    const present = attendanceRecords.filter(
      (record) => record.status === 'present',
    ).length;
    const absent = attendanceRecords.filter(
      (record) => record.status === 'absent',
    ).length;
    const late = attendanceRecords.filter(
      (record) => record.status === 'late',
    ).length;
    const totalDays = attendanceRecords.length;

    const annotations = (await this.repository.getAnnotations()).filter(
      (annotation) => annotation.studentId === student.id,
    );
    const countAnnotations = (type: AnnotationType): number =>
      annotations.filter((annotation) => annotation.type === type).length;

    const submissions: AssignmentSubmission[] = [];
    for (const assignment of await this.repository.getAssignments(
      student.classId,
    )) {
      const assignmentSubmissions = await this.repository.getSubmissions(
        assignment.id,
      );
      submissions.push(
        ...assignmentSubmissions.filter(
          (submission) => submission.studentId === student.id,
        ),
      );
    }

    return {
      student,
      class: await this.requireClass(student.classId),
      attendance: {
        totalDays,
        present,
        absent,
        late,
        attendanceRate:
          totalDays === 0
            ? 0
            : Math.round(((totalDays - absent) / totalDays) * 100),
      },
      annotations: {
        positive: countAnnotations('positive'),
        contrary: countAnnotations('contrary'),
        aggravating: countAnnotations('aggravating'),
        unmanaged: annotations.filter((annotation) => !annotation.managed)
          .length,
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

  /**
   * Edición limitada del MVP (Q-014 abierta): solo firstName/lastName.
   */
  public async updateStudent(
    studentId: string,
    patch: { firstName?: string; lastName?: string },
  ): Promise<Student> {
    await this.requireStudent(studentId);
    return this.repository.updateStudent(studentId, patch);
  }

  /** Borrado coherente: el repositorio aplica la cascada completa. */
  public async deleteStudent(studentId: string): Promise<void> {
    await this.requireStudent(studentId);
    await this.repository.deleteStudentCascade(studentId);
  }

  // ---------- Asistencia ----------

  public async listClassAttendance(
    classId: string,
    from?: string,
    to?: string,
  ): ReturnType<SchoolRepository['getAttendanceForClass']> {
    await this.requireClass(classId);
    return this.filterByDateRange(
      await this.repository.getAttendanceForClass(classId),
      from,
      to,
    );
  }

  public async getStudentAttendance(
    studentId: string,
    from?: string,
    to?: string,
  ): ReturnType<SchoolRepository['getAttendanceByStudent']> {
    await this.requireStudent(studentId);
    return this.filterByDateRange(
      await this.repository.getAttendanceByStudent(studentId),
      from,
      to,
    );
  }

  public async setAttendance(input: {
    classId: string;
    studentId: string;
    date: string;
    status: AttendanceStatus;
  }): ReturnType<SchoolRepository['upsertAttendanceStatus']> {
    const student = await this.requireStudent(input.studentId);
    if (student.classId !== input.classId) {
      throw new NotFoundError(
        `El alumno ${input.studentId} no pertenece a la clase ${input.classId}`,
      );
    }
    if (!(await this.repository.isSchoolDay(input.date))) {
      throw new NonSchoolDayError(input.date);
    }
    return this.repository.upsertAttendanceStatus({
      studentId: input.studentId,
      date: input.date,
      status: input.status,
    });
  }

  // ---------- Tareas y entregas ----------

  public async listAssignments(classId?: string) {
    if (classId !== undefined) {
      await this.requireClass(classId);
    }
    return this.repository.getAssignments(classId);
  }

  public async getAssignmentSubmissions(assignmentId: string) {
    await this.requireAssignment(assignmentId);
    return this.repository.getSubmissions(assignmentId);
  }

  public async setSubmissionStatus(input: {
    assignmentId: string;
    studentId: string;
    status: SubmissionStatus;
  }): ReturnType<SchoolRepository['setSubmissionStatus']> {
    const assignment = await this.requireAssignment(input.assignmentId);
    const student = await this.requireStudent(input.studentId);
    if (student.classId !== assignment.classId) {
      throw new NotFoundError(
        `El alumno ${input.studentId} no pertenece a la clase de la tarea ${input.assignmentId}`,
      );
    }
    return this.repository.setSubmissionStatus({
      assignmentId: input.assignmentId,
      studentId: input.studentId,
      status: input.status,
    });
  }

  // ---------- Anotaciones ----------

  public async listAnnotations(filters: {
    classId?: string;
    studentId?: string;
    managed?: boolean;
  }) {
    if (filters.classId !== undefined) {
      await this.requireClass(filters.classId);
    }
    if (filters.studentId !== undefined) {
      await this.requireStudent(filters.studentId);
    }
    const matching: Annotation[] = [];
    for (const annotation of await this.repository.getAnnotations()) {
      if (filters.classId !== undefined) {
        const owner = await this.repository.getStudent(annotation.studentId);
        if (owner?.classId !== filters.classId) {
          continue;
        }
      }
      if (
        filters.studentId !== undefined &&
        annotation.studentId !== filters.studentId
      ) {
        continue;
      }
      if (
        filters.managed !== undefined &&
        annotation.managed !== filters.managed
      ) {
        continue;
      }
      matching.push(annotation);
    }
    return matching.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  public async createAnnotation(input: {
    studentId: string;
    type: AnnotationType;
    description: string;
  }): ReturnType<SchoolRepository['createAnnotation']> {
    await this.requireStudent(input.studentId);
    return this.repository.createAnnotation(input);
  }

  public async setAnnotationManaged(
    annotationId: string,
    managed: boolean,
  ): ReturnType<SchoolRepository['setAnnotationManaged']> {
    await this.requireAnnotation(annotationId);
    return this.repository.setAnnotationManaged(annotationId, managed);
  }

  // ---------- Correo ----------

  public async listMails(filters: {
    folder?: string;
    unread?: boolean;
    query?: string;
  }) {
    const folder = filters.folder ?? 'inbox';
    const normalizedQuery = filters.query?.trim().toLowerCase();
    const mails = await this.repository.getMails();
    return mails
      .filter((mail) => mail.folder === folder)
      .filter((mail) =>
        filters.unread === undefined ? true : mail.isRead === !filters.unread,
      )
      .filter((mail) => {
        if (normalizedQuery === undefined || normalizedQuery.length === 0) {
          return true;
        }
        return (
          mail.subject.toLowerCase().includes(normalizedQuery) ||
          mail.body.toLowerCase().includes(normalizedQuery) ||
          mail.senderLabel.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
  }

  public async getMailDetail(mailId: string) {
    return this.requireMail(mailId);
  }

  public async setMailRead(mailId: string, isRead: boolean) {
    await this.requireMail(mailId);
    return this.repository.setMailRead(mailId, isRead);
  }

  /** Destinatarios disponibles: familias (contactos) y grupos (clases). */
  public async searchRecipients(query?: string): Promise<MailRecipientRef[]> {
    const normalizedQuery = query?.trim().toLowerCase();
    const matches = (label: string): boolean =>
      normalizedQuery === undefined ||
      normalizedQuery.length === 0 ||
      label.toLowerCase().includes(normalizedQuery);

    const families: MailRecipientRef[] = [];
    for (const contact of await this.repository.getAllContacts()) {
      const student = await this.repository.getStudent(contact.studentId);
      families.push({
        kind: 'family' as const,
        id: `family-${contact.studentId}`,
        label: `Familia de ${student?.firstName ?? 'alumno'}`,
      });
    }
    const uniqueFamilies = [
      ...new Map(
        families
          .filter((recipient) => matches(recipient.label))
          .map((recipient) => [recipient.id, recipient]),
      ).values(),
    ];

    const groups = (await this.repository.getClasses())
      .map<MailRecipientRef>((schoolClass) => ({
        kind: 'group' as const,
        id: `group-${schoolClass.id}`,
        label: schoolClass.groupName,
      }))
      .filter((recipient) => matches(recipient.label));

    return [...uniqueFamilies, ...groups];
  }

  /** Envío mock persistido en memoria (carpeta `sent`, HU-011 demo). */
  public async sendMail(input: {
    subject: string;
    body: string;
    recipientIds: string[];
  }) {
    const recipients: MailRecipientRef[] = [];
    for (const recipientId of input.recipientIds) {
      if (recipientId.startsWith('family-')) {
        const student = await this.repository.getStudent(
          recipientId.replace('family-', ''),
        );
        if (student === undefined) {
          throw new ValidationError('Destinatario no encontrado', [
            `Destinatario inexistente: ${recipientId}`,
          ]);
        }
        recipients.push({
          kind: 'family' as const,
          id: recipientId,
          label: `Familia de ${student.firstName}`,
        });
      } else if (recipientId.startsWith('group-')) {
        const schoolClass = await this.repository.getClass(
          recipientId.replace('group-', ''),
        );
        if (schoolClass === undefined) {
          throw new ValidationError('Destinatario no encontrado', [
            `Destinatario inexistente: ${recipientId}`,
          ]);
        }
        recipients.push({
          kind: 'group' as const,
          id: recipientId,
          label: schoolClass.groupName,
        });
      } else {
        throw new ValidationError('Destinatario no válido', [
          `Formato no válido: ${recipientId}`,
        ]);
      }
    }

    if (recipients.length === 0) {
      throw new ValidationError('Indica al menos un destinatario');
    }

    return this.repository.createMail({
      subject: input.subject,
      body: input.body,
      recipients,
    });
  }

  // ---------- Ayudas privadas ----------

  private async requireClass(classId: string): Promise<SchoolClass> {
    const schoolClass = await this.repository.getClass(classId);
    if (schoolClass === undefined) {
      throw new NotFoundError(`Clase no encontrada: ${classId}`);
    }
    return schoolClass;
  }

  private async requireStudent(studentId: string): Promise<Student> {
    const student = await this.repository.getStudent(studentId);
    if (student === undefined) {
      throw new NotFoundError(`Alumno no encontrado: ${studentId}`);
    }
    return student;
  }

  private async requireAssignment(assignmentId: string) {
    const assignment = await this.repository.getAssignment(assignmentId);
    if (assignment === undefined) {
      throw new NotFoundError(`Tarea no encontrada: ${assignmentId}`);
    }
    return assignment;
  }

  private async requireAnnotation(annotationId: string) {
    const annotation = await this.repository.getAnnotation(annotationId);
    if (annotation === undefined) {
      throw new NotFoundError(`Anotación no encontrada: ${annotationId}`);
    }
    return annotation;
  }

  private async requireMail(mailId: string) {
    const mail = await this.repository.getMail(mailId);
    if (mail === undefined) {
      throw new NotFoundError(`Correo no encontrado: ${mailId}`);
    }
    return mail;
  }

  private filterByDateRange<T extends { date: string }>(
    items: T[],
    from?: string,
    to?: string,
  ): T[] {
    return items.filter((item) => {
      if (from !== undefined && item.date < from) return false;
      if (to !== undefined && item.date > to) return false;
      return true;
    });
  }

  /** Último día lectivo no futuro entre los seeds; base para resúmenes. */
  private async referenceSchoolDay() {
    const schoolDays = await this.repository.getSchoolDays();
    const todayIso = toIsoDate(new Date());
    const reference =
      schoolDays.find((day) => day.date <= todayIso) ??
      schoolDays[schoolDays.length - 1];
    if (reference === undefined) {
      throw new Error('No hay días lectivos en el seed');
    }
    return reference;
  }
}
