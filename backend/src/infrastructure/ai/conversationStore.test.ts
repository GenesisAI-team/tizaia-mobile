import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ModelMessage } from 'ai';

import { ConversationStore } from './conversationStore.js';

function createFakeClock(startMs = 1_000_000): {
  now: () => number;
  advance: (ms: number) => void;
} {
  let current = startMs;
  return {
    now: () => current,
    advance: (ms) => {
      current += ms;
    },
  };
}

const OPTIONS = { ttlMs: 60_000, maxMessages: 4 };

describe('ConversationStore', () => {
  it('crea conversaciones con ids opacos y únicos', () => {
    const store = new ConversationStore(OPTIONS);
    const first = store.create();
    const second = store.create();
    assert.notEqual(first.id, second.id);
    assert.equal(first.messages.length, 0);
    assert.ok(first.id.length >= 16);
  });

  it('recupera una conversación válida y añade mensajes respetando el límite', () => {
    const store = new ConversationStore(OPTIONS);
    const conversation = store.create();
    for (let index = 0; index < 6; index += 1) {
      store.append(conversation.id, [
        { role: 'user', content: `mensaje ${index}` },
      ]);
    }
    const stored = store.get(conversation.id)!;
    assert.ok(stored !== undefined);
    // Recorte por cabeza: se conservan los últimos `maxMessages`.
    assert.equal(stored.messages.length, 4);
    assert.deepEqual(stored.messages.at(-1), {
      role: 'user',
      content: 'mensaje 5',
    });
  });

  it('devuelve undefined y elimina la conversación expirada por TTL', () => {
    const clock = createFakeClock();
    const store = new ConversationStore(OPTIONS, clock.now);
    const conversation = store.create();
    clock.advance(61_000);
    assert.equal(store.get(conversation.id), undefined);
    // La purga perezosa también la elimina del mapa.
    clock.advance(-1_000); // dentro de TTL otra vez
    assert.equal(store.get(conversation.id), undefined);
  });

  it('no recupera ids desconocidos (sin compartir estado)', () => {
    const storeA = new ConversationStore(OPTIONS);
    const storeB = new ConversationStore(OPTIONS);
    const conversation = storeA.create();
    assert.equal(storeB.get(conversation.id), undefined);
    assert.equal(storeA.get('inventado'), undefined);
  });

  it('no corta turnos a medias ni deja tool huérfano al superar el límite', () => {
    // Turno = user + assistant(toolCall) + tool + assistant(final) → 4 mensajes.
    // Con maxMessages=5 y dos turnos completos (8 mensajes), slice(-5) dejaría
    // un assistant huérfano; el store debe ajustar al siguiente user.
    const store = new ConversationStore({ ttlMs: 60_000, maxMessages: 5 });
    const conversation = store.create();
    const turn = (label: string): ModelMessage[] =>
      [
        { role: 'user', content: `${label} pregunta` },
        {
          role: 'assistant',
          content: [
            {
              type: 'tool-call',
              toolCallId: `${label}-call`,
              toolName: 'listClassAbsences',
              input: '{}',
            },
          ],
        },
        {
          role: 'tool',
          content: [
            {
              type: 'tool-result',
              toolCallId: `${label}-call`,
              toolName: 'listClassAbsences',
              output: { count: 2 },
            },
          ],
        },
        { role: 'assistant', content: `${label} respuesta` },
      ] as ModelMessage[];
    store.append(conversation.id, turn('turn1') as any);
    store.append(conversation.id, turn('turn2') as any);
    const stored = store.get(conversation.id)!;
    // Debe empezar siempre en un user y nunca en tool/assistant huérfano.
    assert.equal(stored.messages[0]!.role, 'user');
    assert.ok(
      stored.messages.every((msg, idx) => {
        if (msg.role === 'tool') {
          // Un tool nunca puede ser el primero ni venir tras un user directo
          // sin un assistant con toolCall previo dentro del mismo turno.
          if (idx === 0) return false;
          const prev = stored.messages[idx - 1]!;
          // El anterior debe ser assistant con toolCall o tool encadenado;
          // basta con no ser user aislado.
          return prev.role !== 'user';
        }
        return true;
      }),
    );
    // Caso crítico: slice(-5) sobre 8 habría empezado en assistant; ahora empieza en turn2 (4 msgs).
    assert.equal(stored.messages.length, 4);
    assert.equal((stored.messages[0] as any).content, 'turn2 pregunta');
  });

  it('si un solo turno supera el límite, conserva el turno completo', () => {
    const store = new ConversationStore({ ttlMs: 60_000, maxMessages: 3 });
    const conversation = store.create();
    const longTurn = [
      { role: 'user', content: 'pregunta larga' },
      {
        role: 'assistant',
        content: [
          {
            type: 'tool-call',
            toolCallId: 'c1',
            toolName: 'getClassAttendance',
            input: '{}',
          },
        ],
      },
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'c1',
            toolName: 'getClassAttendance',
            output: {},
          },
        ],
      },
      { role: 'assistant', content: 'respuesta larga' },
    ] as any;
    store.append(conversation.id, longTurn);
    const stored = store.get(conversation.id)!;
    assert.equal(stored.messages[0]!.role, 'user');
    assert.equal(stored.messages.length, 4);
  });
});
