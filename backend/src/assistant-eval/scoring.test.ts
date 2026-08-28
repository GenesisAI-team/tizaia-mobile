import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { EvalCase, TurnObservation } from './types.js';
import {
  caseNeedsClassVerification,
  evalToolSelection,
  hasInternalIdLeak,
  hasWrongClassId,
  isAskingForClass,
  isReadableClarification,
  scoreTurn,
  usesExpectedClass,
} from './scoring.js';

function baseCase(overrides: Partial<EvalCase> = {}): EvalCase {
  return {
    id: 'test-case',
    category: 'active-class',
    prompt: 'pregunta',
    expectedTools: ['listClassAbsences'],
    requireToolCall: true,
    forbidInternalIdsInAnswer: true,
    expectedClassId: 'class-1',
    ...overrides,
  };
}

function baseTurn(overrides: Partial<TurnObservation> = {}): TurnObservation {
  return {
    index: 0,
    prompt: 'pregunta',
    status: 200,
    ok: true,
    toolsUsed: ['listClassAbsences'],
    toolTrace: [
      { toolName: 'listClassAbsences', input: { classId: 'class-1' } },
    ],
    text: 'Faltaron 3 alumnos ayer.',
    ...overrides,
  };
}

describe('assistant-eval · scoring', () => {
  describe('hasInternalIdLeak', () => {
    it('detecta claves técnicas camelCase', () => {
      assert.equal(
        hasInternalIdLeak('¿Me pasas el studentId?'),
        true,
        'studentId debe detectarse',
      );
    });
    it('detecta ids monotónicos del seed', () => {
      assert.equal(hasInternalIdLeak('Revisa el alumno student-13'), true);
      assert.equal(hasInternalIdLeak('clase class-1'), true);
    });
    it('no marca respuestas limpias en lenguaje natural', () => {
      assert.equal(
        hasInternalIdLeak(
          'Lara Iglesias y Lara Rubio son dos alumnas de la clase.',
        ),
        false,
      );
    });
  });

  describe('isAskingForClass', () => {
    it('detecta que el asistente pide la clase en vez de usar la activa', () => {
      assert.equal(isAskingForClass('¿De qué clase quieres saber?'), true);
      assert.equal(isAskingForClass('Indícame la clase.'), true);
    });
    it('no marca cuando usa la clase activa', () => {
      assert.equal(
        isAskingForClass('Faltaron 3 alumnos en tu clase activa.'),
        false,
      );
    });
  });

  describe('hasWrongClassId / usesExpectedClass', () => {
    const trace = [
      { toolName: 'listClassAbsences', input: { classId: 'class-2' } },
    ];
    it('detecta una clase distinta a la esperada', () => {
      assert.equal(hasWrongClassId(trace, 'class-1'), true);
      assert.equal(usesExpectedClass(trace, 'class-1'), false);
    });
    it('acepta inputs sin classId (la tool resuelve la activa)', () => {
      const noClass = [{ toolName: 'listClassAbsences', input: {} }];
      assert.equal(hasWrongClassId(noClass, 'class-1'), false);
      assert.equal(usesExpectedClass(noClass, 'class-1'), true);
    });
  });

  describe('evalToolSelection', () => {
    it('aprueba cuando usa una de las esperadas', () => {
      const r = evalToolSelection(['listClassAbsences'], baseCase());
      assert.equal(r.ok, true);
    });
    it('falla si no usa ninguna esperada', () => {
      const r = evalToolSelection(['listClasses'], baseCase());
      assert.equal(r.ok, false);
    });
    it('con requireAllExpectedTools exige todas', () => {
      const c = baseCase({
        expectedTools: ['A', 'B'],
        requireAllExpectedTools: true,
      });
      assert.equal(evalToolSelection(['A'], c).ok, false);
      assert.equal(evalToolSelection(['A', 'B'], c).ok, true);
    });
    it('falla si usa una tool prohibida', () => {
      const c = baseCase({ forbiddenTools: ['listClasses'] });
      const r = evalToolSelection(['listClasses', 'listClassAbsences'], c);
      assert.equal(r.ok, false);
    });
  });

  describe('isReadableClarification', () => {
    it('acepta aclaración legible con nombres', () => {
      assert.equal(
        isReadableClarification(
          'Hay dos alumnas llamadas Lara. ¿A cuál de las dos te refieres?',
          'Lara',
        ),
        true,
      );
    });
    it('rechaza una respuesta que no pregunte', () => {
      assert.equal(isReadableClarification('Voy a mirarlo.', 'Lara'), false);
    });
  });

  describe('caseNeedsClassVerification', () => {
    it('aplica a categorías de clase y a expectedClassId', () => {
      assert.equal(
        caseNeedsClassVerification({ category: 'active-class' }),
        true,
      );
      assert.equal(
        caseNeedsClassVerification({ category: 'explicit-class' }),
        true,
      );
      assert.equal(caseNeedsClassVerification({ category: 'mail' }), false);
      assert.equal(
        caseNeedsClassVerification({
          category: 'mail',
          expectedClassId: 'class-1',
        }),
        true,
      );
    });
  });

  describe('scoreTurn', () => {
    it('aprueba un turno correcto de clase activa', () => {
      const v = scoreTurn(baseCase(), baseTurn());
      assert.equal(v.errorKind, null);
      assert.equal(v.toolSelectionOk, true);
      assert.equal(v.activeClassOk, true);
      assert.equal(v.internalIdLeak, false);
      assert.deepEqual(v.reasons, []);
    });

    it('falla por fuga de IDs en el texto', () => {
      const v = scoreTurn(
        baseCase(),
        baseTurn({
          text: 'Revisa el alumno student-13 y sus ausencias.',
          toolsUsed: ['listClassAbsences'],
        }),
      );
      assert.equal(v.internalIdLeak, true);
      assert.ok(v.reasons.some((r) => r.includes('identificadores internos')));
    });

    it('marca clase incorrecta cuando el trace usa otra clase', () => {
      const v = scoreTurn(
        baseCase(),
        baseTurn({
          toolTrace: [
            { toolName: 'listClassAbsences', input: { classId: 'class-2' } },
          ],
        }),
      );
      assert.equal(v.activeClassOk, false);
    });

    it('marca trace_unavailable y activeClassOk null sin trace', () => {
      const v = scoreTurn(baseCase(), baseTurn({ toolTrace: [] }));
      assert.equal(v.activeClassOk, null);
      assert.ok(v.reasons.some((r) => r.includes('Trace no disponible')));
    });

    it('falla si pide la clase al docente', () => {
      const v = scoreTurn(
        baseCase(),
        baseTurn({ text: '¿De qué clase quieres que te informe?' }),
      );
      assert.equal(v.activeClassOk, false);
    });

    it('reporta error http sin puntuar', () => {
      const v = scoreTurn(
        baseCase(),
        baseTurn({ ok: false, status: 503, errorKind: 'http', toolsUsed: [] }),
      );
      assert.equal(v.errorKind, 'http');
      assert.equal(v.toolSelectionOk, false);
      assert.equal(v.activeClassOk, null);
    });

    it('valida aclaración legible en casos de ambigüedad', () => {
      const c = baseCase({
        category: 'student-ambiguity',
        expectedClassId: undefined,
        expectClarification: true,
      });
      const v = scoreTurn(
        c,
        baseTurn({
          text: 'Hay dos alumnas llamadas Lara. ¿A cuál te refieres?',
          toolsUsed: ['findStudents'],
          toolTrace: [{ toolName: 'findStudents', input: { query: 'Lara' } }],
        }),
      );
      assert.equal(v.clarificationOk, true);
    });
  });
});
