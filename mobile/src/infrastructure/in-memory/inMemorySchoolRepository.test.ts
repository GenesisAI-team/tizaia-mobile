import { createInMemorySchoolRepository } from './index';

/**
 * Paridad del fake con el contrato real de `/v1/bootstrap` (backend #67):
 * el agregado sirve datos de TODO el centro. Si el fake filtrase por clase
 * activa, ocultaría en tests los errores de pantallas que no seleccionan.
 */
describe('InMemorySchoolRepository.getBootstrap', () => {
  it('incluye alumnos, asistencia, tareas y entregas de todas las clases', async () => {
    const repository = createInMemorySchoolRepository(new Date('2026-08-19'));

    const bootstrap = await repository.getBootstrap();

    expect(bootstrap.activeClassId).toBe('class-1');
    // El seed tiene varias clases y alumnos fuera de la clase activa.
    const otherClassIds = new Set(
      bootstrap.classes
        .filter((schoolClass) => schoolClass.id !== bootstrap.activeClassId)
        .map((schoolClass) => schoolClass.id),
    );
    expect(otherClassIds.size).toBeGreaterThan(0);
    const otherStudentIds = new Set(
      bootstrap.students
        .filter((student) => otherClassIds.has(student.classId))
        .map((student) => student.id),
    );

    expect(bootstrap.students.some((s) => otherClassIds.has(s.classId))).toBe(
      true,
    );
    expect(
      bootstrap.attendance.some((record) =>
        otherStudentIds.has(record.studentId),
      ),
    ).toBe(true);
    expect(
      bootstrap.assignments.some(
        (assignment) => assignment.classId !== bootstrap.activeClassId,
      ),
    ).toBe(true);
    const otherAssignmentIds = new Set(
      bootstrap.assignments
        .filter((assignment) => assignment.classId !== bootstrap.activeClassId)
        .map((assignment) => assignment.id),
    );
    expect(otherAssignmentIds.size).toBeGreaterThan(0);
    expect(
      bootstrap.submissions.some((submission) =>
        otherAssignmentIds.has(submission.assignmentId),
      ),
    ).toBe(true);
  });

  it('no filtra la carpeta de correo: incluye los enviados del docente', async () => {
    const repository = createInMemorySchoolRepository(new Date('2026-08-19'));
    await repository.sendMail({
      subject: 'Asunto',
      body: 'Cuerpo del mensaje',
      recipientIds: ['family-student-1'],
    });

    const bootstrap = await repository.getBootstrap();
    const inbox = await repository.getMails('inbox');

    expect(inbox.every((mail) => mail.folder === 'inbox')).toBe(true);
    expect(bootstrap.mails.some((mail) => mail.folder === 'sent')).toBe(true);
  });
});
