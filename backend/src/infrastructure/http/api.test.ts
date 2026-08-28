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

  it('GET /v1/bootstrap devuelve contexto global mínimo', async () => {
    const response = await server.requestJson<AnyRecord>('/v1/bootstrap');
    assert.equal(response.status, 200);
    // #76: bootstrap mínimo solo teacher/activeClassId/classes (sin overfetch)
    assert.ok(response.body.teacher);
    assert.equal(typeof response.body.activeClassId, 'string');
    assert.equal((response.body.classes as AnyRecord[]).length, 6);
    assert.equal(response.body.students, undefined);
    assert.equal(response.body.attendance, undefined);
    assert.equal(response.body.submissions, undefined);
    assert.equal(response.body.annotations, undefined);
    assert.equal(response.body.mails, undefined);
    assert.equal(response.body.contacts, undefined);
    assert.equal(response.body.schoolDays, undefined);
    assert.equal(response.body.assignments, undefined);
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
    const studentsBefore = await server.requestJson<AnyRecord[]>(
      '/v1/classes/class-1/students',
    );
    const student = studentsBefore.body[0]!;
    const boardBefore = await server.requestJson<AnyRecord>(
      '/v1/classes/class-1/attendance-board',
    );
    const attendanceCount = (boardBefore.body.attendance as AnyRecord[]).filter(
      (record) => record.studentId === student.id,
    ).length;
    assert.ok(attendanceCount > 0);

    const deleted = await server.request(`/v1/students/${student.id}`, {
      method: 'DELETE',
    });
    assert.equal(deleted.status, 204);

    const missing = await server.requestJson<AnyRecord>(
      `/v1/students/${student.id}`,
    );
    assert.equal(missing.status, 404);

    const boardAfter = await server.requestJson<AnyRecord>(
      '/v1/classes/class-1/attendance-board',
    );
    const stillThere = (boardAfter.body.attendance as AnyRecord[]).some(
      (record) => record.studentId === student.id,
    );
    assert.equal(stillThere, false);
    const taskAfter = await server.requestJson<AnyRecord>(
      '/v1/classes/class-1/task-board',
    );
    const orphanSubmissions = (taskAfter.body.submissions as AnyRecord[]).some(
      (submission) => submission.studentId === student.id,
    );
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

    const studentsForAnnotation = await server.requestJson<AnyRecord[]>(
      '/v1/classes/class-1/students',
    );
    const studentId = studentsForAnnotation.body[0]!.id;

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

  it('agregados por clase (#76): attendance-board y task-board aislados por clase', async () => {
    const attendanceBoard = await server.requestJson<AnyRecord>(
      '/v1/classes/class-1/attendance-board',
    );
    assert.equal(attendanceBoard.status, 200);
    const students = attendanceBoard.body.students as AnyRecord[];
    const attendance = attendanceBoard.body.attendance as AnyRecord[];
    const schoolDays = attendanceBoard.body.schoolDays as AnyRecord[];
    assert.ok(students.length >= 20 && students.length <= 30);
    assert.ok(students.every((s) => s.classId === 'class-1'));
    assert.ok(
      attendance.every((r) => students.some((s) => s.id === r.studentId)),
    );
    assert.ok(schoolDays.length >= 10);
    // No mezcla de otras clases
    const otherClassStudents = await server.requestJson<AnyRecord[]>(
      '/v1/classes/class-2/students',
    );
    const otherIds = new Set(otherClassStudents.body.map((s) => s.id));
    assert.equal(
      attendance.some((r) => otherIds.has(r.studentId)),
      false,
    );
    assert.equal(attendanceBoard.body.assignments, undefined);
    assert.equal(attendanceBoard.body.submissions, undefined);
    assert.equal(attendanceBoard.body.mails, undefined);

    const taskBoard = await server.requestJson<AnyRecord>(
      '/v1/classes/class-1/task-board',
    );
    assert.equal(taskBoard.status, 200);
    const taskStudents = taskBoard.body.students as AnyRecord[];
    const assignments = taskBoard.body.assignments as AnyRecord[];
    const submissions = taskBoard.body.submissions as AnyRecord[];
    assert.ok(taskStudents.every((s) => s.classId === 'class-1'));
    assert.equal(assignments.length, 10);
    assert.ok(assignments.every((a) => a.classId === 'class-1'));
    const assignmentIds = new Set(assignments.map((a) => a.id));
    assert.ok(submissions.every((s) => assignmentIds.has(s.assignmentId)));
    assert.ok(
      submissions.every((s) =>
        taskStudents.some((st) => st.id === s.studentId),
      ),
    );
    assert.equal(taskBoard.body.attendance, undefined);
    assert.equal(taskBoard.body.mails, undefined);

    // 404 para clase inexistente
    const missingBoard = await server.requestJson<AnyRecord>(
      '/v1/classes/class-999/attendance-board',
    );
    assert.equal(missingBoard.status, 404);
    const missingTask = await server.requestJson<AnyRecord>(
      '/v1/classes/class-999/task-board',
    );
    assert.equal(missingTask.status, 404);
  });

  it('anotaciones enriquecidas (#76 Opción A) incluyen studentName/initials y filtran por clase', async () => {
    const all = await server.requestJson<AnyRecord[]>('/v1/annotations');
    assert.ok(all.body.length > 0);
    for (const item of all.body) {
      assert.equal(typeof item.studentName, 'string');
      assert.ok(item.studentName.length > 0);
      assert.equal(typeof item.studentInitials, 'string');
      assert.ok(item.studentInitials.length >= 2);
      assert.equal(typeof item.managed, 'boolean');
    }
    const byClass = await server.requestJson<AnyRecord[]>(
      '/v1/annotations?classId=class-1',
    );
    assert.equal(byClass.status, 200);
    // Cada anotación debe pertenecer a alumno de class-1
    const class1Students = await server.requestJson<AnyRecord[]>(
      '/v1/classes/class-1/students',
    );
    const class1Ids = new Set(class1Students.body.map((s) => s.id));
    for (const item of byClass.body) {
      assert.ok(class1Ids.has(item.studentId));
      assert.equal(typeof item.studentName, 'string');
    }
    // No bootstrap necesario: verificar que no mezclamos otras clases
    const class2Students = await server.requestJson<AnyRecord[]>(
      '/v1/classes/class-2/students',
    );
    const class2Ids = new Set(class2Students.body.map((s) => s.id));
    const mixed = byClass.body.some((item) => class2Ids.has(item.studentId));
    assert.equal(mixed, false);
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
