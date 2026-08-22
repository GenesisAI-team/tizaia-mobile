import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import {
  FIRST_SCHOOL_DAY,
  jsonInit,
  startTestServer,
  type TestServer,
} from '../../test/helpers.js';

type AnyRecord = Record<string, any>;

describe('API REST (integración)', () => {
  let server: TestServer;

  before(async () => {
    server = await startTestServer();
  });

  after(async () => {
    await server.close();
  });

  it('GET /health responde ok', async () => {
    const response = await server.requestJson<AnyRecord>('/health');
    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'ok');
    assert.equal(response.headers['x-demo-mode'], 'true');
  });

  it('GET /v1/me devuelve docente y clase activa', async () => {
    const response = await server.requestJson<AnyRecord>('/v1/me');
    assert.equal(response.status, 200);
    assert.equal(response.body.teacher.name, 'Laura Martínez');
    assert.equal(response.body.activeClass.id, 'class-1');
  });

  it('GET /v1/bootstrap devuelve un grafo coherente', async () => {
    const response = await server.requestJson<AnyRecord>('/v1/bootstrap');
    assert.equal(response.status, 200);
    const students = response.body.students as AnyRecord[];
    const studentIds = new Set(students.map((student) => student.id));
    for (const record of response.body.attendance as AnyRecord[]) {
      assert.ok(studentIds.has(record.studentId));
    }
    for (const submission of response.body.submissions as AnyRecord[]) {
      assert.ok(studentIds.has(submission.studentId));
    }
    for (const annotation of response.body.annotations as AnyRecord[]) {
      assert.ok(studentIds.has(annotation.studentId));
      assert.equal(typeof annotation.managed, 'boolean');
    }
    assert.equal((response.body.mails as AnyRecord[]).length, 30);
    assert.equal((response.body.classes as AnyRecord[]).length, 6);
  });

  it('gestiona clases: listado, detalle, resumen y errores', async () => {
    const list = await server.requestJson<AnyRecord[]>('/v1/classes');
    assert.equal(list.status, 200);
    assert.equal(list.body.length, 6);

    const detail = await server.requestJson<AnyRecord>('/v1/classes/class-1');
    assert.equal(detail.status, 200);
    assert.equal(detail.body.groupName, '1.º BACHILLER D');

    const summary = await server.requestJson<AnyRecord>(
      '/v1/classes/class-1/summary',
    );
    assert.equal(summary.status, 200);
    assert.ok(summary.body.totalStudents >= 20);
    assert.ok('attendanceToday' in summary.body);

    const missing = await server.requestJson<AnyRecord>('/v1/classes/nope');
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error.code, 'NOT_FOUND');
  });

  it('lista alumnos por clase y expone ficha con contactos', async () => {
    const students = await server.requestJson<AnyRecord[]>(
      '/v1/classes/class-1/students',
    );
    assert.equal(students.status, 200);
    const first = students.body[0]!;

    const detail = await server.requestJson<AnyRecord>(
      `/v1/students/${first.id}`,
    );
    assert.equal(detail.status, 200);
    assert.equal(detail.body.student.id, first.id);
    assert.equal(detail.body.contacts.length, 2);

    const progress = await server.requestJson<AnyRecord>(
      `/v1/students/${first.id}/progress`,
    );
    assert.equal(progress.status, 200);
    assert.ok(progress.body.attendance.totalDays > 0);
    assert.ok(progress.body.tasks.total > 0);

    const missingStudent = await server.requestJson<AnyRecord>(
      '/v1/students/student-999999',
    );
    assert.equal(missingStudent.status, 404);
  });

  it('edita el alumno con validación y persistencia', async () => {
    const students = await server.requestJson<AnyRecord[]>(
      '/v1/classes/class-2/students',
    );
    const studentId = students.body[0]!.id;

    const invalid = await server.requestJson<AnyRecord>(
      `/v1/students/${studentId}`,
      jsonInit('PATCH', {}),
    );
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');

    const updated = await server.requestJson<AnyRecord>(
      `/v1/students/${studentId}`,
      jsonInit('PATCH', { firstName: 'NombreEditado' }),
    );
    assert.equal(updated.status, 200);
    assert.equal(updated.body.firstName, 'NombreEditado');

    const reloaded = await server.requestJson<AnyRecord>(
      `/v1/students/${studentId}`,
    );
    assert.equal(reloaded.body.student.firstName, 'NombreEditado');
  });

  it('borra el alumno en cascada y no deja huérfanos visibles', async () => {
    const bootstrapBefore =
      await server.requestJson<AnyRecord>('/v1/bootstrap');
    const student = (bootstrapBefore.body.students as AnyRecord[])[0]!;
    const attendanceCount = (
      bootstrapBefore.body.attendance as AnyRecord[]
    ).filter((record) => record.studentId === student.id).length;
    assert.ok(attendanceCount > 0);

    const deleted = await server.request(`/v1/students/${student.id}`, {
      method: 'DELETE',
    });
    assert.equal(deleted.status, 204);

    const missing = await server.requestJson<AnyRecord>(
      `/v1/students/${student.id}`,
    );
    assert.equal(missing.status, 404);

    const bootstrapAfter = await server.requestJson<AnyRecord>('/v1/bootstrap');
    const stillThere = (bootstrapAfter.body.attendance as AnyRecord[]).some(
      (record) => record.studentId === student.id,
    );
    assert.equal(stillThere, false);
    const orphanSubmissions = (
      bootstrapAfter.body.submissions as AnyRecord[]
    ).some((submission) => submission.studentId === student.id);
    assert.equal(orphanSubmissions, false);
  });

  it('persiste asistencia y rechaza fechas no lectivas o combinaciones inválidas', async () => {
    const students = await server.requestJson<AnyRecord[]>(
      '/v1/classes/class-1/students',
    );
    const studentId = students.body[0]!.id;
    const path = `/v1/attendance/class-1/${studentId}/${FIRST_SCHOOL_DAY}`;

    const created = await server.requestJson<AnyRecord>(
      path,
      jsonInit('PUT', { status: 'absent' }),
    );
    assert.equal(created.status, 200);
    assert.equal(created.body.status, 'absent');

    const updated = await server.requestJson<AnyRecord>(
      path,
      jsonInit('PUT', { status: 'late' }),
    );
    assert.equal(updated.status, 200);
    assert.equal(updated.body.status, 'late');
    assert.equal(updated.body.id, created.body.id);

    // La mutación es visible en consultas posteriores.
    const range = await server.requestJson<AnyRecord[]>(
      `/v1/classes/class-1/attendance?from=${FIRST_SCHOOL_DAY}&to=${FIRST_SCHOOL_DAY}`,
    );
    const record = range.body.find((item) => item.studentId === studentId);
    assert.equal(record?.status, 'late');

    const nonSchoolDay = await server.requestJson<AnyRecord>(
      `/v1/attendance/class-1/${studentId}/2026-08-22`,
      jsonInit('PUT', { status: 'present' }),
    );
    assert.equal(nonSchoolDay.status, 409);
    assert.equal(nonSchoolDay.body.error.code, 'NON_SCHOOL_DAY');

    const badDate = await server.requestJson<AnyRecord>(
      `/v1/attendance/class-1/${studentId}/21-08-2026`,
      jsonInit('PUT', { status: 'present' }),
    );
    assert.equal(badDate.status, 400);

    const wrongClass = await server.requestJson<AnyRecord>(
      `/v1/attendance/class-3/${studentId}/${FIRST_SCHOOL_DAY}`,
      jsonInit('PUT', { status: 'present' }),
    );
    assert.equal(wrongClass.status, 404);

    const badStatus = await server.requestJson<AnyRecord>(
      path,
      jsonInit('PUT', { status: 'expulsado' }),
    );
    assert.equal(badStatus.status, 400);
  });

  it('gestiona tareas y entregas con persistencia', async () => {
    const assignments = await server.requestJson<AnyRecord[]>(
      '/v1/classes/class-1/assignments',
    );
    assert.equal(assignments.body.length, 10);
    const assignmentId = assignments.body[0]!.id;

    const submissions = await server.requestJson<AnyRecord[]>(
      `/v1/assignments/${assignmentId}/submissions`,
    );
    assert.equal(submissions.status, 200);
    const target = submissions.body[0]!;

    const updated = await server.requestJson<AnyRecord>(
      `/v1/assignments/${assignmentId}/submissions/${target.studentId}`,
      jsonInit('PUT', { status: 'submitted' }),
    );
    assert.equal(updated.status, 200);
    assert.equal(updated.body.status, 'submitted');

    const reloaded = await server.requestJson<AnyRecord[]>(
      `/v1/assignments/${assignmentId}/submissions`,
    );
    const stored = reloaded.body.find(
      (item) => item.studentId === target.studentId,
    );
    assert.equal(stored?.status, 'submitted');

    const unknownAssignment = await server.requestJson<AnyRecord>(
      '/v1/assignments/assignment-99999/submissions',
    );
    assert.equal(unknownAssignment.status, 404);
  });

  it('filtra anotaciones, crea y gestiona estado', async () => {
    const unmanaged = await server.requestJson<AnyRecord[]>(
      '/v1/annotations?managed=false',
    );
    assert.equal(unmanaged.status, 200);
    assert.ok(unmanaged.body.length > 0);
    for (const annotation of unmanaged.body) {
      assert.equal(annotation.managed, false);
    }

    const bootstrap = await server.requestJson<AnyRecord>('/v1/bootstrap');
    const studentId = (bootstrap.body.students as AnyRecord[])[0]!.id;

    const created = await server.requestJson<AnyRecord>(
      '/v1/annotations',
      jsonInit('POST', {
        studentId,
        type: 'positive',
        description: 'Ayudó a un compañero durante la práctica.',
      }),
    );
    assert.equal(created.status, 201);
    assert.equal(created.body.managed, false);

    const managed = await server.requestJson<AnyRecord>(
      `/v1/annotations/${created.body.id}/managed`,
      jsonInit('PATCH', { managed: true }),
    );
    assert.equal(managed.status, 200);
    assert.equal(managed.body.managed, true);

    const byStudent = await server.requestJson<AnyRecord[]>(
      `/v1/annotations?studentId=${studentId}&managed=true`,
    );
    assert.ok(byStudent.body.some((item) => item.id === created.body.id));

    const unknown = await server.requestJson<AnyRecord>(
      '/v1/annotations/annotation-99999/managed',
      jsonInit('PATCH', { managed: true }),
    );
    assert.equal(unknown.status, 404);
  });

  it('opera el correo demo: bandeja, lectura, destinatarios y envío', async () => {
    const inbox = await server.requestJson<AnyRecord[]>('/v1/mails');
    assert.equal(inbox.status, 200);
    // El seed trae 30 correos; el test de cascada puede haber eliminado el
    // correo de algún alumno borrado. La API debe coincidir con el almacén.
    const expectedInbox = (await server.repository.getMails()).filter(
      (mail) => mail.folder === 'inbox',
    ).length;
    assert.equal(inbox.body.length, expectedInbox);

    const unread = await server.requestJson<AnyRecord[]>(
      '/v1/mails?unread=true',
    );
    for (const mail of unread.body) {
      assert.equal(mail.isRead, false);
    }

    const searched = await server.requestJson<AnyRecord[]>(
      '/v1/mails?query=tutor%C3%ADa',
    );
    assert.ok(searched.body.length > 0);
    assert.ok(
      searched.body.every((mail) =>
        `${mail.subject}${mail.body}${mail.senderLabel}`
          .toLowerCase()
          .includes('tutor'),
      ),
    );

    const detail = await server.requestJson<AnyRecord>(
      `/v1/mails/${inbox.body[0]!.id}`,
    );
    assert.equal(detail.status, 200);
    assert.ok(detail.body.body.length > 0);

    const read = await server.requestJson<AnyRecord>(
      `/v1/mails/${detail.body.id}/read`,
      jsonInit('PATCH', { isRead: true }),
    );
    assert.equal(read.status, 200);
    assert.equal(read.body.isRead, true);
    const persisted = await server.requestJson<AnyRecord[]>(
      '/v1/mails?unread=true&folder=inbox',
    );
    assert.equal(
      persisted.body.some((mail) => mail.id === detail.body.id),
      false,
    );

    const recipients = await server.requestJson<AnyRecord[]>(
      '/v1/mail-recipients?query=Familia',
    );
    assert.ok(recipients.body.length > 0);
    const familyRecipient = recipients.body[0]!.id;
    const groupRecipient = (
      await server.requestJson<AnyRecord[]>('/v1/mail-recipients')
    ).body.find((recipient) => recipient.kind === 'group')!.id;

    const sent = await server.requestJson<AnyRecord>(
      '/v1/mails',
      jsonInit('POST', {
        subject: 'Salida al museo',
        body: 'Confirmad la asistencia antes del viernes.',
        recipientIds: [familyRecipient, groupRecipient],
      }),
    );
    assert.equal(sent.status, 201);
    assert.equal(sent.body.folder, 'sent');

    const sentFolder = await server.requestJson<AnyRecord[]>(
      '/v1/mails?folder=sent',
    );
    assert.equal(sentFolder.status, 200);
    assert.ok(sentFolder.body.some((mail) => mail.id === sent.body.id));

    const badRecipient = await server.requestJson<AnyRecord>(
      '/v1/mails',
      jsonInit('POST', {
        subject: 'Prueba',
        body: 'Cuerpo de prueba.',
        recipientIds: ['family-student-999999'],
      }),
    );
    assert.equal(badRecipient.status, 400);

    const emptyRecipients = await server.requestJson<AnyRecord>(
      '/v1/mails',
      jsonInit('POST', {
        subject: 'Prueba',
        body: 'Cuerpo de prueba.',
        recipientIds: [],
      }),
    );
    assert.equal(emptyRecipients.status, 400);
  });

  it('expone POST /v1/dev/reset solo bajo flag', async () => {
    const disabled = await server.requestJson<AnyRecord>('/v1/dev/reset', {
      method: 'POST',
    });
    assert.equal(disabled.status, 404);

    const resetServer = await startTestServer({ devResetEnabled: true });
    try {
      const studentsBefore = (
        await resetServer.repository.getStudents('class-1')
      ).map((student) => student.id);
      await resetServer.repository.deleteStudentCascade(studentsBefore[0]!);
      assert.notEqual(
        (await resetServer.repository.getStudents('class-1')).length,
        studentsBefore.length,
      );

      const enabled = await resetServer.requestJson<AnyRecord>(
        '/v1/dev/reset',
        {
          method: 'POST',
        },
      );
      assert.equal(enabled.status, 200);
      assert.deepEqual(
        (await resetServer.repository.getStudents('class-1')).map((s) => s.id),
        studentsBefore,
      );
    } finally {
      await resetServer.close();
    }
  });

  it('devuelve envolvente JSON para rutas desconocidas y JSON malformado', async () => {
    const unknownRoute = await server.requestJson<AnyRecord>('/v1/unknown');
    assert.equal(unknownRoute.status, 404);
    assert.equal(unknownRoute.body.error.code, 'NOT_FOUND');

    const malformed = await server.request('/v1/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{no-es-json',
    });
    assert.equal(malformed.status, 400);
    const malformedBody = (await malformed.json()) as AnyRecord;
    assert.equal(malformedBody.error.code, 'VALIDATION_ERROR');
  });
});
