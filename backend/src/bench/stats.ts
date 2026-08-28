import type { EndpointStats, RunResult } from './types.js';

/**
 * Estadísticas puras del benchmark (issue #104), aisladas del I/O para poder
 * probarlas con fixture. Percentiles por interpolación lineal entre los dos
 * valores adyacentes (equivalente a `numpy.percentile` con linear).
 */
export function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0]!;
  const rank = (p / 100) * (sortedValues.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  if (lower === upper) return sortedValues[lower]!;
  const weight = rank - lower;
  return sortedValues[lower]! * (1 - weight) + sortedValues[upper]! * weight;
}

export function computeStats(valuesMs: number[]): {
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  minMs: number;
  maxMs: number;
} {
  if (valuesMs.length === 0) {
    return { avgMs: 0, p50Ms: 0, p95Ms: 0, minMs: 0, maxMs: 0 };
  }
  const sorted = [...valuesMs].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, value) => acc + value, 0);
  return {
    avgMs: round2(sum / sorted.length),
    p50Ms: round2(percentile(sorted, 50)),
    p95Ms: round2(percentile(sorted, 95)),
    minMs: round2(sorted[0]!),
    maxMs: round2(sorted[sorted.length - 1]!),
  };
}

/** Resumen de un conjunto de ejecuciones: estadísticas + errores + bytes. */
export function summarizeRuns(runs: RunResult[]): EndpointStats {
  const durations = runs.map((run) => run.durationMs);
  const { avgMs, p50Ms, p95Ms, minMs, maxMs } = computeStats(durations);
  const errors = runs.filter((run) => !run.ok).length;
  const lastSuccessful = [...runs].reverse().find((run) => run.ok);
  return {
    runs: runs.length,
    errors,
    errorRate: runs.length === 0 ? 0 : round4(errors / runs.length),
    avgMs,
    p50Ms,
    p95Ms,
    minMs,
    maxMs,
    responseBytes: lastSuccessful?.responseBytes ?? 0,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
