import {
  generateText,
  isStepCount,
  type LanguageModel,
  type ModelMessage,
  type ToolSet,
} from 'ai';

/**
 * Agente escolar del asistente (AI-001): orquesta `generateText` con tools de
 * lectura sobre los servicios escolares. La IA redacta; los cálculos y
 * filtros deterministas viven en las tools/backend.
 */

/**
 * Parseo defensivo de la entrada de una tool para el trace (issue #103): el
 * AI SDK suele entregar `input` como objeto, pero en calls dinámicos o
 * inválidos puede llegar como string JSON. Devuelve lo que haya en ambos
 * casos sin lanzar.
 */
function safeParseToolInput(input: unknown): unknown {
  if (typeof input !== 'string') return input;
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}
export type SchoolAssistantConfig = {
  /** Máximo de pasos agénticos por turno (entorno `AI_MAX_STEPS`). */
  maxSteps: number;
  /** Tiempo máximo del turno en ms (entorno `AI_TIMEOUT_MS`). */
  timeoutMs: number;
};

/**
 * Contexto mínimo del docente inyectado en cada turno del asistente para que
 * las consultas naturales ("mi clase", "mis alumnos"...) se resuelvan sin
 * pedir IDs al usuario (issue #81).
 */
export type ActiveClassContext = {
  teacherName: string;
  activeClassId: string;
  groupName: string;
  subject: string;
};

/**
 * Construye un bloque corto de texto con el contexto activo del docente para
 * inyectar en el system prompt de cada turno. Nunca pasa el dataset completo.
 */
export function buildActiveClassContext(ctx: ActiveClassContext): string {
  return [
    '',
    '## Contexto del docente',
    `- Docente: ${ctx.teacherName}`,
    `- activeClassId: ${ctx.activeClassId}`,
    `- Clase activa: ${ctx.groupName} (${ctx.subject})`,
    '',
  ].join('\n');
}

/**
 * Política anti-alucinación (issue #69):
 * - los datos escolares SIEMPRE provienen de una tool, nunca del historial
 *   ni del propio modelo;
 * - si falta un filtro esencial (clase, alumno, fecha), se pregunta antes;
 * - cero resultados se comunica tal cual, sin inventar datos;
 * - solo lectura: ninguna tool crea/edita/borra.
 */
export const SCHOOL_ASSISTANT_INSTRUCTIONS = `
Eres el asistente del docente en la aplicación TizaIA (MVP demo).

Reglas obligatorias:
1. Responde SIEMPRE en español, con frases breves y claras.
2. Los datos escolares (clases, alumnos, asistencia, tareas, anotaciones,
   correo) deben obtenerse llamando a las herramientas disponibles. Nunca
   inventes nombres, cifras ni fechas que no estén en el resultado de una
   herramienta.
3. Cuando el docente consulta datos de su clase actual sin especificar otra
   (p. ej. "mi clase", "mis alumnos", "mis tareas", "quién faltó ayer",
   "asistencia hoy"), usa el activeClassId del bloque de contexto del docente
   para pasar como classId a la herramienta correspondiente. No pidas al
   docente identificadores internos como classId, studentId o assignmentId.
   Si el docente menciona otra clase por nombre, resuélvela con listClasses
   y usa esa clase. Pide aclaración solo cuando exista ambigüedad real que
   no pueda resolverse con el contexto ni con las herramientas (por ejemplo,
   varios alumnos con el mismo nombre: lista los nombres legibles).
4. Las referencias «hoy» y «ayer» puedes pasarlas tal cual a las herramientas:
   ellas resuelven la fecha real.
5. Si una herramienta devuelve cero resultados, dilo explícitamente («no hay
   registros») sin rellenar con suposiciones.
6. Si una herramienta devuelve { error }, informa al docente de forma
   comprensible y, si procede, reintenta con otros argumentos.
7. Solo tienes capacidades de consulta: no digas nunca que has creado,
   modificado o borrado información.
`.trim();

export type AssistantTurnInput = {
  message: string;
  history: ModelMessage[];
  /**
   * Contexto mínimo del docente (activeClassId, grupo, asignatura) inyectado
   * como bloque en el system prompt para resolver consultas naturales (#81).
   */
  activeClassContext?: string;
};

/** El turno superó `AI_TIMEOUT_MS`; el endpoint lo traduce en 504 estable. */
export class AssistantTimeoutError extends Error {
  public constructor() {
    super('El asistente tardó demasiado en responder');
    this.name = 'AssistantTimeoutError';
  }
}

export type AssistantTurnResult = {
  text: string;
  /** Nombres únicos de las tools ejecutadas durante el turno. */
  toolsUsed: string[];
  /**
   * Trace del turno (issue #103): nombre + entrada de cada tool ejecutada, en
   * orden de ejecución. Solo se rellena cuando `collectTrace` es `true` en la
   * opción de entrada; por defecto no se calcula para no añadir trabajo ni
   * datos a la respuesta por defecto.
   */
  toolTrace?: Array<{ toolName: string; input: unknown }>;
  /** Mensajes generados (pasos de tool + respuesta final) para el historial. */
  responseMessages: ModelMessage[];
};

/** Ejecuta un turno completo del asistente sobre el modelo configurado. */
export async function runSchoolTurn(
  options: {
    model: LanguageModel;
    tools: ToolSet;
    config: SchoolAssistantConfig;
    /**
     * Cuando es `true`, `result.toolTrace` incluye nombre + entrada de cada
     * tool ejecutada (issue #103). Gated por el backend (env) y el header de
     * la petición en la ruta HTTP; aquí solo decide si se recolecta.
     */
    collectTrace?: boolean;
  } & AssistantTurnInput,
): Promise<AssistantTurnResult> {
  const system =
    options.activeClassContext !== undefined
      ? `${SCHOOL_ASSISTANT_INSTRUCTIONS}\n${options.activeClassContext}`
      : SCHOOL_ASSISTANT_INSTRUCTIONS;

  // AbortController propio: el timeout queda bajo nuestro control y el error
  // resultante es tipado, sin depender de cómo envuelva el aborto cada
  // proveedor/fetch.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.config.timeoutMs);
  try {
    const result = await generateText({
      model: options.model,
      system,
      messages: [
        ...options.history,
        { role: 'user', content: options.message },
      ],
      tools: options.tools,
      stopWhen: isStepCount(options.config.maxSteps),
      abortSignal: controller.signal,
    });
    const toolsUsed = [
      ...new Set(
        result.steps.flatMap((step) =>
          step.toolCalls.map((toolCall) => toolCall.toolName),
        ),
      ),
    ];
    const toolTrace =
      options.collectTrace === true
        ? result.steps.flatMap((step) =>
            step.toolCalls.map((toolCall) => ({
              toolName: toolCall.toolName,
              input:
                typeof toolCall.input === 'string'
                  ? safeParseToolInput(toolCall.input)
                  : toolCall.input,
            })),
          )
        : undefined;
    return {
      text: result.text,
      toolsUsed,
      ...(toolTrace === undefined ? {} : { toolTrace }),
      responseMessages: result.responseMessages,
    };
  } catch (error) {
    if (controller.signal.aborted) {
      throw new AssistantTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
