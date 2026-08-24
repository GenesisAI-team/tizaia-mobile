import { randomUUID } from 'node:crypto';

import type { ModelMessage } from 'ai';

/**
 * Historial de conversaciones del asistente EN MEMORIA (RFC-001 §6): store
 * independiente del store escolar pero dentro del mismo proceso. Reiniciar o
 * escalar el proceso elimina conversaciones; la persistencia llega con
 * Supabase por sustitución de adaptador, no aquí.
 */
export type Conversation = {
  /** Identificador opaco y no predecible (UUID v4). */
  id: string;
  messages: ModelMessage[];
  updatedAt: number;
};

export type ConversationStoreOptions = {
  /** Antigüedad máxima antes de considerar una conversación expirada. */
  ttlMs: number;
  /** Límite de mensajes conservados por conversación (recorte por cabeza). */
  maxMessages: number;
};

export class ConversationStore {
  private readonly conversations = new Map<string, Conversation>();

  public constructor(
    private readonly options: ConversationStoreOptions,
    private readonly now: () => number = Date.now,
    private readonly createId: () => string = randomUUID,
  ) {}

  /** Crea una conversación vacía y purga expiradas para acotar memoria. */
  public create(): Conversation {
    this.purgeExpired();
    const conversation: Conversation = {
      id: this.createId(),
      messages: [],
      updatedAt: this.now(),
    };
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  /**
   * Recupera una conversación válida. Devuelve `undefined` si no existe o
   * expiró (el endpoint traduce esto en `404 CONVERSATION_NOT_FOUND`).
   */
  public get(conversationId: string): Conversation | undefined {
    const conversation = this.conversations.get(conversationId);
    if (conversation === undefined) {
      return undefined;
    }
    if (this.now() - conversation.updatedAt > this.options.ttlMs) {
      this.conversations.delete(conversationId);
      return undefined;
    }
    return conversation;
  }

  /** Añade mensajes a una conversación existente y aplica el límite. */
  public append(conversationId: string, messages: ModelMessage[]): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation === undefined || messages.length === 0) {
      return;
    }
    conversation.messages.push(...messages);
    if (conversation.messages.length > this.options.maxMessages) {
      conversation.messages = conversation.messages.slice(
        -this.options.maxMessages,
      );
    }
    conversation.updatedAt = this.now();
  }

  private purgeExpired(): void {
    for (const [id, conversation] of this.conversations) {
      if (this.now() - conversation.updatedAt > this.options.ttlMs) {
        this.conversations.delete(id);
      }
    }
  }
}
