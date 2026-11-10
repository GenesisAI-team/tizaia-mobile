import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { CaseResult } from './types.js';
import { average, buildSummary, median, percentile, ratio } from './stats.js';

describe('assistant-eval · stats', () => {
  describe('percentile (nearest-rank)', () => {
    it('calcula p50 y p95 correctamente', () => {
      const sorted = [100, 200, 300, 400, 1000];
      assert.equal(percentile(sorted, 50), 300);
      assert.equal(percentile(sorted, 95), 1000);
    });
    it('devuelve null con lista vacía', () => {
      assert.equal(percentile([], 50), null);
      assert.equal(median([]), null);
    });
    it('p50 es la mediana nearest-rank (impar) y el tramo inferior en pares', () => {
      assert.equal(median([1, 2, 3]), 2);
      // Nearest-rank en pares devuelve el valor del tramo inferior.
      assert.equal(median([1, 2]), 1);
    });
  });

  describe('average / ratio', () => {
    it('media y ratio protegidos', () => {
      assert.equal(average([1, 2, 3]), 2);
      assert.equal(average([]), null);
      assert.equal(ratio(1, 2), 0.5);
      assert.equal(ratio(1, 0), 0);
    });
  });

  describe('buildSummary', () => {
    function run(overrides: Partial<CaseResult['runs'][number]> = {}) {
      return {
        prompt: 'p',
        passed: true,
        toolsUsed: ['listClassAbsences'],
        toolTrace: [],
        turnLatenciesMs: [100],
        toolSelectionOk: true,
        activeClassOk: true,
        internalIdLeak: false,
        clarificationOk: null,
        verdictReasons: [],
        ...overrides,
      } satisfies CaseResult['runs'][number];
    }

    const cases: CaseResult[] = [
      {
        id: 'A',
        category: 'active-class',
        prompt: 'p',
        passed: 2,
        failed: 0,
        passRate: 1,
        reasons: [],
        runs: [
          run({ turnLatenciesMs: [100] }),
          run({ turnLatenciesMs: [300] }),
        ],
      },
      {
        id: 'B',
        category: 'mail',
        prompt: 'p2',
        passed: 0,
        failed: 1,
        passRate: 0,
        reasons: ['Selección de tools incorrecta'],
        runs: [
          run({
            passed: false,
            toolSelectionOk: false,
            activeClassOk: null,
            internalIdLeak: true,
            turnLatenciesMs: [200],
          }),
        ],
      },
    ];

    it('agrega métricas de éxito y latencia', () => {
      const s = buildSummary(cases);
      assert.equal(s.totalCases, 2);
      assert.equal(s.totalRuns, 3);
      assert.equal(s.passed, 2);
      assert.equal(s.failed, 1);
      assert.equal(s.overallSuccessRate, 2 / 3);
      assert.equal(s.toolSelectionSuccessRate, 2 / 3);
      // 1 de 2 runs con activeClassOk no-null pasan → 100% (el run de B es null).
      assert.equal(s.activeClassResolutionRate, 1);
      assert.equal(s.internalIdLeakageRate, 1 / 3);
      // Latencias 100, 300, 200 → media 200, p50 200, p95 300.
      assert.equal(s.averageLatencyMs, 200);
      assert.equal(s.p50LatencyMs, 200);
      assert.equal(s.p95LatencyMs, 300);
      assert.equal(s.httpErrorRate, 0);
      assert.ok(s.errors.some((e) => e.includes('Selección de tools')));
    });

    it('no contamina la latencia con runs con error', () => {
      const errored: CaseResult[] = [
        {
          id: 'C',
          category: 'mail',
          prompt: 'p',
          passed: 0,
          failed: 1,
          passRate: 0,
          reasons: [],
          runs: [
            run({
              passed: false,
              errorKind: 'http',
              turnLatenciesMs: [999],
              toolSelectionOk: false,
              activeClassOk: null,
            }),
          ],
        },
      ];
      const s = buildSummary(errored);
      assert.equal(s.httpErrorRate, 1);
      assert.equal(s.averageLatencyMs, null);
      assert.equal(s.p50LatencyMs, null);
    });
  });
});
