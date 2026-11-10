import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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
import { createMemorySchoolRepository } from '../infrastructure/memory/index.js';
import { createSeedData } from '../seeds/createSeedData.js';
import { REFERENCE_DATE } from '../test/helpers.js';
import { SchoolService } from './schoolService.js';

/**
 * GH #102 / GEN-39: contrato y orden de llamadas de `SchoolService.me()`.
 * Las dos lecturas independientes (`getTeacher`, `getActiveClassId`) deben
 * lanzarse en paralelo, y `getClass(activeClassId)` llegar después con el
 * identificador vigente (sin caché).
 */

type ControlledOptions = {
  /** Retiene `getTeacher`/`getActiveClassId` hasta `releaseHeldReads()`. */
  holdReads?: boolean;
  /** Cola de ids por llamada a `getActiveClassId`; repite el último si se agota. */
  activeClassIds?: string[];
};

/**
 * Doble de test sobre el puerto `SchoolRepository` (solo para `me()`): registra
 * el orden de arranque de cada lectura y qué ids pide `getClass`; delega el
 * resto de operaciones en el almacén en memoria. Es SOLO de test (clase local
 * del suite): nada de este comportamiento entra en producción (#104 sigue el
 * mismo criterio con `CountingSchoolRepository`).
 */
class ControlledReadsSchoolRepository implements SchoolRepository {
  /** Orden de arranque de las operaciones invocadas por el servicio. */
  public readonly startedReads: string[] = [];
  /** Argumentos recibidos por `getClass`, en orden de invocación. */
  public readonly requestedClassIds: string[] = [];

  private readonly inner: SchoolRepository;
  private readonly teacher: Teacher;
  private readonly classes: SchoolClass[];
  private readonly activeClassIds: string[];
  private readonly holdReads: boolean;
  private readonly pendingClassIdValues: string[] = [];
  private heldTeacher?: (value: Teacher) => void;
  private heldClassId?: (value: string) => void;
  private activeClassIdCursor = 0;

  public constructor(
    inner: SchoolRepository,
    options: {
      teacher: Teacher;
      classes: SchoolClass[];
      activeClassIds?: string[];
      holdReads?: boolean;
    },
  ) {
    this.inner = inner;
    this.teacher = options.teacher;
    this.classes = options.classes;
    this.activeClassIds =
      options.activeClassIds === undefined ? [] : [...options.activeClassIds];
    this.holdReads = options.holdReads ?? false;
  }

  /** Libera las lecturas retenidas con los valores capturados al arrancar. */
  public releaseHeldReads(): void {
    this.heldTeacher?.(this.teacher);
    this.heldTeacher = undefined;
    this.heldClassId?.(this.pendingClassIdValues.shift() ?? '');
    this.heldClassId = undefined;
  }

  public getTeacher(): Promise<Teacher> {
    this.startedReads.push('getTeacher');
    if (this.holdReads) {
      return new Promise<Teacher>((resolve) => {
        this.heldTeacher = resolve;
      });
    }
    return Promise.resolve(this.teacher);
  }

  public getActiveClassId(): Promise<string> {
    this.startedReads.push('getActiveClassId');
    const values = this.activeClassIds;
    const index = Math.min(
      this.activeClassIdCursor,
      Math.max(values.length - 1, 0),
    );
    this.activeClassIdCursor += 1;
    const value = values[index];
    if (value === undefined) {
      throw new Error(
        'ControlledReadsSchoolRepository necesita activeClassIds en el test',
      );
    }
    this.pendingClassIdValues.push(value);
    if (this.holdReads) {
      return new Promise<string>((resolve) => {
        this.heldClassId = resolve;
      });
    }
    return Promise.resolve(value);
  }

  public getClass(classId: string): Promise<SchoolClass | undefined> {
    this.startedReads.push('getClass');
    this.requestedClassIds.push(classId);
    return Promise.resolve(this.classes.find((c) => c.id === classId));
  }

  // ---------- Resto del puerto: delegación transparente ----------

