import cors from 'cors';
import express, { type Express } from 'express';
import type { LanguageModel } from 'ai';
import type { SchoolRepository } from './domain/schoolRepository.js';
import { SchoolService } from './application/schoolService.js';
import type { AssistantConfig } from './config/env.js';
import { ConversationStore } from './infrastructure/ai/conversationStore.js';
import { createAssistantRouter } from './infrastructure/http/routes/assistant.js';
import { createHealthRouter } from './infrastructure/http/routes/health.js';
import { createSystemRouter } from './infrastructure/http/routes/system.js';
import { createClassesRouter } from './infrastructure/http/routes/classes.js';
import { createStudentsRouter } from './infrastructure/http/routes/students.js';
import { createAttendanceRouter } from './infrastructure/http/routes/attendance.js';
import { createAssignmentsRouter } from './infrastructure/http/routes/assignments.js';
import { createAnnotationsRouter } from './infrastructure/http/routes/annotations.js';
import { createMailsRouter } from './infrastructure/http/routes/mails.js';
import {
  errorMiddleware,
  notFoundHandler,
} from './infrastructure/http/errorMiddleware.js';
import { installPerfLogging } from './infrastructure/http/perfLogging.js';

export type CreateAppAssistantOptions = {
  /** Modelo del asistente; `undefined` ⇒ `POST /v1/assistant/messages` → 503. */
  model?: LanguageModel;
  assistantConfig: Pick<
    AssistantConfig,
    'maxSteps' | 'timeoutMs' | 'conversationTtlMs' | 'conversationMaxMessages'
  >;
};

export type CreateAppOptions = {
  repository: SchoolRepository;
  corsOrigins: string[];
  demoMode: boolean;
  devResetEnabled: boolean;
  /** Logging de rendimiento HTTP opt-in (issue #104). */
  perfLogging?: boolean;
  assistant?: CreateAppAssistantOptions;
};

/**
 * Fábrica de la aplicación Express. Sin efectos secundarios: el store se
 * inyecta desde fuera (server.ts o tests), lo que permite tests de integración
 * sin red externa ni estado global. El asistente comparte el MISMO servicio
 * escolar que la API REST (AI-001): una mutación REST es visible de inmediato
 * para las tools.
 */
export function createApp(options: CreateAppOptions): Express {
  const service = new SchoolService(options.repository);
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));
  if (options.perfLogging === true) {
    installPerfLogging(app);
  }
  app.use(
    cors({
      origin:
        options.corsOrigins.includes('*') || options.corsOrigins.length === 0
          ? true
          : options.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    }),
  );
  if (options.demoMode) {
    // Modo demo explícito; no constituye una seguridad de producción.
    app.use((_req, res, next) => {
      res.setHeader('X-Demo-Mode', 'true');
      next();
    });
  }

  app.use(createHealthRouter(service));
  app.use(createSystemRouter(service, options));
  app.use(createClassesRouter(service));
  app.use(createStudentsRouter(service));
  app.use(createAttendanceRouter(service));
  app.use(createAssignmentsRouter(service));
  app.use(createAnnotationsRouter(service));
  app.use(createMailsRouter(service));

  if (options.assistant !== undefined) {
    const store = new ConversationStore({
      ttlMs: options.assistant.assistantConfig.conversationTtlMs,
      maxMessages: options.assistant.assistantConfig.conversationMaxMessages,
    });
    app.use(
      createAssistantRouter({
        service,
        store,
        toolContext: { now: () => new Date() },
        config: {
          maxSteps: options.assistant.assistantConfig.maxSteps,
          timeoutMs: options.assistant.assistantConfig.timeoutMs,
        },
        model: options.assistant.model,
      }),
    );
  }

  app.use(notFoundHandler);
  app.use(errorMiddleware);

  return app;
}
