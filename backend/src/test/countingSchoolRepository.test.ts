import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startCountingTestServer } from './helpers.js';

type CountingServer = Awaited<ReturnType<typeof startCountingTestServer>>;

describe('CountingSchoolRepository (issue #104)', () => {
  let server: CountingServer;

  before(async () => {
    server = await startCountingTestServer();
  });
  after(async () => {
    await server.close();
  });

  it('cuenta las operaciones del SchoolRepository al componer task-board', async () => {
    const response = await server.request('/v1/classes/class-1/task-board');
    assert.equal(response.status, 200);

    const counts = server.getCounts();
    // task-board compone: requireClass(getClass) + getStudents + getAssignments
    // + getSubmissions por cada tarea (10 en el seed), sin N+1 hacia el servicio.
    assert.equal(counts['getClass'], 1);
    assert.equal(counts['getStudents'], 1);
    assert.equal(counts['getAssignments'], 1);
    // Una llamada por assignment (exactamente 10 para class-1).
    assert.equal(counts['getSubmissions'], 10);
    // No contamina con operaciones de otras rutas.
    assert.equal(counts['getAnnotations'], undefined);
  });

  it('acumula llamadas entre peticiones y no pierde delegación', async () => {
    // La respuesta sigue siendo válida (el decorador delega correctamente).
    const second = await server.request('/v1/classes/class-1/task-board');
    assert.equal(second.status, 200);
    const counts = server.getCounts();
    assert.equal(counts['getClass'], 2);
    assert.equal(counts['getSubmissions'], 20);

    // Las mutaciones siguen funcionando a través del wrapper.
    const players = await server.request('/v1/classes/class-1/students');
    const student = (await players.json()) as Array<{ id: string }>;
    const patch = await server.request(`/v1/students/${student[0]!.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'Contado' }),
    });
    assert.equal(patch.status, 200);
    assert.equal(server.getCounts()['updateStudent'], 1);
  });
});
