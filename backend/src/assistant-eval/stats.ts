import type { CaseResult, EvalSummary } from './types.js';
import { ASSISTANT_EVAL_DATASET_VERSION } from './dataset.js';

/**
 * Estadísticas del eval (issue #103). Funciones puras sobre los `runs`.
 */

/** Percentil por método "nearest-rank" sobre un array ordenado de números. */
export function percentile(
  sorted: readonly number[],
  p: number,
): number | null {
  if (sorted.length === 0) return null;
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  const index = Math.max(0, Math.min(sorted.length - 1, rank));
  return sorted[index] as number;
}

export function average(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

export const median = (sorted: readonly number[]): number | null =>
  percentile(sorted, 50);

/** Ratio 0..1 protegido ante denominador 0. */
export function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Resumen agregado del eval. `internalIdLeakageRate` es la fracción de runs
 * con fuga (0 % es el objetivo); `activeClassResolutionRate` es el % de runs
 * con verificación de clase activa correcta (null si ninguno la requirió).
 */
export function buildSummary(cases: readonly CaseResult[]): EvalSummary {
  const runs = cases.flatMap((c) => c.runs);

  const totalRuns = runs.length;
  const passed = cases.reduce((acc, c) => acc + c.passed, 0);
  const failed = cases.reduce((acc, c) => acc + c.failed, 0);

  const latencies: number[] = [];
  const toolCounts: number[] = [];
  let toolSelectionOk = 0;
  let activeClassOkTrue = 0;
  let activeClassOkTotal = 0;
  let internalIdLeaks = 0;
  let httpErrors = 0;

  for (const run of runs) {
    toolCounts.push(run.toolsUsed.length);
    if (run.errorKind !== undefined && run.errorKind !== null) {
      httpErrors += 1;
    } else {
      latencies.push(...run.turnLatenciesMs);
    }
    if (run.toolSelectionOk) toolSelectionOk += 1;
    if (run.activeClassOk !== null) {
      activeClassOkTotal += 1;
      if (run.activeClassOk) activeClassOkTrue += 1;
    }
    if (run.internalIdLeak) internalIdLeaks += 1;
  }

  const sortedLatency = [...latencies].sort((a, b) => a - b);
  const errors = cases
    .flatMap((c) => c.reasons)
    .filter((r) => r.length > 0)
    .slice(0, 50);

  return {
    datasetVersion: ASSISTANT_EVAL_DATASET_VERSION,
    totalCases: cases.length,
    totalRuns,
    passed,
    failed,
    overallSuccessRate: ratio(passed, totalRuns),
    toolSelectionSuccessRate: ratio(toolSelectionOk, totalRuns),
    activeClassResolutionRate:
      activeClassOkTotal === 0
        ? null
        : ratio(activeClassOkTrue, activeClassOkTotal),
    internalIdLeakageRate: ratio(internalIdLeaks, totalRuns),
    httpErrorRate: ratio(httpErrors, totalRuns),
    averageLatencyMs: average(latencies),
    p50LatencyMs: median(sortedLatency),
    p95LatencyMs: percentile(sortedLatency, 95),
    averageToolsPerTurn: average(toolCounts) ?? 0,
    errors,
  };
}
