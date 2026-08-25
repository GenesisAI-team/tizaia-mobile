import { z } from 'zod';

import { AppError } from '../../../application/errors.js';
import type { SchoolService } from '../../../application/schoolService.js';
import type { ModelMessage } from 'ai';

/** Contexto compartido por todas las tools del asistente (AI-001). */
export type SchoolToolContext = {
  /** Mismos servicios de aplicación que consume la API REST (#67). */
  service: SchoolService;
  /**
   * Reloj inyectable para resolver «hoy/ayer» con `Europe/Madrid` de forma
   * determinista en pruebas.
   */
  now: () => Date;
};

/**
 * Envoltura de errores de dominio normalizada: si una tool falla (p. ej. id
 * inexistente elegido por el modelo), el modelo recibe `{ error }` y puede
 * corregir o informar sin que la petición HTTP completa se caiga.
 */
export type ToolFailure = {
  error: { code: string; message: string };
};

export async function runTool<T>(
  fn: () => Promise<T>,
): Promise<T | ToolFailure> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof AppError) {
      return { error: { code: error.code, message: error.message } };
    }
    return {
      error: {
        code: 'TOOL_ERROR',
        message: 'No se pudo completar la consulta',
      },
    };
  }
}

/** Límite por defecto de elementos listados en una salida de tool. */
export const DEFAULT_LIST_LIMIT = 20;

/** Límite máximo aceptado como `limit` de entrada. */
export const MAX_LIST_LIMIT = 50;

/**
 * El AI SDK valida la entrada contra JSON-Schema y NO aplica los
 * `.default()` de Zod antes de `execute`: los valores por defecto se
 * resuelven aquí, de forma explícita y testeable.
 */
export const resolveLimit = (
  value: number | undefined,
  fallback: number = DEFAULT_LIST_LIMIT,
): number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0
    ? Math.min(value, MAX_LIST_LIMIT)
    : fallback;

/** Esquema común del parámetro `limit` (opcional; por defecto en runtime). */
export const limitSchema = (): z.ZodOptional<z.ZodNumber> =>
  z
    .number()
    .int()
    .min(1)
    .max(MAX_LIST_LIMIT)
    .optional()
    .describe(`Máximo de elementos (por defecto ${DEFAULT_LIST_LIMIT})`);

/** Recorta un listado al límite indicado conservando el orden recibido. */
export function capList<T>(items: T[], limit: number): T[] {
  return items.slice(0, Math.max(0, limit));
}

/** Entrada de historial lista para el store: user + respuesta del turno. */
export function historyEntry(
  message: string,
  responseMessages: ModelMessage[],
): ModelMessage[] {
  return [{ role: 'user', content: message }, ...responseMessages];
}