  public getClasses(): Promise<SchoolClass[]> {
    return this.inner.getClasses();
  }
  public getStudents(classId?: string): Promise<Student[]> {
    return this.inner.getStudents(classId);
  }
  public getStudent(studentId: string): Promise<Student | undefined> {
    return this.inner.getStudent(studentId);
  }
  public getContacts(studentId: string): Promise<StudentContact[]> {
    return this.inner.getContacts(studentId);
  }
  public getAllContacts(): Promise<StudentContact[]> {
    return this.inner.getAllContacts();
  }
  public getSchoolDays(): Promise<SchoolDay[]> {
    return this.inner.getSchoolDays();
  }
  public isSchoolDay(date: string): Promise<boolean> {
    return this.inner.isSchoolDay(date);
  }
  public getAttendanceForClass(classId: string): Promise<AttendanceRecord[]> {
    return this.inner.getAttendanceForClass(classId);
  }
  public getAttendanceByStudent(
    studentId: string,
  ): Promise<AttendanceRecord[]> {
    return this.inner.getAttendanceByStudent(studentId);
  }
  public getAssignments(classId?: string): Promise<Assignment[]> {
    return this.inner.getAssignments(classId);
  }
  public getAssignment(assignmentId: string): Promise<Assignment | undefined> {
    return this.inner.getAssignment(assignmentId);
  }
  public getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    return this.inner.getSubmissions(assignmentId);
  }
  public getAnnotations(): Promise<Annotation[]> {
    return this.inner.getAnnotations();
  }
  public getAnnotation(annotationId: string): Promise<Annotation | undefined> {
    return this.inner.getAnnotation(annotationId);
  }
  public getMails(): Promise<Mail[]> {
    return this.inner.getMails();
  }
  public getMail(mailId: string): Promise<Mail | undefined> {
    return this.inner.getMail(mailId);
  }
  public upsertAttendanceStatus(input: {
    studentId: string;
    date: string;
    status: AttendanceStatus;
  }): Promise<AttendanceRecord> {
    return this.inner.upsertAttendanceStatus(input);
  }
  public setSubmissionStatus(input: {
    assignmentId: string;
    studentId: string;
    status: SubmissionStatus;
  }): Promise<AssignmentSubmission> {
    return this.inner.setSubmissionStatus(input);
  }
  public createAnnotation(input: {
    studentId: string;
    type: AnnotationType;
    description: string;
    createdAt?: Date;
  }): Promise<Annotation> {
    return this.inner.createAnnotation(input);
  }
  public setAnnotationManaged(
    annotationId: string,
    managed: boolean,
  ): Promise<Annotation> {
    return this.inner.setAnnotationManaged(annotationId, managed);
  }
  public updateStudent(
    studentId: string,
    patch: { firstName?: string; lastName?: string },
  ): Promise<Student> {
    return this.inner.updateStudent(studentId, patch);
  }
  public deleteStudentCascade(studentId: string): Promise<void> {
    return this.inner.deleteStudentCascade(studentId);
  }
  public createMail(input: {
    subject: string;
    body: string;
    recipients: MailRecipientRef[];
    createdAt?: Date;
  }): Promise<Mail> {
    return this.inner.createMail(input);
  }
  public setMailRead(mailId: string, isRead: boolean): Promise<Mail> {
    return this.inner.setMailRead(mailId, isRead);
  }
  public resetToSeed(referenceDate?: Date): Promise<void> {
    return this.inner.resetToSeed(referenceDate);
  }
}

describe('SchoolService.me() — resolución del contexto activo (GH #102 / GEN-39)', () => {
  const seed = createSeedData(REFERENCE_DATE);
  const classOf = (classId: string): SchoolClass | undefined =>
    seed.classes.find((classEntry) => classEntry.id === classId);

  const createControlledRepository = (
    overrides: ControlledOptions = {},
  ): ControlledReadsSchoolRepository =>
    new ControlledReadsSchoolRepository(
      createMemorySchoolRepository(REFERENCE_DATE),
      {
        teacher: seed.teacher,
        classes: seed.classes,
        activeClassIds: overrides.activeClassIds ?? [seed.activeClassId],
        holdReads: overrides.holdReads ?? false,
      },
    );

  it('lanza getTeacher y getActiveClassId en paralelo antes de getClass', async () => {
    // La doble de test retiene las dos lecturas (promesas pendientes): solo
    // pueden arrancar juntas si el servicio no espera la primera antes de
    // invocar la segunda. Con awaits secuenciales la segunda nunca arranca
    // hasta que la primera resuelve y este assert falla (RED).
    const repository = createControlledRepository({ holdReads: true });
    const service = new SchoolService(repository);
    const mePromise = service.me();

    try {
      assert.deepStrictEqual(
        repository.startedReads,
        ['getTeacher', 'getActiveClassId'],
        'getTeacher() y getActiveClassId() deben arrancar juntos (lecturas independientes)',
      );
    } finally {
      repository.releaseHeldReads();
    }

    const result = await mePromise;

    // getClass(activeClassId) sigue después, con el id resuelto y el orden intacto.
    assert.deepStrictEqual(repository.startedReads, [
      'getTeacher',
      'getActiveClassId',
      'getClass',
    ]);
    assert.deepStrictEqual(repository.requestedClassIds, [seed.activeClassId]);
    assert.deepStrictEqual(result, {
      teacher: seed.teacher,
      activeClass: classOf(seed.activeClassId),
    });
  });

  it('devuelve el mismo contrato público que la implementación previa', async () => {
    const repository = createControlledRepository();
    const service = new SchoolService(repository);

    const result = await service.me();

    assert.deepStrictEqual(result, {
      teacher: seed.teacher,
      activeClass: classOf(seed.activeClassId),
    });
    assert.ok('activeClass' in result);
    assert.deepStrictEqual(repository.requestedClassIds, [seed.activeClassId]);
  });

  it('la clase activa inexistente continúa resolviéndose como undefined sin rechazar', async () => {
    const repository = createControlledRepository({
      activeClassIds: ['class-inexistente'],
    });
    const service = new SchoolService(repository);

    const result = await service.me();

    assert.deepStrictEqual(result, {
      teacher: seed.teacher,
      activeClass: undefined,
    });
    assert.ok(result.activeClass === undefined);
  });

  it('sin caché: cada llamada relee el contexto y sirve la clase activa vigente', async () => {
    const repository = createControlledRepository({
      activeClassIds: ['class-1', 'class-2'],
    });
    const service = new SchoolService(repository);

    const first = await service.me();
    assert.deepStrictEqual(first.activeClass, classOf('class-1'));

    const second = await service.me();
    assert.deepStrictEqual(second.activeClass, classOf('class-2'));

    // getClass recibe el id leído en cada turno, nunca el de un turno anterior.
    assert.deepStrictEqual(repository.requestedClassIds, [
      'class-1',
      'class-2',
    ]);
    const countCalls = (name: string): number =>
      repository.startedReads.filter((call) => call === name).length;
    assert.equal(countCalls('getTeacher'), 2);
    assert.equal(countCalls('getActiveClassId'), 2);
    assert.equal(countCalls('getClass'), 2);
  });
});
