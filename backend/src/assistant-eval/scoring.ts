import type { EvalCase, TurnObservation, TurnVerdict } from './types.js';

/**
 * Puntuación pura del asistente (issue #103). Sin red ni proveedor: recibe
 * una observación de un turno real y devuelve veredictos por dimensión.
 *
 * - Selección de tools: `metadata.toolsUsed` contra `expectedTools`/
 *   `forbiddenTools` (subconjunto, sin depender del orden).
 * - Clase activa: si el caso exige resolución de clase, verifica con la
 *   traza (nombre + entrada) que ningún `classId` usado difiera del esperado
 *   y que el asistente no pida la clase al docente. Requiere trace (#103).
 * - Anti-alucinación / fuga de IDs: la respuesta no debe exponer ni pedir
 *   identificadores técnicos (`classId`, `student-1`, ...).
 * - Ambigüedad de alumno: pide aclaración legible con nombres, sin IDs.
 */

/** ¿El caso exige verificación de resolución de clase activa? */
export function caseNeedsClassVerification(
  c: Pick<EvalCase, 'category' | 'expectedClassId'>,
): boolean {
  return (
    c.expectedClassId !== undefined ||
    c.category === 'active-class' ||
    c.category === 'explicit-class'
  );
}

/** Marca `true` si la respuesta (texto) filtra un identificador técnico. */
export function hasInternalIdLeak(text: string): boolean {
  const technicalKey =
    /\b(class|student|assignment|annotation|mail|conversation)Id\b/i;
  const monotonicId =
    /\b(class|student|assignment|annotation|mail)-(?:[0-9]+|[a-z][0-9a-z]*)\b/;
  const convToken = /\bconv_[a-z0-9]+\b/i;
  return (
    technicalKey.test(text) || monotonicId.test(text) || convToken.test(text)
  );
}

/** Frases que indican que el asistente pide la clase en vez de usar la activa. */
const ASK_FOR_CLASS_RE =
  /(cu[áa]l|qu[eé]) (clase|grupo|curso)[?¿]|ind[ií]came la clase|dime la clase|selecciona la clase|el[ií]ge (la )?clase|¿de qu[eé] clase|de qu[eé] grupo|especifica la clase/i;

/** ¿El texto pide al docente que indique la clase (no debe en active-class)? */
export function isAskingForClass(text: string): boolean {
  return ASK_FOR_CLASS_RE.test(text);
}

/** ¿La traza contiene algún tool call con `classId` distinto del esperado? */
export function hasWrongClassId(
  toolTrace: TurnObservation['toolTrace'],
  expectedClassId: string,
): boolean {
  return toolTrace.some(({ input }) => {
    if (typeof input !== 'object' || input === null) return false;
    const candidate = (input as Record<string, unknown>).classId;
    return (
      typeof candidate === 'string' &&
      candidate.length > 0 &&
      candidate !== expectedClassId
    );
  });
}

/**
 * ¿Algún tool call de la traza usa exactamente la clase esperada o (al no
 * fijar clase) deja que la tool resuelva la activeClass en backend?
 */
export function usesExpectedClass(
  toolTrace: TurnObservation['toolTrace'],
  expectedClassId: string,
): boolean {
  return toolTrace.some(({ input }) => {
    if (typeof input !== 'object' || input === null) return true;
    const candidate = (input as Record<string, unknown>).classId;
    return (
      candidate === undefined ||
      candidate === null ||
      candidate === '' ||
      candidate === expectedClassId
    );
  });
}

/** Selección de tools: cumplimiento de expectedTools / forbiddenTools. */
export function evalToolSelection(
  toolsUsed: string[],
  c: Pick<
    EvalCase,
    | 'expectedTools'
    | 'requireAllExpectedTools'
    | 'forbiddenTools'
    | 'requireToolCall'
  >,
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const used = new Set(toolsUsed);

  if (c.requireToolCall && toolsUsed.length === 0) {
    reasons.push('No se usó ninguna tool cuando era requerido');
  } else if (toolsUsed.length === 0) {
    reasons.push('No se usó ninguna tool');
  }

  const missingExpected = c.expectedTools.filter((t) => !used.has(t));
  const matchedExpected = c.expectedTools.filter((t) => used.has(t));

  if (c.requireAllExpectedTools === true) {
    if (matchedExpected.length !== c.expectedTools.length) {
      reasons.push(
        `Faltan tools esperadas: ${missingExpected.join(', ') || '(ninguna usada)'}`,
      );
    }
  } else if (matchedExpected.length === 0) {
    reasons.push(
      `No se usó ninguna tool esperada (${c.expectedTools.join(', ')})`,
    );
  }

  const forbiddenUsed = (c.forbiddenTools ?? []).filter((t) => used.has(t));
  if (forbiddenUsed.length > 0) {
    reasons.push(`Se usó una tool prohibida: ${forbiddenUsed.join(', ')}`);
  }

  return { ok: reasons.length === 0, reasons };
}

