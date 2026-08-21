import type {
  AnnotationType,
  MailRecipientRef,
  SubmissionStatus,
} from '../domain/models.js';
import type {
  AttendanceStatus,
  SchoolClass,
  Student,
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

  public getBootstrap(): Record<string, unknown> {
    const repository = this.repository;
    return {
      teacher: repository.getTeacher(),
      activeClassId: repository.getActiveClassId(),
      classes: repository.getClasses(),
      schoolDays: repository.getSchoolDays(),
      students: repository.getStudents(),
      contacts: repository.getAllContacts(),
      attendance: repository
        .getClasses()
        .flatMap((schoolClass) =>
          repository.getAttendanceForClass(schoolClass.id),
        ),
      assignments: repository.getAssignments(),
      submissions: repository
        .getAssignments()
        .flatMap((assignment) => repository.getSubmissions(assignment.id)),
      annotations: repository.getAnnotations(),
      mails: repository.getMails(),
    };
  }

  public me(): { teacher: unknown; activeClass: SchoolClass | undefined } {
    return {
      teacher: this.repository.getTeacher(),
      activeClass: this.repository.getClass(this.repository.getActiveClassId()),
    };
  }

  /** Reinicia el almacén al seed determinista (solo con ENABLE_DEV_RESET). */
  public resetStore(): void {
    this.repository.resetToSeed(new Date());
  }

  // ---------- Clases ----------

  public listClasses(): SchoolClass[] {
    return this.repository.getClasses();
  }

  public getClass(classId: string): SchoolClass {
    return this.requireClass(classId);
  }

  public getClassSummary(classId: string): Record<string, unknown> {
    const schoolClass = this.requireClass(classId);
    const students = this.repository.getStudents(classId);
    const referenceDay = this.referenceSchoolDay();
    const recordsToday = this.repository
      .getAttendanceForClass(classId)
      .filter((record) => record.date === referenceDay.date);
    const countByStatus = (status: AttendanceStatus): number =>
      recordsToday.filter((record) => record.status === status).length;
    const unmanagedAnnotations = this.repository
      .getAnnotations()
      .filter((annotation) => {
        const student = this.repository.getStudent(annotation.studentId);
        return student?.classId === classId && annotation.managed === false;
      });

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
      assignmentsTotal: this.repository.getAssignments(classId).length,
      annotationsUnmanaged: unmanagedAnnotations.length,
    };
  }

  // ---------- Alumnado ----------

  public listStudents(classId?: string): Student[] {
    if (classId !== undefined) {
      this.requireClass(classId);
      return this.repository.getStudents(classId);
    }
    return this.repository.getStudents();
  }

  public getStudentDetail(studentId: string): Record<string, unknown> {
    const student = this.requireStudent(studentId);
    return {
      student,
      contacts: this.repository.getContacts(student.id),
    };
  }

  public getStudentProgress(studentId: string): Record<string, unknown> {
    const student = this.requireStudent(studentId);
    const attendanceRecords = this.repository.getAttendanceByStudent(
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

    const annotations = this.repository
      .getAnnotations()
      .filter((annotation) => annotation.studentId === student.id);
    const countAnnotations = (type: AnnotationType): number =>
      annotations.filter((annotation) => annotation.type === type).length;

    const submissions = this.repository
      .getAssignments(student.classId)
      .flatMap((assignment) =>
        this.repository
          .getSubmissions(assignment.id)
          .filter((submission) => submission.studentId === student.id),
      );

    return {
      student,
      class: this.requireClass(student.classId),
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
  public updateStudent(
    studentId: string,
    patch: { firstName?: string; lastName?: string },
  ): Student {
    this.requireStudent(studentId);
    return this.repository.updateStudent(studentId, patch);
  }

  /** Borrado coherente: el repositorio aplica la cascada completa. */
  public deleteStudent(studentId: string): void {
    this.requireStudent(studentId);
    this.repository.deleteStudentCascade(studentId);
  }

  // ---------- Asistencia ----------

  public listClassAttendance(
    classId: string,
    from?: string,
    to?: string,
  ): ReturnType<SchoolRepository['getAttendanceForClass']> {
    this.requireClass(classId);
    return this.filterByDateRange(
      this.repository.getAttendanceForClass(classId),
      from,
      to,
    );
  }

  public getStudentAttendance(
    studentId: string,
    from?: string,
    to?: string,
  ): ReturnType<SchoolRepository['getAttendanceByStudent']> {
    this.requireStudent(studentId);
    return this.filterByDateRange(
      this.repository.getAttendanceByStudent(studentId),
      from,
      to,
    );
  }

  public setAttendance(input: {
    classId: string;
    studentId: string;
    date: string;
    status: AttendanceStatus;
  }): ReturnType<SchoolRepository['upsertAttendanceStatus']> {
    const student = this.requireStudent(input.studentId);
    if (student.classId !== input.classId) {
      throw new NotFoundError(
        `El alumno ${input.studentId} no pertenece a la clase ${input.classId}`,
      );
    }
    if (!this.repository.isSchoolDay(input.date)) {
      throw new NonSchoolDayError(input.date);
    }
    return this.repository.upsertAttendanceStatus({
      studentId: input.studentId,
      date: input.date,
      status: input.status,
    });
  }

  // ---------- Tareas y entregas ----------

  public listAssignments(classId?: string) {
    if (classId !== undefined) {
      this.requireClass(classId);
    }
    return this.repository.getAssignments(classId);
  }

  public getAssignmentSubmissions(assignmentId: string) {
    this.requireAssignment(assignmentId);
    return this.repository.getSubmissions(assignmentId);
  }

  public setSubmissionStatus(input: {
    assignmentId: string;
    studentId: string;
    status: SubmissionStatus;
  }): ReturnType<SchoolRepository['setSubmissionStatus']> {
    const assignment = this.requireAssignment(input.assignmentId);
    const student = this.requireStudent(input.studentId);
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

  public listAnnotations(filters: {
    classId?: string;
    studentId?: string;
    managed?: boolean;
  }) {
    if (filters.classId !== undefined) {
      this.requireClass(filters.classId);
    }
    if (filters.studentId !== undefined) {
      this.requireStudent(filters.studentId);
    }
    return this.repository
      .getAnnotations()
      .filter((annotation) => {
        if (
          filters.classId !== undefined &&
          this.repository.getStudent(annotation.studentId)?.classId !==
            filters.classId
        ) {
          return false;
        }
        if (
          filters.studentId !== undefined &&
          annotation.studentId !== filters.studentId
        ) {
          return false;
        }
        if (
          filters.managed !== undefined &&
          annotation.managed !== filters.managed
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public createAnnotation(input: {
    studentId: string;
    type: AnnotationType;
    description: string;
  }): ReturnType<SchoolRepository['createAnnotation']> {
    this.requireStudent(input.studentId);
    return this.repository.createAnnotation(input);
  }

  public setAnnotationManaged(
    annotationId: string,
    managed: boolean,
  ): ReturnType<SchoolRepository['setAnnotationManaged']> {
    this.requireAnnotation(annotationId);
    return this.repository.setAnnotationManaged(annotationId, managed);
  }

  // ---------- Correo ----------

  public listMails(filters: {
    folder?: string;
    unread?: boolean;
    query?: string;
  }) {
    const folder = filters.folder ?? 'inbox';
    const normalizedQuery = filters.query?.trim().toLowerCase();
    return this.repository
      .getMails()
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

  public getMailDetail(mailId: string) {
    return this.requireMail(mailId);
  }

  public setMailRead(mailId: string, isRead: boolean) {
    this.requireMail(mailId);
    return this.repository.setMailRead(mailId, isRead);
  }

  /** Destinatarios disponibles: familias (contactos) y grupos (clases). */
  public searchRecipients(query?: string): MailRecipientRef[] {
    const normalizedQuery = query?.trim().toLowerCase();
    const matches = (label: string): boolean =>
      normalizedQuery === undefined ||
      normalizedQuery.length === 0 ||
      label.toLowerCase().includes(normalizedQuery);

    const families = this.repository
      .getAllContacts()
      .map<MailRecipientRef>((contact) => {
        const student = this.repository.getStudent(contact.studentId);
        return {
          kind: 'family' as const,
          id: `family-${contact.studentId}`,
          label: `Familia de ${student?.firstName ?? 'alumno'}`,
        };
      })
      .filter((recipient) => matches(recipient.label));

    const uniqueFamilies = [
      ...new Map(
        families.map((recipient) => [recipient.id, recipient]),
      ).values(),
    ];

    const groups = this.repository
      .getClasses()
      .map<MailRecipientRef>((schoolClass) => ({
        kind: 'group' as const,
        id: `group-${schoolClass.id}`,
        label: schoolClass.groupName,
      }))
      .filter((recipient) => matches(recipient.label));

    return [...uniqueFamilies, ...groups];
  }

  /** Envío mock persistido en memoria (carpeta `sent`, HU-011 demo). */
  public sendMail(input: {
    subject: string;
    body: string;
    recipientIds: string[];
  }) {
    const recipients = input.recipientIds.map((recipientId) => {
      if (recipientId.startsWith('family-')) {
        const student = this.repository.getStudent(
          recipientId.replace('family-', ''),
        );
        if (student === undefined) {
          throw new ValidationError('Destinatario no encontrado', [
            `Destinatario inexistente: ${recipientId}`,
          ]);
        }
        return {
          kind: 'family' as const,
          id: recipientId,
          label: `Familia de ${student.firstName}`,
        };
      }
      if (recipientId.startsWith('group-')) {
        const schoolClass = this.repository.getClass(
          recipientId.replace('group-', ''),
        );
        if (schoolClass === undefined) {
          throw new ValidationError('Destinatario no encontrado', [
            `Destinatario inexistente: ${recipientId}`,
          ]);
        }
        return {
          kind: 'group' as const,
          id: recipientId,
          label: schoolClass.groupName,
        };
      }
      throw new ValidationError('Destinatario no válido', [
        `Formato no válido: ${recipientId}`,
      ]);
    });

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

  private requireClass(classId: string): SchoolClass {
    const schoolClass = this.repository.getClass(classId);
    if (schoolClass === undefined) {
      throw new NotFoundError(`Clase no encontrada: ${classId}`);
    }
    return schoolClass;
  }

  private requireStudent(studentId: string): Student {
    const student = this.repository.getStudent(studentId);
    if (student === undefined) {
      throw new NotFoundError(`Alumno no encontrado: ${studentId}`);
    }
    return student;
  }

  private requireAssignment(assignmentId: string) {
    const assignment = this.repository.getAssignment(assignmentId);
    if (assignment === undefined) {
      throw new NotFoundError(`Tarea no encontrada: ${assignmentId}`);
    }
    return assignment;
  }

  private requireAnnotation(annotationId: string) {
    const annotation = this.repository.getAnnotation(annotationId);
    if (annotation === undefined) {
      throw new NotFoundError(`Anotación no encontrada: ${annotationId}`);
    }
    return annotation;
  }

  private requireMail(mailId: string) {
    const mail = this.repository.getMail(mailId);
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
  private referenceSchoolDay() {
    const schoolDays = this.repository.getSchoolDays();
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
