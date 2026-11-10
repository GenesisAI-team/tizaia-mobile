import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestServer, type TestServer } from '../../test/helpers.js';

/**
 * Captura las líneas JSON de `console.log` emitidas por el middleware.
 * `drain()` devuelve las líneas acumuladas SIN cerrar la captura (se puede
 * llamar varias veces); `stop()` restaura el `console.log` original.
 */
function captureConsoleLog(): {
  drain: () => string;
  stop: () => void;
} {
  const original = console.log;
  const lines: string[] = [];
  console.log = (...args: unknown[]) => {
    lines.push(args.map((arg) => String(arg)).join(' '));
  };
  return {
    drain: () => lines.join('\n'),
    stop: () => {
      console.log = original;
    },
  };
}

describe('PERF_LOGGING (issue #104)', () => {
  describe('con PERF_LOGGING=false (por defecto)', () => {
    let server: TestServer;
    let capture: ReturnType<typeof captureConsoleLog>;

    before(async () => {
      capture = captureConsoleLog();
      server = await startTestServer();
    });
    after(async () => {
      await server.close();
      capture.stop();
    });

    it('no emite líneas http_perf ni header Server-Timing en ejecución normal', async () => {
      const response = await server.request('/v1/bootstrap');
      const output = capture.drain();
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('server-timing'), null);
      assert.doesNotMatch(output, /http_perf/);
    });
  });

  describe('con PERF_LOGGING=true', () => {
    let server: TestServer;
    let capture: ReturnType<typeof captureConsoleLog>;

    before(async () => {
      capture = captureConsoleLog();
      server = await startTestServer({ perfLogging: true });
    });
    after(async () => {
      await server.close();
      capture.stop();
    });

    it('emite Server-Timing y mantiene el body intacto', async () => {
      const response = await server.request('/v1/me');
      assert.equal(response.status, 200);
      const timing = response.headers.get('server-timing');
      assert.ok(timing !== null && timing.includes('app;dur='));
      const body = (await response.json()) as { teacher?: { name?: string } };
      // El parche de res.json no debe romper la respuesta.
      assert.equal(body.teacher?.name, 'Laura Martínez');
    });

    it('registra la plantilla de ruta sin valores, query ni datos personales', async () => {
      await server.request('/v1/classes/class-1/task-board');
      await server.request('/v1/annotations?classId=class-1');
      const output = capture.drain();

      assert.match(output, /"type":"http_perf"/);
      // Plantilla de ruta, no el valor real del id de clase.
      assert.match(output, /"path":"\/v1\/classes\/:classId\/task-board"/);
      // No se incluye la query en la plantilla de anotaciones.
      assert.match(output, /"path":"\/v1\/annotations"/);
      // Sin datos escolares en el log: sin ids concretos, sin nombres ni
      // cuerpos, sin query string.
      assert.doesNotMatch(output, /class-1/);
      assert.doesNotMatch(output, /classId=class-1/);
      assert.doesNotMatch(output, /Laura/);
    });

    it('registra responseBytes numérico (content-length puede ser number)', async () => {
      await server.request('/v1/me');
      const output = capture.drain();
      // Express guarda content-length como número; debe llegar aquí y no 0.
      const line = output
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l.startsWith('{') && l.includes('"path":"/v1/me"'));
      assert.ok(
        line,
        `no se encontró la línea http_perf de /v1/me en:\n${output}`,
      );
      const parsed = JSON.parse(line) as {
        responseBytes: number | null;
        status: number;
      };
      assert.equal(parsed.status, 200);
      assert.ok(
        typeof parsed.responseBytes === 'number' && parsed.responseBytes > 0,
        `responseBytes debería ser un número > 0, recibido: ${parsed.responseBytes}`,
      );
    });

    it('etiqueta segura <unknown> para rutas sin plantilla (sin exponer la URL)', async () => {
      await server.request('/no-existe/12345');
      const output = capture.drain();
      assert.match(output, /"type":"http_perf"/);
      // No exponer la URL real (contiene IDs/refs); usar etiqueta segura.
      assert.match(output, /"path":"<unknown>"/);
      assert.doesNotMatch(output, /no-existe/);
    });
  });
});
