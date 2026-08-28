import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { CaseResult, EvalConfig, EvalSummary } from './types.js';
import { formatMs, loadEvalConfig, runEval } from './runner.js';
import { ASSISTANT_EVAL_DATASET_VERSION } from './dataset.js';

/**
 * CLI del eval del asistente (issue #103).
 *
 * - Guarda de seguridad: las llamadas reales al proveedor SOLO se ejecutan si
 *   `ASSISTANT_EVAL_ALLOW_REAL=true` (opt-in explícito; nunca en CI).
 * - Salida: informe humano en stdout + artefacto JSON en `outputPath`
 *   (máquina-leyble). Con `--json`, el JSON completo va a stdout.
 */

const USAGE = `Evaluador del asistente (issue #103).

Uso:
  pnpm --dir backend eval:assistant [--json]

Variables de entorno:
  ASSISTANT_EVAL_BASE_URL  url del backend (def: http://localhost:3000)
  ASSISTANT_EVAL_RUNS      repeticiones por caso (def: 1)
  ASSISTANT_EVAL_TIMEOUT_MS timeout por petición (def: 35000)
  ASSISTANT_EVAL_OUT       ruta del artefacto JSON (def: eval-results/assistant-eval.json)
  ASSISTANT_EVAL_ALLOW_REAL Si no es "true", NO hace llamadas reales al
                           proveedor y termina sin red (seguro en CI).

El backend debe publicar el endpoint y, para verificar la clase activa, tener
ASSISTANT_TRACE_ENABLED=true (el eval siempre pide el header x-assistant-trace).`;

function printReport(cases: CaseResult[], summary: EvalSummary): void {
  console.log();
  console.log(
    `Asistente · batería v${ASSISTANT_EVAL_DATASET_VERSION} · ${summary.totalCases} casos · ${summary.totalRuns} runs`,
  );
  console.log(
    `Éxito global ${(summary.overallSuccessRate * 100).toFixed(1)}% (${summary.passed}/${summary.totalRuns}) · errores HTTP ${(
      summary.httpErrorRate * 100
    ).toFixed(1)}%`,
  );
  console.log(
    `Selección tools ${(summary.toolSelectionSuccessRate * 100).toFixed(1)}% · fuga de IDs ${(
      summary.internalIdLeakageRate * 100
    ).toFixed(1)}% · tools/turno ${summary.averageToolsPerTurn.toFixed(2)}`,
  );
  if (summary.activeClassResolutionRate !== null) {
    console.log(
      `Resolución clase activa ${(summary.activeClassResolutionRate * 100).toFixed(1)}%`,
    );
  } else {
    console.log('Resolución clase activa: —');
  }
  console.log(
    `Latencia media ${formatMs(summary.averageLatencyMs)} · p50 ${formatMs(
      summary.p50LatencyMs,
    )} · p95 ${formatMs(summary.p95LatencyMs)}`,
  );
  console.log();

  for (const c of cases) {
    const status = c.passed === c.runs.length ? 'PASS' : 'FAIL';
    const color = c.passed === c.runs.length ? '\u001b[32m' : '\u001b[31m';
    console.log(
      `${color}${status}\u001b[0m  ${c.id.padEnd(38)} ${(
        c.passRate * 100
      ).toFixed(0)}%  ${c.prompt.slice(0, 70)}`,
    );
    for (const r of c.reasons.slice(0, 2)) {
      console.log(`        · ${r}`);
    }
  }

  if (summary.errors.length > 0) {
    console.log();
    console.log('Motivos de fallo más frecuentes:');
    for (const e of summary.errors.slice(0, 10)) {
      console.log(`  - ${e}`);
    }
  }
  console.log();
}

export async function main(argv = process.argv): Promise<number> {
  const args = argv.slice(2);
  const toStdout = args.includes('--json');
  if (args.includes('--help') || args.includes('-h')) {
    console.log(USAGE);
    return 0;
  }

  const config: EvalConfig = loadEvalConfig();

  if (!config.allowRealProvider) {
    console.log(
      `[eval:assistant] Opt-out activo: ASSISTANT_EVAL_ALLOW_REAL no es "true".\n` +
        `No se ejecutan llamadas reales al proveedor (seguro en CI).\n` +
        `Para ejecutar en local: ASSISTANT_EVAL_ALLOW_REAL=true pnpm --dir backend eval:assistant`,
    );
    return 0;
  }

  console.log(
    `[eval:assistant] ${config.baseUrl} · ${config.runs} run(s) · timeout ${config.timeoutMs}ms`,
  );

  const { cases, summary } = await runEval(config);

  const artifact = {
    datasetVersion: ASSISTANT_EVAL_DATASET_VERSION,
    config: {
      baseUrl: config.baseUrl,
      runs: config.runs,
      timeoutMs: config.timeoutMs,
      outputPath: config.outputPath,
    },
    summary,
    cases,
  };

  if (toStdout) {
    process.stdout.write(`${JSON.stringify(artifact, null, 2)}\n`);
  } else {
    const target = resolve(config.outputPath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
    console.log(`[eval:assistant] Artefacto JSON → ${target}`);
    printReport(cases, summary);
  }

  return summary.failed > 0 ? 1 : 0;
}

/* Punto de entrada si se ejecuta directamente (con tsx). */
const entry = process.argv[1]?.replace(/\\/g, '/') ?? '';
if (entry.endsWith('/cli.ts') || entry.endsWith('/cli.js')) {
  void main().then(
    (code) => (process.exitCode = code),
    (error: unknown) => {
      console.error('[eval:assistant] Error:', error);
      process.exitCode = 1;
    },
  );
}