/** Ambigüedad de alumno: ¿la respuesta pide aclaración legible (sin IDs)? */
export function isReadableClarification(
  text: string,
  ambiguousToken: string,
): boolean {
  const token = ambiguousToken.trim();
  const referencesName =
    token.length === 0 ||
    text.toLowerCase().includes(token.toLowerCase()) ||
    text.includes('refieres') ||
    text.includes('cuál');
  const signalsMultiplicity =
    /refieres|varios|dos alumnos|ambos|se llaman|misma /i.test(text);
  const isQuestion = /[?¿]/.test(text);
  return referencesName && signalsMultiplicity && isQuestion;
}

/** Puntúa un turno observado contra su caso. Devuelve el veredicto. */
export function scoreTurn(c: EvalCase, turn: TurnObservation): TurnVerdict {
  const causes: string[] = [];

  if (!turn.ok) {
    const reason =
      turn.errorKind === 'timeout'
        ? 'Timeout en el backend'
        : turn.errorKind === 'network'
          ? 'Error de red'
          : `Respuesta HTTP ${turn.status}`;
    causes.push(reason);
    return {
      toolSelectionOk: false,
      activeClassOk: null,
      internalIdLeak: false,
      clarificationOk: null,
      errorKind: turn.errorKind ?? 'http',
      reasons: causes,
    };
  }

  const selection = evalToolSelection(turn.toolsUsed, c);
  causes.push(...selection.reasons);

  // ── Clase activa (requiere trace) ────────────────────────────────────────
  const needsClassVerification =
    c.expectedClassId !== undefined ||
    c.category === 'active-class' ||
    c.category === 'explicit-class';

  let activeClassOk: boolean | null = null;
  if (needsClassVerification) {
    if (c.expectedClassId === undefined) {
      // Sin clase concreta que exigir: solo revisar que no pregunte por ella.
      const askingClass = isAskingForClass(turn.text);
      if (askingClass) {
        causes.push('Pide la clase al docente en vez de usar la clase activa');
        activeClassOk = false;
      } else {
        activeClassOk = true;
      }
    } else if (turn.toolTrace.length === 0) {
      // No hay trace de inputs: imposible confirmar si usó otra clase.
      causes.push(
        'Trace no disponible; no se puede verificar la clase activa utilizada (activa ASSISTANT_TRACE_ENABLED)',
      );
      activeClassOk = null;
    } else if (hasWrongClassId(turn.toolTrace, c.expectedClassId)) {
      causes.push(
        `Se usó una clase distinta de la esperada (${c.expectedClassId}) en alguna tool`,
      );
      activeClassOk = false;
    } else if (isAskingForClass(turn.text)) {
      causes.push('Pide la clase al docente en vez de usar la clase activa');
      activeClassOk = false;
    } else {
      activeClassOk = true;
    }
  }

  // ── Fuga de identificadores internos ─────────────────────────────────────
  const internalIdLeak =
    c.forbidInternalIdsInAnswer && hasInternalIdLeak(turn.text);
  if (internalIdLeak) {
    causes.push('La respuesta expone o pide identificadores internos (IDs)');
  }

  // ── Ambigüedad de alumno ─────────────────────────────────────────────────
  let clarificationOk: boolean | null = null;
  if (c.expectClarification === true) {
    const nameToken = ambiguousTokenFrom(CASE_AMBIGUOUS_TOKEN, c.id);
    clarificationOk = isReadableClarification(turn.text, nameToken);
    if (!clarificationOk) {
      causes.push(
        'No pedía una aclaración legible con nombres ante un alumno ambiguo',
      );
    }
  }

  return {
    toolSelectionOk: selection.ok,
    activeClassOk,
    internalIdLeak,
    clarificationOk,
    errorKind: null,
    reasons: causes,
  };
}

/** Fallback de token ambiguo por caso (solo C26 espera aclaración). */
const CASE_AMBIGUOUS_TOKEN = 'Lara';

function ambiguousTokenFrom(_: string, caseId: string): string {
  return caseId === 'C26-ambiguous-student-lara' ? 'Lara' : '';
}
