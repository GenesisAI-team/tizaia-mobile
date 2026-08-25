import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import type { LanguageModel } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';

import type { AssistantConfig } from '../../../config/env.js';
import {
  FIRST_SCHOOL_DAY,
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

function textResult(text: string) {
  return {
    content: [{ type: 'text' as const, text }],
    finishReason: { unified: 'stop' as const, raw: undefined },
    usage,
    warnings: [],
  };
}

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

describe('POST /v1/assistant/messages (integración con modelo simulado)', () => {
  let server: TestServer;

  before(async () => {
    // Secuencia de turnos: (1) tool + redacción, (2) continuación en dos
    // POST, (3) consulta tras mutación REST que debe disparar una tool real.
    // Un turno consume 1-2 llamadas al modelo (toolCall + texto final).
    const model = new MockLanguageModelV4({
      doGenerate: [
        toolCallResult('call-1', 'listClassAbsences', {
          classId: 'class-1',
          date: 'ayer',
        }),
        textResult('Ayer faltaron dos alumnos en 1.º BACHILLER D.'),
        toolCallResult('call-2', 'countUnreadMails', { folder: 'inbox' }),
        textResult('Tienes correos sin leer en la bandeja de entrada.'),
        textResult('De nada. ¿Algo más sobre tu bandeja?'),
        toolCallResult('call-3', 'listClassAbsences', {
          classId: 'class-1',
          date: FIRST_SCHOOL_DAY,
        }),
        textResult('Hecho: he consultado la lista actualizada de ausentes.'),
      ],
    });
    server = await startTestServer({
      assistant: {
        model: model as unknown as LanguageModel,
        assistantConfig: ASSISTANT_CONFIG,
      },
    });
  });

  after(async () => {
    await server.close();
  });

  it('responde 503 estable cuando el asistente no está configurado', async () => {
    const unconfigured = await startTestServer({
      assistant: { assistantConfig: ASSISTANT_CONFIG },
    });
    try {
      const response = await unconfigured.requestJson<AnyRecord>(
        '/v1/assistant/messages',
        jsonInit('POST', { message: '¿Quién faltó ayer?' }),
      );
      assert.equal(response.status, 503);
      assert.equal(response.body.error.code, 'ASSISTANT_UNAVAILABLE');
    } finally {
      await unconfigured.close();
    }
  });

  it('ejecuta una tool de lectura y devuelve conversationId + metadata.toolsUsed', async () => {
    const response = await server.requestJson<AnyRecord>(
      '/v1/assistant/messages',
      jsonInit('POST', { message: '¿Quién faltó ayer en mi clase?' }),
    );
    assert.equal(response.status, 200);
    assert.ok(typeof response.body.conversationId === 'string');
    assert.match(String(response.body.message), /Ayer faltaron/);
    assert.deepEqual(response.body.metadata.toolsUsed, ['listClassAbsences']);
  });

  it('continúa una conversación válida mediante conversationId', async () => {
    const first = await server.requestJson<AnyRecord>(
      '/v1/assistant/messages',
      jsonInit('POST', { message: '¿Cuántos correos sin leer tengo?' }),
    );
    assert.equal(first.status, 200);
    const second = await server.requestJson<AnyRecord>(
      '/v1/assistant/messages',
      jsonInit('POST', {
        message: 'Gracias',
        conversationId: first.body.conversationId,
      }),
    );
    assert.equal(second.status, 200);
    assert.equal(second.body.conversationId, first.body.conversationId);
  });

  it('responde 404 para una conversación inexistente o expirada', async () => {
    const response = await server.requestJson<AnyRecord>(
      '/v1/assistant/messages',
      jsonInit('POST', {
        message: 'Hola',
        conversationId: 'no-existe',
      }),
    );
    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, 'NOT_FOUND');
  });

  it('responde 400 para payload inválido', async () => {
    const empty = await server.requestJson<AnyRecord>(
      '/v1/assistant/messages',
      jsonInit('POST', { message: '' }),
    );
    assert.equal(empty.status, 400);
    assert.equal(empty.body.error.code, 'VALIDATION_ERROR');
    const missing = await server.requestJson<AnyRecord>(
      '/v1/assistant/messages',
      jsonInit('POST', {}),
    );
    assert.equal(missing.status, 400);
  });

  it('las tools leen el mismo store que la API REST (mutación visible)', async () => {
    // Mutación REST directa sobre el MISMO servidor y servicio.
    const students = await server.requestJson<AnyRecord[]>(
      '/v1/classes/class-1/students',
    );
    const studentId = (students.body as AnyRecord[])[0]!.id as string;
    const put = await server.request(
      `/v1/attendance/class-1/${studentId}/${FIRST_SCHOOL_DAY}`,
      jsonInit('PUT', { status: 'absent' }),
    );
    assert.equal(put.status, 200);
    // El turno siguiente usa la misma instancia de servicio: sin reinicio,
    // las tools ven exactamente lo que la API escribió.
    // El modelo simulado debe ejecutar una tool real (no texto hardcodeado)
    // y la tool debe devolver el estado mutado.
    const response = await server.requestJson<AnyRecord>(
      '/v1/assistant/messages',
      jsonInit('POST', {
        message: `¿Quién faltó el ${FIRST_SCHOOL_DAY} en class-1?`,
      }),
    );
    assert.equal(response.status, 200);
    assert.ok(
      Array.isArray(response.body.metadata.toolsUsed) &&
        response.body.metadata.toolsUsed.includes('listClassAbsences'),
      'el asistente debe haber ejecutado listClassAbsences tras la mutación',
    );
    assert.match(String(response.body.message), /lista actualizada/);
    // Verificación adicional: la mutación es visible también vía REST directa.
    const attendance = await server.requestJson<AnyRecord[]>(
      `/v1/classes/class-1/attendance?from=${FIRST_SCHOOL_DAY}&to=${FIRST_SCHOOL_DAY}`,
    );
    const mutated = (attendance.body as AnyRecord[]).find(
      (record) => record.studentId === studentId,
    ) as AnyRecord | undefined;
    assert.ok(mutated, 'el registro mutado debe existir');
    assert.equal(mutated.status, 'absent');
  });
});

