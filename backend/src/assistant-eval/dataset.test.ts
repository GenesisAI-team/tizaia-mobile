import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ASSISTANT_EVAL_CATEGORIES,
  ASSISTANT_EVAL_DATASET,
  ASSISTANT_EVAL_DATASET_VERSION,
  isEvalCategory,
} from './dataset.js';
import { SCHOOL_TOOL_NAMES } from '../infrastructure/ai/tools/index.js';

const CANARY_PROMPTS = [
  '¿Cuántos alumnos tengo en mi clase?',
  '¿De qué asignatura es mi clase activa?',
  '¿Quién faltó ayer?',
  '¿Cuántos alumnos faltaron ayer?',
  '¿Cómo está la asistencia de mi clase hoy?',
  '¿Qué tareas tengo en mi clase?',
  'Enséñame los primeros cinco alumnos de mi clase.',
];

describe('assistant-eval · dataset', () => {
  it('tiene exactamente 30 casos versionados', () => {
    assert.equal(ASSISTANT_EVAL_DATASET.length, 30);
    assert.equal(ASSISTANT_EVAL_DATASET_VERSION, 1);
  });

  it('todos los ids son únicos y no vacíos', () => {
    const ids = ASSISTANT_EVAL_DATASET.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const c of ASSISTANT_EVAL_DATASET) {
      assert.ok(c.id.length > 0, 'id vacío');
    }
  });

  it('cubre todas las categorías declaradas', () => {
    const present = new Set(ASSISTANT_EVAL_DATASET.map((c) => c.category));
    for (const cat of ASSISTANT_EVAL_CATEGORIES) {
      assert.ok(present.has(cat), `falta la categoría ${cat}`);
      assert.ok(isEvalCategory(cat));
    }
  });

  it('incluye los 7 canary de #81 (resolución de clase activa)', () => {
    const prompts = new Set(ASSISTANT_EVAL_DATASET.map((c) => c.prompt));
    for (const p of CANARY_PROMPTS) {
      assert.ok(prompts.has(p), `falta el canary: ${p}`);
    }
    const canaries = ASSISTANT_EVAL_DATASET.filter((c) =>
      c.note?.includes('canary #81'),
    );
    assert.ok(canaries.length >= 7, 'menos de 7 canary marcados');
  });

  it('incluye al menos un caso multi-turno con el mismo conversationId', () => {
    const multi = ASSISTANT_EVAL_DATASET.find(
      (c) => c.followUps !== undefined && c.followUps.length > 0,
    );
    assert.ok(multi, 'no hay caso multi-turno');
    assert.ok((multi?.followUps?.length ?? 0) >= 1);
  });

  it('toda tool esperada existe en el catálogo', () => {
    const catalogue = new Set(SCHOOL_TOOL_NAMES);
    for (const c of ASSISTANT_EVAL_DATASET) {
      for (const t of [...c.expectedTools, ...(c.forbiddenTools ?? [])]) {
        assert.ok(
          catalogue.has(t),
          `${c.id} referencia una tool inexistente: ${t}`,
        );
      }
    }
  });

  it('los casos con requireToolCall tienen tools esperadas', () => {
    for (const c of ASSISTANT_EVAL_DATASET) {
      if (c.requireToolCall) {
        assert.ok(
          c.expectedTools.length > 0,
          `${c.id} requiere tool pero no declara ninguna esperada`,
        );
      }
    }
  });

  it('los casos de clase activa/explícita declaran una clase existente', () => {
    const valid = new Set(['class-1', 'class-2', 'class-4']);
    for (const c of ASSISTANT_EVAL_DATASET) {
      if (c.expectedClassId !== undefined) {
        assert.ok(
          valid.has(c.expectedClassId),
          `${c.id} usa una clase inexistente: ${c.expectedClassId}`,
        );
      }
    }
  });

  it('la ambigüedad de alumno usa Lara (dos en la clase activa) y pide aclaración', () => {
    const ambiguity = ASSISTANT_EVAL_DATASET.find(
      (c) => c.category === 'student-ambiguity',
    );
    assert.ok(ambiguity);
    assert.equal(ambiguity.expectClarification, true);
    assert.ok(
      ambiguity.prompt.toLowerCase().includes('lara'),
      'el caso de ambigüedad debe usar un nombre ambiguo real (Lara)',
    );
  });

  it('no hay prompts vacíos ni duplicados', () => {
    const prompts = ASSISTANT_EVAL_DATASET.map((c) => c.prompt.trim());
    for (const p of prompts) {
      assert.ok(p.length > 0);
    }
    assert.equal(
      new Set(prompts).size,
      prompts.length,
      'hay prompts duplicados',
    );
  });
});
