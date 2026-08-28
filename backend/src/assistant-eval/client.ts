import { performance } from 'node:perf_hooks';
import type { TurnObservation } from './types.js';

/**
 * Cliente HTTP del eval (issue #103).
 *
 * - `fetch` nativo de Node 22 (sin dependencias).
 * - Latencia con `performance.now()` (monotónico, no reloj de pared).
 * - Timeout con `AbortSignal.timeout`.
 * - SIEMPRE envía el header `x-assistant-trace: true`; el backend solo lo
 *   honra si además tiene `ASSISTANT_TRACE_ENABLED=true` y, en ese caso,
 *   devuelve `metadata.trace` (nombre + entrada de cada tool).
 */

export type EvalClientDeps = {
  baseUrl: string;
  timeoutMs: number;
  /** Inyectable para tests (sin red real). Default: `globalThis.fetch`. */
  fetchImpl?: typeof fetch;
};

export type RunTurnInput = {
  message: string;
  conversationId?: string;
};

function parseToolTrace(
  value: unknown,
): Array<{ toolName: string; input: unknown }> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): Array<{ toolName: string; input: unknown }> => {
    if (typeof entry !== 'object' || entry === null) return [];
    const record = entry as Record<string, unknown>;
    if (typeof record['toolName'] !== 'string') return [];
    return [{ toolName: record['toolName'], input: record['input'] }];
  });
}

export async function runTurn(
  deps: EvalClientDeps,
  input: RunTurnInput,
  index: number,
): Promise<TurnObservation> {
  const startedAt = performance.now();
  const body: Record<string, unknown> = { message: input.message };
  if (input.conversationId !== undefined) {
    body['conversationId'] = input.conversationId;
  }

  // Veredicto por defecto si algo falla antes de tener respuesta.
  const base: TurnObservation = {
    index,
    prompt: input.message,
    conversationId: input.conversationId,
    status: 0,
    ok: false,
    toolsUsed: [],
    toolTrace: [],
    text: '',
  };

  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  try {
    const res = await fetchImpl(
      `${deps.baseUrl.replace(/\/$/, '')}/v1/assistant/messages`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-assistant-trace': 'true',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(deps.timeoutMs),
      },
    );
    const latencyMs = performance.now() - startedAt;

    let payload: Record<string, unknown> | null = null;
    try {
      payload = (await res.json()) as Record<string, unknown>;
    } catch {
      payload = null;
    }

    const metadata =
      typeof payload?.['metadata'] === 'object' && payload['metadata'] !== null
        ? (payload['metadata'] as Record<string, unknown>)
        : {};

    const toolsUsedRaw = Array.isArray(metadata['toolsUsed'])
      ? (metadata['toolsUsed'] as unknown[])
      : [];

    const toolsUsed = toolsUsedRaw.filter(
      (t): t is string => typeof t === 'string',
    );

    const text =
      typeof payload?.['message'] === 'string' ? payload['message'] : '';

    return {
      ...base,
      status: res.status,
      ok: res.ok,
      latencyMs,
      conversationId:
        typeof payload?.['conversationId'] === 'string'
          ? payload['conversationId']
          : input.conversationId,
      toolsUsed,
      toolTrace: parseToolTrace(metadata['trace']),
      text,
      ...(res.ok
        ? {}
        : { errorKind: 'http' as const, errorMessage: `HTTP ${res.status}` }),
    };
  } catch (error) {
    const latencyMs = performance.now() - startedAt;
    const isTimeout =
      error instanceof DOMException && error.name === 'TimeoutError';

    return {
      ...base,
      latencyMs,
      errorKind: isTimeout ? 'timeout' : 'network',
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}
