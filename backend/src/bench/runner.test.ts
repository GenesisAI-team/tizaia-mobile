import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import {
  benchSingleRun,
  compareReports,
  loadReport,
  parseArgs,
  runBenchmarks,
  saveReport,
} from './runner.js';
import type {
  BenchmarkConfig,
  BenchmarkReport,
  EndpointSpec,
  FetchLike,
} from './types.js';

/** Fake `Response` mínimo para el runner (headers + status + bytes). */
function fakeResponse(status: number, bodyBytes: number): Response {
  return {
    ok: status < 400,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-length' ? String(bodyBytes) : null,
    },
    arrayBuffer: async () => new ArrayBuffer(bodyBytes),
  } as unknown as Response;
}

describe('bench: runner continúa aunque un endpoint falle', () => {
  it('reporta errores por endpoint sin abortar el resto', async () => {
    const endpoints: readonly EndpointSpec[] = [
      { name: 'ok', method: 'GET', path: '/ok', routeTemplate: '/ok' },
      {
        name: 'http-error',
        method: 'GET',
        path: '/err',
        routeTemplate: '/err',
      },
      {
        name: 'network-error',
        method: 'GET',
        path: '/down',
        routeTemplate: '/down',
      },
    ];
    const fetchLike: FetchLike = async (url) => {
      if (url.endsWith('/ok')) return fakeResponse(200, 42);
      if (url.endsWith('/err')) return fakeResponse(503, 10);
      throw new Error('ECONNREFUSED');
    };
    const config: BenchmarkConfig = {
      baseUrl: 'http://test.local',
      runs: 2,
      warmup: 1,
      timeoutMs: 1000,
    };

    const report = await runBenchmarks(fetchLike, endpoints, config);

    // Nunca abandona: hay estadísticas para los tres endpoints.
    assert.deepEqual(Object.keys(report.endpoints).sort(), [
      'http-error',
      'network-error',
      'ok',
    ]);
    // Endpoint sano sin errores.
    assert.equal(report.endpoints['ok']!.errors, 0);
    assert.equal(report.endpoints['ok']!.responseBytes, 42);
    assert.equal(report.endpoints['ok']!.runs, 2);
    // Fallos HTTP y de red quedan registrados.
    assert.equal(report.endpoints['http-error']!.errors, 2);
    assert.equal(report.endpoints['network-error']!.errors, 2);
  });
});

describe('bench: benchSingleRun mide duración, bytes y estado', () => {
  it('devuelve una ejecución correcta con bytes y duración', async () => {
    const fetchLike: FetchLike = async () => fakeResponse(200, 128);
    const run = await benchSingleRun(fetchLike, 'http://x/ok', 'GET', 1000);
    assert.equal(run.ok, true);
    assert.equal(run.status, 200);
    assert.equal(run.responseBytes, 128);
    assert.ok(run.durationMs >= 0);
  });

  it('captura errores de red sin lanzar y con status 0', async () => {
    const fetchLike: FetchLike = async () => {
      throw new Error('boom');
    };
    const run = await benchSingleRun(fetchLike, 'http://x/down', 'GET', 1000);
    assert.equal(run.ok, false);
    assert.equal(run.status, 0);
    assert.equal(run.error, 'Error');
  });
});

describe('bench: comparación antes/después', () => {
  it('muestra delta porcentual y marca endpoints sin baseline', () => {
    const baseline: BenchmarkReport = {
      baseUrl: 'http://x',
      runs: 1,
      warmup: 1,
      timeoutMs: 1000,
      startedAt: '',
      endpoints: {
        slow: {
          runs: 1,
          errors: 0,
          errorRate: 0,
          avgMs: 100,
          p50Ms: 100,
          p95Ms: 100,
          minMs: 100,
          maxMs: 100,
          responseBytes: 1000,
        },
      },
    };
    const current: BenchmarkReport = {
      ...baseline,
      endpoints: {
        slow: {
          ...baseline.endpoints['slow']!,
          p50Ms: 60,
          p95Ms: 58,
          responseBytes: 100,
        },
        nuevo: {
          ...baseline.endpoints['slow']!,
        },
      },
    };
    const output = compareReports(baseline, current);
    assert.match(output, /p95: 100 ms -> 58\.0 ms/);
    assert.match(output, /-42\.0%/);
    assert.match(output, /(sin baseline anterior)/);
  });
});

describe('bench: parseArgs y valores por defecto', () => {
  it('usa valores de entorno por defecto', () => {
    const config = parseArgs([], {
      BENCH_BASE_URL: 'http://localhost:9999',
      BENCH_RUNS: '50',
      BENCH_WARMUP: '5',
      BENCH_TIMEOUT_MS: '2000',
    });
    assert.equal(config.baseUrl, 'http://localhost:9999');
    assert.equal(config.runs, 50);
    assert.equal(config.warmup, 5);
    assert.equal(config.timeoutMs, 2000);
  });

  it('los flags CLI tienen prioridad y habilitan output/baseline', () => {
    const config = parseArgs([
      '--output',
      '.bench/baseline.json',
      '--baseline',
      '.bench/after.json',
      '--runs',
      '20',
    ]);
    assert.equal(config.output, '.bench/baseline.json');
    assert.equal(config.baseline, '.bench/after.json');
    assert.equal(config.runs, 20);
    // Sin flags de entorno, el resto usa los valores mínimos.
    assert.equal(config.baseUrl, 'http://localhost:3000');
  });

  it('rechaza valores no enteros positivos', () => {
    assert.throws(() => parseArgs(['--runs', 'abc']), /entero positivo/);
    assert.throws(() => parseArgs(['--runs', '0']), /entero positivo/);
  });
});

describe('bench: saveReport crea el directorio padre (checkout limpio)', () => {
  let container: string;
  after(() => {
    rmSync(container, { recursive: true, force: true });
  });

  it('escribe .bench/baseline.json aunque .bench no exista', () => {
    container = mkdtempSync(join(tmpdir(), 'bench-save-'));
    const report: BenchmarkReport = {
      baseUrl: 'http://localhost:3000',
      runs: 1,
      warmup: 0,
      timeoutMs: 1000,
      startedAt: '2026-01-01T00:00:00.000Z',
      endpoints: {
        '/v1/me': {
          runs: 1,
          errors: 0,
          errorRate: 0,
          avgMs: 5,
          p50Ms: 5,
          p95Ms: 5,
          minMs: 5,
          maxMs: 5,
          responseBytes: 200,
        },
      },
    };
    const target = join(container, '.bench', 'baseline.json');
    saveReport(report, target);
    assert.ok(existsSync(target), 'el directorio padre debe crearse');
    const loaded = loadReport(target);
    assert.equal(loaded.endpoints['/v1/me']?.p95Ms, 5);
    assert.equal(loaded.endpoints['/v1/me']?.responseBytes, 200);
    // El JSON guardado es legible y contiene el informe completo.
    const raw = JSON.parse(readFileSync(target, 'utf8')) as BenchmarkReport;
    assert.equal(raw.baseUrl, 'http://localhost:3000');
  });
});