describe('errores del proveedor del asistente', () => {
  it('mapea timeout a 504 ASSISTANT_TIMEOUT y fallo de proveedor a 502 sin filtrar detalles', async () => {
    const flaky = new MockLanguageModelV4({
      doGenerate: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error('fallo interno del proveedor');
      },
    });

    const timeoutServer = await startTestServer({
      assistant: {
        model: flaky as unknown as LanguageModel,
        assistantConfig: { ...ASSISTANT_CONFIG, timeoutMs: 30 },
      },
    });
    try {
      const timeoutResponse = await timeoutServer.requestJson<AnyRecord>(
        '/v1/assistant/messages',
        jsonInit('POST', { message: 'hola' }),
      );
      assert.equal(timeoutResponse.status, 504);
      assert.equal(timeoutResponse.body.error.code, 'ASSISTANT_TIMEOUT');
    } finally {
      await timeoutServer.close();
    }

    const providerErrorServer = await startTestServer({
      assistant: {
        model: flaky as unknown as LanguageModel,
        assistantConfig: ASSISTANT_CONFIG,
      },
    });
    try {
      const providerError = await providerErrorServer.requestJson<AnyRecord>(
        '/v1/assistant/messages',
        jsonInit('POST', { message: 'hola' }),
      );
      assert.equal(providerError.status, 502);
      assert.equal(providerError.body.error.code, 'ASSISTANT_PROVIDER_ERROR');
      // Sin filtrar detalles internos del proveedor.
      assert.ok(!JSON.stringify(providerError.body).includes('fallo interno'));
    } finally {
      await providerErrorServer.close();
    }
  });
});
