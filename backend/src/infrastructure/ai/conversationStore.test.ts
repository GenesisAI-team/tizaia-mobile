import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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
});
