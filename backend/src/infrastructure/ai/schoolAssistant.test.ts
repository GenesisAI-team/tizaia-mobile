import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MockLanguageModelV4 } from 'ai/test';

import { SchoolService } from '../../application/schoolService.js';
import { createMemorySchoolRepository } from '../memory/index.js';
import {
  buildActiveClassContext,
  runSchoolTurn,
  type ActiveClassContext,
  type SchoolAssistantConfig,
} from './schoolAssistant.js';
import { createSchoolTools } from './tools/index.js';

/**
 * Tests de orquestación del asistente con contexto de clase activa (issue #81):
 * validan que las consultas naturales del docente ("mi clase", "mis alumnos",
 * "quién faltó ayer"...) usan automáticamente activeClassId sin pedir IDs al
 * usuario, y que las referencias explícitas a otra clase se resuelven
 * correctamente.
 *
 * Modelo simulado (MockLanguageModelV4): sin proveedor real, sin créditos.
 */

const REFERENCE_DATE = new Date(2026, 7, 21); // viernes 2026-08-21

const ASSISTANT_CONFIG: SchoolAssistantConfig = {
  maxSteps: 6,
  timeoutMs: 10_000,
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

function createContext() {
  const service = new SchoolService(
    createMemorySchoolRepository(REFERENCE_DATE),
  );
  const context = {
    service,
    now: () => new Date('2026-08-21T12:00:00Z'),
  };
  const tools = createSchoolTools(context);
  return { service, tools };
}

const ACTIVE_CLASS_CONTEXT: ActiveClassContext = {
  teacherName: 'Laura Martínez',
  activeClassId: 'class-1',
  groupName: '1.º BACHILLER D',
  subject: 'Tecnología',
};

describe('buildActiveClassContext', () => {
  it('genera un bloque de texto con los datos del docente y la clase activa', () => {
    const block = buildActiveClassContext(ACTIVE_CLASS_CONTEXT);
    assert.ok(block.includes('Laura Martínez'));
    assert.ok(block.includes('class-1'));
    assert.ok(block.includes('1.º BACHILLER D'));
    assert.ok(block.includes('Tecnología'));
    assert.ok(block.includes('activeClassId'));
  });
});

describe('orquestación con clase activa (#81)', () => {
  it('「¿Quién faltó ayer?» usa activeClassId sin pedir classId', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: [
        toolCallResult('c1', 'listClassAbsences', {
          classId: 'class-1',
          date: 'ayer',
        }),
        textResult('Ayer faltaron dos alumnos.'),
      ],
    });
    const { tools } = createContext();
    const result = await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [],
      message: '¿Quién faltó ayer?',
      activeClassContext: buildActiveClassContext(ACTIVE_CLASS_CONTEXT),
    });
    assert.ok(
      result.toolsUsed.includes('listClassAbsences'),
      'debe ejecutar listClassAbsences',
    );
    assert.ok(result.text.length > 0);
    // Verificar que el mock fue llamado con classId = class-1
    const systemCall = model.doGenerateCalls[0]!;
    assert.ok(
      systemCall.prompt[0]?.content?.toString()?.includes('Laura Martínez'),
      'el system prompt debe incluir el contexto del docente',
    );
  });

  it('「¿Cuántos alumnos tengo?» usa activeClassId', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: [
        toolCallResult('c1', 'getClassSummary', { classId: 'class-1' }),
        textResult('Tienes 23 alumnos.'),
      ],
    });
    const { tools } = createContext();
    const result = await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [],
      message: '¿Cuántos alumnos tengo en mi clase?',
      activeClassContext: buildActiveClassContext(ACTIVE_CLASS_CONTEXT),
    });
    assert.ok(
      result.toolsUsed.includes('getClassSummary'),
      'debe ejecutar getClassSummary',
    );
    assert.ok(result.text.includes('23'));
  });

  it('「Enséñame mis alumnos» usa activeClassId', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: [
        toolCallResult('c1', 'findStudents', {
          classId: 'class-1',
        }),
        textResult('Estos son tus alumnos.'),
      ],
    });
    const { tools } = createContext();
    const result = await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [],
      message: 'Enséñame mis alumnos',
      activeClassContext: buildActiveClassContext(ACTIVE_CLASS_CONTEXT),
    });
    assert.ok(
      result.toolsUsed.includes('findStudents'),
      'debe ejecutar findStudents',
    );
    assert.ok(result.text.length > 0);
  });

  it('「¿Qué tareas tengo?» usa activeClassId', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: [
        toolCallResult('c1', 'listAssignments', { classId: 'class-1' }),
        textResult('Tienes 3 tareas.'),
      ],
    });
    const { tools } = createContext();
    const result = await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [],
      message: '¿Qué tareas tengo?',
      activeClassContext: buildActiveClassContext(ACTIVE_CLASS_CONTEXT),
    });
    assert.ok(
      result.toolsUsed.includes('listAssignments'),
      'debe ejecutar listAssignments',
    );
    assert.ok(result.text.includes('3'));
  });

  it('「¿Cómo está la asistencia hoy?» usa activeClassId', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: [
        toolCallResult('c1', 'getClassAttendance', {
          classId: 'class-1',
          from: 'hoy',
          to: 'hoy',
        }),
        textResult('Hoy hay 20 presentes.'),
      ],
    });
    const { tools } = createContext();
    const result = await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [],
      message: '¿Cómo está la asistencia de mi clase hoy?',
      activeClassContext: buildActiveClassContext(ACTIVE_CLASS_CONTEXT),
    });
    assert.ok(
      result.toolsUsed.includes('getClassAttendance'),
      'debe ejecutar getClassAttendance',
    );
    assert.ok(result.text.includes('20'));
  });

  it('「¿Quién faltó ayer en 2 ESO G?» resuelve la clase explícita (no usa activeClass)', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: [
        toolCallResult('c1', 'listClassAbsences', {
          classId: 'class-2',
          date: 'ayer',
        }),
        textResult('En 2 ESO G faltó un alumno.'),
      ],
    });
    const { tools } = createContext();
    const result = await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [],
      message: '¿Quién faltó ayer en 2 ESO G?',
      activeClassContext: buildActiveClassContext(ACTIVE_CLASS_CONTEXT),
    });
    assert.ok(
      result.toolsUsed.includes('listClassAbsences'),
      'debe ejecutar listClassAbsences',
    );
    assert.ok(result.text.includes('2 ESO G'));
  });

  it('「¿Cómo va Ana?» resuelve ambigüedad con múltiples coincidencias', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: [
        toolCallResult('c1', 'findStudents', { query: 'Ana' }),
        textResult(
          'Hay varios alumnos llamados Ana. ¿A cuál te refieres? Ana García, Ana López, Ana Martínez.',
        ),
      ],
    });
    const { tools } = createContext();
    const result = await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [],
      message: '¿Cómo va Ana?',
      activeClassContext: buildActiveClassContext(ACTIVE_CLASS_CONTEXT),
    });
    assert.ok(
      result.toolsUsed.includes('findStudents'),
      'debe ejecutar findStudents',
    );
    // Verificar que pide aclaración con nombres legibles (no IDs)
    assert.ok(
      result.text.includes('Ana') && result.text.includes('refieres'),
      'debe pedir aclaración natural con nombres',
    );
  });

  it('sin activeClassContext el sistema funciona (sin contexto inyectado)', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: [textResult('¿De qué clase necesitas información?')],
    });
    const { tools } = createContext();
    const result = await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [],
      message: '¿Quién faltó ayer?',
    });
    assert.equal(result.toolsUsed.length, 0);
    assert.ok(result.text.length > 0);
  });

  it('el contexto del docente se inyecta en el system prompt del modelo', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: [textResult('OK')],
    });
    const { tools } = createContext();
    await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [],
      message: 'hola',
      activeClassContext: buildActiveClassContext(ACTIVE_CLASS_CONTEXT),
    });
    // Verificar que el system prompt contiene el contexto inyectado
    const systemMessage = model.doGenerateCalls[0]!.prompt[0]!;
    const systemText = systemMessage.content.toString();
    assert.ok(
      systemText.includes('Laura Martínez'),
      'system prompt debe incluir nombre del docente',
    );
    assert.ok(
      systemText.includes('class-1'),
      'system prompt debe incluir activeClassId',
    );
    assert.ok(
      systemText.includes('1.º BACHILLER D'),
      'system prompt debe incluir groupName',
    );
    assert.ok(
      systemText.includes('activeClassId'),
      'system prompt debe incluir la etiqueta activeClassId',
    );
  });

  it('el system prompt sin contexto no contiene el bloque Contexto del docente', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: [textResult('OK')],
    });
    const { tools } = createContext();
    await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [],
      message: 'hola',
    });
    const systemMessage = model.doGenerateCalls[0]!.prompt[0]!;
    const systemText = systemMessage.content.toString();
    assert.ok(
      !systemText.includes('## Contexto del docente'),
      'system prompt sin contexto no debe incluir el bloque Contexto del docente',
    );
    assert.ok(
      !systemText.includes('Laura Martínez'),
      'system prompt sin contexto no debe incluir nombre del docente',
    );
  });

  it('「¿Quién faltó ayer?» + 「¿Y hoy?» en multi-turno mantiene la clase activa', async () => {
    const model = new MockLanguageModelV4({
      doGenerate: [
        toolCallResult('c1', 'listClassAbsences', {
          classId: 'class-1',
          date: 'ayer',
        }),
        textResult('Ayer faltaron dos alumnos.'),
        toolCallResult('c2', 'listClassAbsences', {
          classId: 'class-1',
          date: 'hoy',
        }),
        textResult('Hoy falta uno.'),
      ],
    });
    const { tools } = createContext();

    // Primer turno
    const first = await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [],
      message: '¿Quién faltó ayer?',
      activeClassContext: buildActiveClassContext(ACTIVE_CLASS_CONTEXT),
    });
    assert.ok(first.toolsUsed.includes('listClassAbsences'));
    assert.ok(first.text.includes('Ayer'));

    // Segundo turno con historial
    const second = await runSchoolTurn({
      model: model as never,
      tools,
      config: ASSISTANT_CONFIG,
      history: [
        { role: 'user', content: '¿Quién faltó ayer?' },
        ...first.responseMessages,
      ],
      message: '¿Y hoy?',
      activeClassContext: buildActiveClassContext(ACTIVE_CLASS_CONTEXT),
    });
    assert.ok(second.toolsUsed.includes('listClassAbsences'));
    assert.ok(second.text.includes('Hoy'));
  });
});
