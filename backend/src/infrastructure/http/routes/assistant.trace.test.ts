import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { LanguageModel } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';

import type { AssistantConfig } from '../../../config/env.js';
import {
  jsonInit,
  startTestServer,
  type TestServer,
} from '../../../test/helpers.js';

type AnyRecord = Record<string, any>;

const ASSISTANT_CONFIG: Pick<
  AssistantConfig,
  'maxSteps' | 'timeoutMs' | 'conversationTtlMs' | 'conversationMaxMessages'
> = {
  maxSteps: 6,
  timeoutMs: 5_000,
  conversationTtlMs: 60_000,
  conversationMaxMessages: 24,
};

const usage = {
  inputTokens: {
    total: 10,
    noCache: 10,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 20, text: 20, reasoning: undefined },
};

function toolCallResult(toolCallId: string, toolName: string, input: unknown) {
  return {
    content: [
      {
        type: 'tool-call' as const,
        toolCallId,
        toolName,
        input: JSON.stringify(input),
      },
    ],
    finishReason: { unified: 'tool-calls' as const, raw: undefined },
    usage,
    warnings: [],
  };
}

function textResult(text: string) {
  return {
    content: [{ type: 'text' as const, text }],
    finishReason: { unified: 'stop' as const, raw: undefined },
    usage,
    warnings: [],
  };
}

const TRACE_INPUT = { classId: 'class-1', date: 'ayer' };

function buildServer(traceEnabled: boolean): Promise<TestServer> {
  const model = new MockLanguageModelV4({
    doGenerate: [
      toolCallResult('call-trace', 'listClassAbsences', TRACE_INPUT),
      textResult('Ayer faltaron dos alumnos.'),
    ],
  });
  return startTestServer({
    assistant: {
      model: model as unknown as LanguageModel,
      assistantConfig: ASSISTANT_CONFIG,
      traceEnabled,
    },
  });
}

/**
 * Gate de trace (issue #103): el trace solo aparece con ASSISTANT_TRACE_ENABLED
 * EN EL BACKEND y el header `x-assistant-trace` en la petición. La respuesta
 * por defecto no cambia.
 */
describe('POST /v1/assistant/messages · gate de trace (issue #103)', () => {
  it('con header x-assistant-trace añade metadata.trace (nombre + entrada)', async () => {
    const server = await buildServer(true);
    try {
      const response = await server.requestJson<AnyRecord>(
        '/v1/assistant/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-assistant-trace': 'true',
          },
          body: JSON.stringify({ message: '¿Quién faltó ayer?' }),
        },
      );
      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.body.metadata.trace));
      assert.equal(
        response.body.metadata.trace[0].toolName,
        'listClassAbsences',
      );
      assert.deepEqual(response.body.metadata.trace[0].input, TRACE_INPUT);
      // toolsUsed se mantiene igual que sin trace.
      assert.deepEqual(response.body.metadata.toolsUsed, ['listClassAbsences']);
    } finally {
      await server.close();
    }
  });

  it('sin header x-assistant-trace NO incluye trace (respuesta por defecto)', async () => {
    const server = await buildServer(true);
    try {
      const response = await server.requestJson<AnyRecord>(
        '/v1/assistant/messages',
        jsonInit('POST', { message: '¿Quién faltó ayer?' }),
      );
      assert.equal(response.status, 200);
      assert.equal(response.body.metadata.trace, undefined);
      assert.deepEqual(response.body.metadata.toolsUsed, ['listClassAbsences']);
    } finally {
      await server.close();
    }
  });

  it('con ASSISTANT_TRACE_ENABLED=false (por defecto) el header NO activa trace', async () => {
    const server = await buildServer(false);
    try {
      const response = await server.requestJson<AnyRecord>(
        '/v1/assistant/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-assistant-trace': 'true',
          },
          body: JSON.stringify({ message: '¿Quién faltó ayer?' }),
        },
      );
      assert.equal(response.status, 200);
      assert.equal(response.body.metadata.trace, undefined);
      assert.deepEqual(response.body.metadata.toolsUsed, ['listClassAbsences']);
    } finally {
      await server.close();
    }
  });
});
