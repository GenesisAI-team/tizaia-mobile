import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeStats, percentile, summarizeRuns } from './stats.js';
import type { RunResult } from './types.js';

describe('bench: estadística de percentiles', () => {
  it('calcula percentiles por interpolación lineal con datos fixture', () => {
    // Datos por pares: 0..9 (10 valores). P0=0, P50=4.5, P95=8.55, P100=9.
    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    assert.equal(percentile(values, 50), 4.5);
    assert.equal(percentile([...values].sort(), 50), 4.5);
    const p95 = percentile(values, 95);
    // 8.55 puede salir como 8.549999999999999 por aritmética de coma flotante.
    assert.ok(
      Math.abs(p95 - 8.55) < 1e-9,
      `P95 esperado 8.55, recibido ${p95}`,
    );
  });

  it('maneja arrays unitarios y vacíos sin dividir entre cero', () => {
    assert.deepEqual(computeStats([5]), {
      avgMs: 5,
      p50Ms: 5,
      p95Ms: 5,
      minMs: 5,
      maxMs: 5,
    });
    assert.deepEqual(computeStats([]), {
      avgMs: 0,
      p50Ms: 0,
      p95Ms: 0,
      minMs: 0,
      maxMs: 0,
    });
  });

  it('calcula avg/p50/p95/min/max para un conjunto conocido', () => {
    const values = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    const stats = computeStats(values);
    // Media de 100..1000 = 550; min 100; max 1000.
    assert.equal(stats.avgMs, 550);
    assert.equal(stats.minMs, 100);
    assert.equal(stats.maxMs, 1000);
    // P50 en interpolación lineal = 550 en este conjunto par.
    assert.equal(stats.p50Ms, 550);
    assert.ok(stats.p95Ms > stats.p50Ms);
    assert.equal(stats.p95Ms, 955);
  });

  it('no muta la entrada al ordenar', () => {
    const original = [9, 1, 5, 3, 7];
    const copy = [...original];
    computeStats(original);
    assert.deepEqual(original, copy);
  });
});

describe('bench: resumen de ejecuciones (bytes y errores)', () => {
  it('cuenta errores y usa los bytes de la última ejecución correcta', () => {
    const runs: RunResult[] = [
      { ok: true, status: 200, durationMs: 10, responseBytes: 100 },
      { ok: true, status: 200, durationMs: 12, responseBytes: 100 },
      { ok: false, status: 503, durationMs: 40, responseBytes: 120 },
      {
        ok: false,
        status: 0,
        durationMs: 5,
        responseBytes: 0,
        error: 'TimeoutError',
      },
    ];
    const summary = summarizeRuns(runs);
    assert.equal(summary.runs, 4);
    assert.equal(summary.errors, 2);
    // Tasa de error explícita con denominador `runs` (2 erróneas / 4 runs).
    assert.equal(summary.errorRate, 0.5);
    // Bytes de la última ejecución correcta (la 2.ª).
    assert.equal(summary.responseBytes, 100);
    assert.equal(summary.avgMs, (10 + 12 + 40 + 5) / 4);
    assert.equal(summary.minMs, 5);
    assert.equal(summary.maxMs, 40);
  });

  it('deja bytes a 0 y errorRate a 1 si ninguna ejecución fue correcta', () => {
    const runs: RunResult[] = [
      { ok: false, status: 500, durationMs: 9, responseBytes: 5 },
    ];
    const summary = summarizeRuns(runs);
    assert.equal(summary.errors, 1);
    assert.equal(summary.errorRate, 1);
    assert.equal(summary.responseBytes, 0);
  });

  it('deja errorRate a 0 con un conjunto sin ejecuciones', () => {
    const summary = summarizeRuns([]);
    assert.equal(summary.runs, 0);
    assert.equal(summary.errors, 0);
    assert.equal(summary.errorRate, 0);
  });
});
