import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { EvalCase, EvalConfig } from './types.js';
import { loadEvalConfig, runEval } from './runner.js';

/** Fake `fetch` sin red: responde según el cuerpo de la petición. */
function fakeFetch(
  onRequest: (body: Record<string, unknown>) => {
    status: number;
    payload: Record<string, unknown>;
  },
): typeof fetch {
  return async (_input, init) => {
    const raw = typeof init?.body === 'string' ? init.body : '{}';
    const body = JSON.parse(raw) as Record<string, unknown>;
    const { status, payload } = onRequest(body);
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => payload,
    } as unknown as Response;
  };
}

function config(overrides: Partial<EvalConfig> = {}): EvalConfig {
  return {
    baseUrl: 'http://localhost:3000',
    runs: 1,
    timeoutMs: 1000,
    allowRealProvider: true,
    outputPath: 'eval-results/test.json',
    ...overrides,
  };
}

const activeClassCase: EvalCase = {
  id: 'PASS-1',
  category: 'active-class',
  prompt: '¿Quién faltó ayer?',
  expectedTools: ['listClassAbsences'],
  requireToolCall: true,
  forbidInternalIdsInAnswer: true,
  expectedClassId: 'class-1',
};

const multiTurnCase: EvalCase = {
  id: 'MULTI',
  category: 'multi-turn',
  prompt: '¿Quién faltó ayer?',
  followUps: ['¿Y hoy?'],
  expectedTools: ['listClassAbsences'],
  requireToolCall: true,
  forbidInternalIdsInAnswer: true,
  expectedClassId: 'class-1',
};

describe('assistant-eval · runner', () => {
  it('aprueba un caso de clase activa correcto (con trace)', async () => {
    const partial = config();
    const { cases, summary } = await runEval(
      partial,
      (cfg) => ({
        baseUrl: cfg.baseUrl,
        timeoutMs: cfg.timeoutMs,
        fetchImpl: fakeFetch(() => ({
          status: 200,
          payload: {
            conversationId: 'conv_1',
            message: 'Faltaron 3 alumnos ayer.',
            metadata: {
              toolsUsed: ['listClassAbsences'],
              trace: [
                {
                  toolName: 'listClassAbsences',
                  input: { classId: 'class-1' },
                },
              ],
            },
          },
        })),
      }),
      [activeClassCase],
    );

    assert.equal(cases.length, 1);
    assert.equal(cases[0]?.passed, 1);
    assert.equal(cases[0]?.failed, 0);
    assert.equal(summary.passed, 1);
    assert.equal(summary.overallSuccessRate, 1);
  });

  it('falla por fuga de IDs en el texto', async () => {
    const partial = config();
    const { cases } = await runEval(
      partial,
      (cfg) => ({
        baseUrl: cfg.baseUrl,
        timeoutMs: cfg.timeoutMs,
        fetchImpl: fakeFetch(() => ({
          status: 200,
          payload: {
            conversationId: 'conv_1',
            message: 'Revisa el alumno student-13.',
            metadata: {
              toolsUsed: ['listClassAbsences'],
              trace: [
                {
                  toolName: 'listClassAbsences',
                  input: { classId: 'class-1' },
                },
              ],
            },
          },
        })),
      }),
      [activeClassCase],
    );
    assert.equal(cases[0]?.passed, 0);
    assert.ok(
      cases[0]?.reasons.some((r) => r.includes('identificadores internos')),
    );
  });

  it('reporta error http y no puntúa', async () => {
    const partial = config();
    const { cases, summary } = await runEval(
      partial,
      (cfg) => ({
        baseUrl: cfg.baseUrl,
        timeoutMs: cfg.timeoutMs,
        fetchImpl: fakeFetch(() => ({ status: 503, payload: {} })),
      }),
      [activeClassCase],
    );
    assert.equal(cases[0]?.passed, 0);
    assert.equal(cases[0]?.runs[0]?.errorKind, 'http');
    assert.equal(summary.httpErrorRate, 1);
  });

  it('reutiliza el mismo conversationId en un caso multi-turno', async () => {
    const partial = config();
    const convosSeen: (string | undefined)[] = [];
    const { cases } = await runEval(
      partial,
      (cfg) => ({
        baseUrl: cfg.baseUrl,
        timeoutMs: cfg.timeoutMs,
        fetchImpl: fakeFetch((body) => {
          convosSeen.push(body['conversationId'] as string | undefined);
          return {
            status: 200,
            payload: {
              conversationId: 'conv_multi',
              message: 'Faltaron 3 alumnos.',
              metadata: {
                toolsUsed: ['listClassAbsences'],
                trace: [
                  {
                    toolName: 'listClassAbsences',
                    input: { classId: 'class-1' },
                  },
                ],
              },
            },
          };
        }),
      }),
      [multiTurnCase],
    );

    // Turno 1 sin conversationId, turno 2 con el mismo.
    assert.equal(convosSeen.length, 2);
    assert.equal(convosSeen[0], undefined);
    assert.equal(convosSeen[1], 'conv_multi');
    assert.equal(cases[0]?.passed, 1);
    assert.equal(cases[0]?.runs[0]?.turnLatenciesMs.length, 2);
  });

  it('usa conversaciones independientes entre runs', async () => {
    const partial = config({ runs: 2 });
    let calls = 0;
    const { cases } = await runEval(
      partial,
      (cfg) => ({
        baseUrl: cfg.baseUrl,
        timeoutMs: cfg.timeoutMs,
        fetchImpl: fakeFetch(() => {
          calls += 1;
          return {
            status: 200,
            payload: {
              conversationId: `conv_${calls}`,
              message: 'OK',
              metadata: { toolsUsed: ['listClassAbsences'], trace: [] },
            },
          };
        }),
      }),
      [activeClassCase],
    );
    assert.equal(calls, 2);
    assert.equal(cases[0]?.runs.length, 2);
  });

  describe('loadEvalConfig', () => {
    it('usa valores por defecto seguros', () => {
      const c = loadEvalConfig({});
      assert.equal(c.baseUrl, 'http://localhost:3000');
      assert.equal(c.runs, 1);
      assert.equal(c.timeoutMs, 35_000);
      assert.equal(c.allowRealProvider, false);
    });

    it('lee variables de entorno', () => {
      const c = loadEvalConfig({
        ASSISTANT_EVAL_BASE_URL: 'http://x',
        ASSISTANT_EVAL_RUNS: '3',
        ASSISTANT_EVAL_TIMEOUT_MS: '5000',
        ASSISTANT_EVAL_ALLOW_REAL: 'true',
      });
      assert.equal(c.baseUrl, 'http://x');
      assert.equal(c.runs, 3);
      assert.equal(c.timeoutMs, 5000);
      assert.equal(c.allowRealProvider, true);
    });
  });
});
