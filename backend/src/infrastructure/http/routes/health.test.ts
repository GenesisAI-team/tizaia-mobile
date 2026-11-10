import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  startCountingTestServer,
  startTestServer,
  type TestServer,
} from '../../../test/helpers.js';

// Igual que `api.test.ts`: cuerpos dinámicos de integración.
type AnyRecord = Record<string, any>;

type CountingTestServer = TestServer & {
  getCounts: () => Readonly<Record<string, number>>;
};

/**
 * GEN-43: `GET /health` es una sonda de vida (healthcheck Docker) y como tal
 * solo expone estado operativo. Nada de docente, alumnado, IDs escolares ni
 * PII; tampoco consultas a dominio/repositorio (`demo` deriva del
 * `demoMode` real, no de un literal).
 */
describe('GET /health (GEN-43: sonda mínima)', () => {
  it('devuelve exactamente status, uptimeSeconds y demo; sin teacher ni PII', async () => {
    const server = await startTestServer();
    try {
      const response = await server.requestJson<AnyRecord>('/health');
      assert.equal(response.status, 200);
      assert.equal(response.body.status, 'ok');
      assert.equal(typeof response.body.uptimeSeconds, 'number');
      assert.ok(Number.isInteger(response.body.uptimeSeconds));
      assert.ok(response.body.uptimeSeconds >= 0);
      // Contrato exacto: la sonda no puede filtrar nada más.
      assert.deepEqual(Object.keys(response.body).sort(), [
        'demo',
        'status',
        'uptimeSeconds',
      ]);
      assert.equal(response.body.teacher, undefined);
      assert.equal(response.body.students, undefined);
    } finally {
      await server.close();
    }
  });

  it('deriva demo del modo demo real: true por defecto y false con demoMode off', async () => {
    const demoOn = await startTestServer();
    try {
      const on = await demoOn.requestJson<AnyRecord>('/health');
      assert.equal(on.status, 200);
      assert.equal(on.body.demo, true);
    } finally {
      await demoOn.close();
    }

    const demoOff = await startTestServer({ demoMode: false });
    try {
      const off = await demoOff.requestJson<AnyRecord>('/health');
      assert.equal(off.status, 200);
      assert.equal(off.body.demo, false);
      assert.deepEqual(Object.keys(off.body).sort(), [
        'demo',
        'status',
        'uptimeSeconds',
      ]);
    } finally {
      await demoOff.close();
    }
  });

  it('no consulta dominio/repositorio (cero operaciones del SchoolRepository)', async () => {
    const server: CountingTestServer = await startCountingTestServer();
    try {
      const response = await server.requestJson<AnyRecord>('/health');
      assert.equal(response.status, 200);
      assert.equal(response.body.status, 'ok');
      // `service.me()` (getTeacher + getActiveClassId) aparece como dos
      // operaciones contadas: la sonda debe responder sin tocar el almacén.
      assert.deepEqual(server.getCounts(), {});
    } finally {
      await server.close();
    }
  });
});
