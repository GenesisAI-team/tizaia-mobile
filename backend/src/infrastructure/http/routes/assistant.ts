import { Router } from 'express';
import type { LanguageModel } from 'ai';
import { z } from 'zod';

import { AppError, NotFoundError } from '../../../application/errors.js';
import type { SchoolService } from '../../../application/schoolService.js';
import type { ConversationStore } from '../../ai/conversationStore.js';
import {
  AssistantTimeoutError,
  buildActiveClassContext,
  runSchoolTurn,
  type SchoolAssistantConfig,
} from '../../ai/schoolAssistant.js';
import {
  createSchoolTools,
  type SchoolToolContext,
} from '../../ai/tools/index.js';
import { parseWith } from '../validation.js';

/** Contrato inicial no streaming de `POST /v1/assistant/messages` (RFC-001 §7). */
const postAssistantMessageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  conversationId: z.string().min(1).optional(),
});

export type AssistantRouterDeps = {
  service: SchoolService;
  store: ConversationStore;
  toolContext: Omit<SchoolToolContext, 'service'>;
  config: SchoolAssistantConfig;
  /** `undefined` = asistente sin configurar → el endpoint responde 503. */
  model?: LanguageModel;
};

/**
 * Rutas del asistente bajo `/v1`. Errores estables y sin filtrar detalles
 * internos del proveedor (RFC-001 §8): timeout → 504, resto de fallos del
 * proveedor → 502 genérico; payload inválido → 400 vía error de validación.
 */
export function createAssistantRouter(deps: AssistantRouterDeps): Router {
  const router = Router();
  const tools = createSchoolTools({
    service: deps.service,
    ...deps.toolContext,
  });

  router.post('/v1/assistant/messages', async (req, res, next) => {
    try {
      const input = parseWith(postAssistantMessageSchema, req.body);
      if (deps.model === undefined) {
        throw new AppError(
          'ASSISTANT_UNAVAILABLE',
          'El asistente no está configurado en este entorno',
          503,
        );
      }

      const conversation =
        input.conversationId === undefined
          ? deps.store.create()
          : deps.store.get(input.conversationId);
      if (conversation === undefined) {
        throw new NotFoundError('Conversación no encontrada o expirada');
      }

      let turn;
      try {
        const me = await deps.service.me();
        let activeClassContext: string | undefined;
        if (
          me.activeClass !== undefined &&
          typeof me.teacher === 'object' &&
          me.teacher !== null
        ) {
          const teacher = me.teacher as { name?: string };
          activeClassContext = buildActiveClassContext({
            teacherName: teacher.name ?? '',
            activeClassId: me.activeClass.id,
            groupName: me.activeClass.groupName,
            subject: me.activeClass.subject,
          });
        }
        turn = await runSchoolTurn({
          model: deps.model,
          tools,
          config: deps.config,
          history: conversation.messages,
          message: input.message,
          activeClassContext,
        });
      } catch (error) {
        if (error instanceof AssistantTimeoutError) {
          throw new AppError(
            'ASSISTANT_TIMEOUT',
            'El asistente tardó demasiado en responder. Inténtalo de nuevo.',
            504,
          );
        }
        throw new AppError(
          'ASSISTANT_PROVIDER_ERROR',
          'No se pudo generar la respuesta del asistente. Inténtalo de nuevo.',
          502,
        );
      }

      deps.store.append(conversation.id, [
        { role: 'user', content: input.message },
        ...turn.responseMessages,
      ]);

      res.json({
        conversationId: conversation.id,
        message: turn.text,
        metadata: { toolsUsed: turn.toolsUsed },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
