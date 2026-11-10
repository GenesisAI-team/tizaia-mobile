/**
 * Tipos compartidos del eval runner del asistente (issue #103).
 *
 * Un caso declara expectativas estructurales (selección de tools, clase
 * activa, fuga de IDs) y el runner las puntúa contra la respuesta real de
 * `POST /v1/assistant/messages`. Nunca se compara el texto natural por
 * igualdad exacta.
 */

/** Categorías mínimas de la batería de 30 prompts (issue #103). */
export type EvalCategory =
  | 'classes-summary' // clases y resumen
  | 'active-class' // activeClass implícita
  | 'students' // alumnado
  | 'attendance' // asistencia
  | 'tasks' // tareas/entregas
  | 'annotations' // anotaciones
  | 'mail' // correo
  | 'signals' // señales descriptivas
  | 'explicit-class' // clase explícita distinta de la activa
  | 'student-ambiguity' // ambigüedad de alumno
  | 'composition' // composición de varias tools
  | 'multi-turn'; // multi-turno con el mismo conversationId

/**
 * Un caso de evaluación. Multi-turno se modela con `followUps`: turnos
 * adicionales que se envían reutilizando el MISMO `conversationId`.
 */
export type EvalCase = {
  /** Identificador estable del caso (trazabilidad). */
  id: string;
  category: EvalCategory;
  /** Primer prompt (y único si no hay `followUps`). */
  prompt: string;
  /** Turnos posteriores en la MISMA conversación (multi-turno). */
  followUps?: string[];
  /** Tools aceptables para resolver el caso (al menos una exigida). */
  expectedTools: string[];
  /** Si es true, deben usarse TODAS las `expectedTools`; si no, basta con una. */
  requireAllExpectedTools?: boolean;
  /** Tools que, de usarse, hacen fallar el caso. */
  forbiddenTools?: string[];
  /** El caso debe usar al menos una tool. */
  requireToolCall: boolean;
  /** La respuesta NO debe exponer ni pedir identificadores internos. */
  forbidInternalIdsInAnswer: boolean;
  /** Clase que las tools deben usar (verificable con trace). */
  expectedClassId?: string;
  /** Si es true, la respuesta debe pedir aclaración legible (ambigüedad). */
  expectClarification?: boolean;
  /** Nota libre para humans al revisar. */
  note?: string;
};

/** Un solo turno ejecutado contra el backend (con su latencia). */
export type TurnObservation = {
  index: number;
  prompt: string;
  conversationId?: string;
  status: number;
  ok: boolean;
  /** Latencia del turno en ms (reloj monotónico, `performance.now()`). */
  latencyMs?: number;
  errorKind?: 'http' | 'network' | 'timeout';
  errorMessage?: string;
  toolsUsed: string[];
  /** Traza (nombre + entrada) presente solo bajo el gate de trace (#103). */
  toolTrace: Array<{ toolName: string; input: unknown }>;
  text: string;
};

/** Resultado de aplicar el scoring a una observación de turno. */
export type TurnVerdict = {
  toolSelectionOk: boolean;
  activeClassOk: boolean | null;
  internalIdLeak: boolean;
  clarificationOk: boolean | null;
  errorKind: TurnObservation['errorKind'] | null;
  reasons: string[];
};

/** Resultado de un caso tras `RUNS` repeticiones (un run por turno). */
export type RunResult = {
  prompt: string;
  passed: boolean;
  reason?: string;
  toolsUsed: string[];
  toolTrace: Array<{ toolName: string; input: unknown }>;
  /** Latencias de cada turno HTTP (clave para p50/p95 de petición única). */
  turnLatenciesMs: number[];
  conversationId?: string;
  errorKind?: TurnObservation['errorKind'];
  /** Veredictos por dimensión (para las métricas agregadas). */
  toolSelectionOk: boolean;
  activeClassOk: boolean | null;
  internalIdLeak: boolean;
  clarificationOk: boolean | null;
  verdictReasons: string[];
};

/** Resultado agregado de un caso tras N repeticiones. */
export type CaseResult = {
  id: string;
  category: EvalCategory;
  prompt: string;
  passed: number;
  failed: number;
  /** runs que pasaron / total (0..1). */
  passRate: number;
  runs: RunResult[];
  reasons: string[];
};

/** Resumen global con métricas de éxito y latencia (issue #103). */
export type EvalSummary = {
  datasetVersion: number;
  totalCases: number;
  totalRuns: number;
  passed: number;
  failed: number;
  overallSuccessRate: number;
  toolSelectionSuccessRate: number;
  activeClassResolutionRate: number | null;
  internalIdLeakageRate: number;
  httpErrorRate: number;
  averageLatencyMs: number | null;
  p50LatencyMs: number | null;
  p95LatencyMs: number | null;
  averageToolsPerTurn: number;
  errors: string[];
};

/** Configuración leída del entorno para el runner. */
export type EvalConfig = {
  baseUrl: string;
  runs: number;
  timeoutMs: number;
  allowRealProvider: boolean;
  outputPath: string;
};
