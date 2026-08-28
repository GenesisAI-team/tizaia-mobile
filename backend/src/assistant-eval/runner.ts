import type {
  CaseResult,
  EvalCase,
  EvalConfig,
  EvalSummary,
  RunResult,
  TurnObservation,
  TurnVerdict,
} from './types.js';
import { runTurn, type EvalClientDeps } from './client.js';
import { caseNeedsClassVerification, scoreTurn } from './scoring.js';
import { buildSummary } from './stats.js';
import {
  ASSISTANT_EVAL_DATASET,
  ASSISTANT_EVAL_DATASET_VERSION,
} from './dataset.js';

/**
 * Runner headless del eval (issue #103). Orquesta la batería contra
 * `POST /v1/assistant/messages` y agrega resultados. No depende de la CLI ni
 * del proveedor real; se le inyecta `fetch` para tests sin red.
 */

export type EvalEnv = Partial<
  Pick<
    EvalConfig,
    'baseUrl' | 'runs' | 'timeoutMs' | 'allowRealProvider' | 'outputPath'
  >
>;

const DEFAULT_OUTPUT = 'eval-results/assistant-eval.json';

/** Lee la configuración del entorno con valores por defecto seguros. */
export function loadEvalConfig(
  env: Record<string, string | undefined> = process.env,
): EvalConfig {
  const runsRaw = env['ASSISTANT_EVAL_RUNS']?.trim();
  const runs =
    runsRaw === undefined || runsRaw === '' ? 1 : Number.parseInt(runsRaw, 10);

  const timeoutRaw = env['ASSISTANT_EVAL_TIMEOUT_MS']?.trim();
  const timeoutMs =
    timeoutRaw === undefined || timeoutRaw === ''
      ? 35_000
      : Number.parseInt(timeoutRaw, 10);

  return {
    baseUrl: env['ASSISTANT_EVAL_BASE_URL']?.trim() || 'http://localhost:3000',
    runs: Number.isFinite(runs) && runs > 0 ? runs : 1,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 35_000,
    // Opt-in explícito: sin ASSISTANT_EVAL_ALLOW_REAL=true la CLI se niega a
    // ejecutar llamadas reales al proveedor (nunca activado en CI).
    allowRealProvider:
      env['ASSISTANT_EVAL_ALLOW_REAL']?.trim().toLowerCase() === 'true',
    outputPath: env['ASSISTANT_EVAL_OUT']?.trim() || DEFAULT_OUTPUT,
  };
}

/** Combina los veredictos de varios turnos en el de un run (multi-turno). */
function combineVerdicts(
  c: EvalCase,
  verdicts: TurnVerdict[],
): {
  toolSelectionOk: boolean;
  activeClassOk: boolean | null;
  internalIdLeak: boolean;
  clarificationOk: boolean | null;
  reasons: string[];
} {
  const hasError = verdicts.some((v) => v.errorKind !== null);
  const toolSelectionOk = !hasError && verdicts.every((v) => v.toolSelectionOk);
  const internalIdLeak = verdicts.some((v) => v.internalIdLeak);

  // Ambigüedad: basta con que algún turno pida aclaración legible.
  let clarificationOk: boolean | null = null;
  if (c.expectClarification === true) {
    const clarified = verdicts.filter((v) => v.clarificationOk !== null);
    clarificationOk =
      clarified.length > 0 &&
      clarified.every((v) => v.clarificationOk === true);
  }

  // Clase activa: solo aplica cuando el caso la exige.
  let activeClassOk: boolean | null = null;
  if (caseNeedsClassVerification(c)) {
    const values = verdicts.map((v) => v.activeClassOk);
    if (values.some((v) => v === null)) {
      activeClassOk = null; // requiere trace no disponible
    } else if (values.some((v) => v === false)) {
      activeClassOk = false;
    } else {
      activeClassOk = true;
    }
  }

  const reasons = [...new Set(verdicts.flatMap((v) => v.reasons))].filter(
    (r) => r.length > 0,
  );

  return {
    toolSelectionOk,
    activeClassOk,
    internalIdLeak,
    clarificationOk,
    reasons,
  };
}

