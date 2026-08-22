import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { createMemorySchoolRepository } from './index.js';
import { FIRST_SCHOOL_DAY, REFERENCE_DATE } from '../../test/helpers.js';

describe('MemorySchoolRepository', () => {
  let repository: ReturnType<typeof createMemorySchoolRepository>;

  beforeEach(() => {
    repository = createMemorySchoolRepository(REFERENCE_DATE);
  });

  it('hace upsert del estado de asistencia sin duplicar registros', async () => {
    const student = (await repository.getStudents('class-1'))[0]!;
    const before = (await repository.getAttendanceByStudent(student.id)).filter(
      (record) => record.date === FIRST_SCHOOL_DAY,
    ).length;
    assert.equal(before, 1);

    const updated = await repository.upsertAttendanceStatus({
      studentId: student.id,
      date: FIRST_SCHOOL_DAY,
      status: 'late',
    });
    assert.equal(updated.status, 'late');

    await repository.upsertAttendanceStatus({
      studentId: student.id,
      date: FIRST_SCHOOL_DAY,
      status: 'absent',
    });
    const after = (await repository.getAttendanceByStudent(student.id)).filter(
      (record) => record.date === FIRST_SCHOOL_DAY,
    );
    assert.equal(after.length, 1);
    assert.equal(after[0]!.status, 'absent');
  });

  it('cambia el estado de una entrega existente', async () => {
    const assignment = (await repository.getAssignments('class-1'))[0]!;
    const student = (await repository.getStudents('class-1'))[0]!;
    const submission = await repository.setSubmissionStatus({
      assignmentId: assignment.id,
      studentId: student.id,
      status: 'submitted',
    });
    assert.equal(submission.status, 'submitted');
    const stored = (await repository.getSubmissions(assignment.id)).find(
      (item) => item.studentId === student.id,
    );
    assert.equal(stored?.status, 'submitted');
  });

  it('crea anotaciones no gestionadas y permite gestionarlas', async () => {
    const student = (await repository.getStudents('class-1'))[0]!;
    const created = await repository.createAnnotation({
      studentId: student.id,
      type: 'positive',
      description: 'Participación excelente en el proyecto.',
    });
    assert.equal(created.managed, false);
    const managed = await repository.setAnnotationManaged(created.id, true);
    assert.equal(managed.managed, true);
  });

  it('edita solo los campos permitidos del alumno', async () => {
    const student = (await repository.getStudents('class-1'))[0]!;
    const updated = await repository.updateStudent(student.id, {
      firstName: 'NuevoNombre',
    });
    assert.equal(updated.firstName, 'NuevoNombre');
    assert.equal(updated.lastName, student.lastName);
    assert.equal(updated.birthDate, student.birthDate);
  });

  it('borra al alumno en cascada sin dejar relaciones huérfanas', async () => {
    // Preparación: un mail enviado por el docente a la familia del alumno.
    const student = (await repository.getStudents('class-1'))[0]!;
    await repository.createMail({
      subject: 'Aviso',
      body: 'Mensaje de prueba para la familia.',
      recipients: [
        { kind: 'family', id: `family-${student.id}`, label: 'Familia' },
        { kind: 'group', id: 'group-class-1', label: '1.º BACHILLER D' },
      ],
    });

    await repository.deleteStudentCascade(student.id);

    assert.equal(await repository.getStudent(student.id), undefined);
    assert.deepEqual(await repository.getContacts(student.id), []);
    assert.deepEqual(
      (await repository.getAttendanceByStudent(student.id)).filter(() => true)
        .length,
      0,
    );
    const classIdsAfter = new Set(
      (await repository.getStudents('class-1')).map((item) => item.id),
    );
    assert.equal(classIdsAfter.has(student.id), false);
    for (const submission of await repository.getSubmissions(
      (await repository.getAssignments('class-1'))[0]!.id,
    )) {
      assert.notEqual(submission.studentId, student.id);
    }
    for (const annotation of await repository.getAnnotations()) {
      assert.notEqual(annotation.studentId, student.id);
    }
    for (const mail of await repository.getMails()) {
      if (mail.folder === 'inbox') {
        assert.notEqual(mail.senderStudentId, student.id);
      }
      assert.equal(
        mail.recipients.some(
          (recipient) => recipient.id === `family-${student.id}`,
        ),
        false,
      );
    }
  });

  it('persiste un envío mock en la carpeta sent', async () => {
    const created = await repository.createMail({
      subject: 'Recordatorio',
      body: 'Recuerde traer el material mañana.',
      recipients: [{ kind: 'group', id: 'group-class-2', label: '2 ESO G' }],
    });
    assert.equal(created.folder, 'sent');
    assert.equal(created.isRead, true);
    assert.equal((await repository.getMail(created.id))?.folder, 'sent');
  });

  it('restaura el seed con resetToSeed', async () => {
    const studentBefore = (await repository.getStudents('class-1')).length;
    await repository.deleteStudentCascade(
      (await repository.getStudents('class-1'))[0]!.id,
    );
    await repository.resetToSeed(REFERENCE_DATE);
    assert.equal(
      (await repository.getStudents('class-1')).length,
      studentBefore,
    );
  });
});