/** Comprueba si un run debe considerarse aprobado según sus veredictos. */
function runPassed(
  c: EvalCase,
  verdicts: TurnVerdict[],
  activeClassOk: boolean | null,
  clarificationOk: boolean | null,
  internalIdLeak: boolean,
): { passed: boolean; reason?: string } {
  if (verdicts.some((v) => v.errorKind !== null)) {
    const failed = verdicts.find((v) => v.errorKind !== null);
    return {
      passed: false,
      reason:
        failed?.errorKind === 'timeout'
          ? 'Timeout en el backend'
          : failed?.errorKind === 'network'
            ? 'Error de red'
            : 'Error HTTP en el backend',
    };
  }
  if (!verdicts.every((v) => v.toolSelectionOk)) {
    return { passed: false, reason: 'Selección de tools incorrecta' };
  }
  if (caseNeedsClassVerification(c) && activeClassOk !== true) {
    return {
      passed: false,
      reason:
        activeClassOk === null
          ? 'No se pudo verificar la clase activa (falta trace)'
          : 'Resolución de clase activa incorrecta',
    };
  }
  if (c.expectClarification === true && clarificationOk !== true) {
    return {
      passed: false,
      reason: 'No pidió aclaración legible ante la ambigüedad',
    };
  }
  if (internalIdLeak) {
    return {
      passed: false,
      reason: 'La respuesta filtra identificadores internos',
    };
  }
  return { passed: true };
}

/**
 * Ejecuta una repetición (run) de un caso: conversación independiente, con
 * el mismo `conversationId` solo para los turnos de un caso multi-turno.
 */
async function runCaseOnce(
  c: EvalCase,
  clientDeps: EvalClientDeps,
): Promise<RunResult> {
  const turns: TurnObservation[] = [];
  const verdicts: TurnVerdict[] = [];
  let conversationId: string | undefined;

  const prompts = [c.prompt, ...(c.followUps ?? [])];
  for (let i = 0; i < prompts.length; i += 1) {
    const turn = await runTurn(
      clientDeps,
      { message: prompts[i] as string, conversationId },
      i,
    );
    turns.push(turn);
    if (conversationId === undefined && turn.conversationId !== undefined) {
      conversationId = turn.conversationId;
    }
    verdicts.push(scoreTurn(c, turn));
  }

  const combined = combineVerdicts(c, verdicts);
  const decision = runPassed(
    c,
    verdicts,
    combined.activeClassOk,
    combined.clarificationOk,
    combined.internalIdLeak,
  );

  const firstError = verdicts.find((v) => v.errorKind !== null);

  return {
    prompt: c.prompt,
    passed: decision.passed,
    reason: decision.reason,
    toolsUsed: [...new Set(turns.flatMap((t) => t.toolsUsed))],
    toolTrace: turns.flatMap((t) => t.toolTrace),
    turnLatenciesMs: turns
      .map((t) => t.latencyMs)
      .filter((v): v is number => v !== undefined),
    conversationId,
    errorKind: firstError?.errorKind ?? undefined,
    toolSelectionOk: combined.toolSelectionOk,
    activeClassOk: combined.activeClassOk,
    internalIdLeak: combined.internalIdLeak,
    clarificationOk: combined.clarificationOk,
    verdictReasons: combined.reasons,
  };
}

export function aggregateCase(c: EvalCase, runs: RunResult[]): CaseResult {
  const passed = runs.filter((r) => r.passed).length;
  const failed = runs.length - passed;
  const reasons = [
    ...new Set(
      runs.flatMap((r) => [
        ...(r.reason ? [r.reason] : []),
        ...r.verdictReasons,
      ]),
    ),
  ];
  return {
    id: c.id,
    category: c.category,
    prompt: c.prompt,
    passed,
    failed,
    passRate: runs.length === 0 ? 0 : passed / runs.length,
    runs,
    reasons,
  };
}

export async function runEval(
  config: EvalConfig,
  makeClient?: (config: EvalConfig) => EvalClientDeps,
  cases: readonly EvalCase[] = ASSISTANT_EVAL_DATASET,
): Promise<{ cases: CaseResult[]; summary: EvalSummary }> {
  const clientDeps = makeClient
    ? makeClient(config)
    : { baseUrl: config.baseUrl, timeoutMs: config.timeoutMs };

  const results: CaseResult[] = [];
  for (const c of cases) {
    const runs: RunResult[] = [];
    for (let run = 0; run < config.runs; run += 1) {
      runs.push(await runCaseOnce(c, clientDeps));
    }
    results.push(aggregateCase(c, runs));
  }

  return { cases: results, summary: buildSummary(results) };
}

/** Segundos con dos decimales o "—" si no hay dato (para el informe). */
export function formatMs(ms: number | null): string {
  return ms === null ? '—' : `${(ms / 1000).toFixed(2)}s`;
}

export { buildSummary, ASSISTANT_EVAL_DATASET_VERSION };
export type { EvalConfig, CaseResult, EvalSummary };
