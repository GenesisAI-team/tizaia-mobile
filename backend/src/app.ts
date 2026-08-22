import cors from 'cors';
import express, { type Express } from 'express';
import type { SchoolRepository } from './domain/schoolRepository.js';
import { SchoolService } from './application/schoolService.js';
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

export type CreateAppOptions = {
  repository: SchoolRepository;
  corsOrigins: string[];
  demoMode: boolean;
  devResetEnabled: boolean;
};

/**
 * Fábrica de la aplicación Express. Sin efectos secundarios: el store se
 * inyecta desde fuera (server.ts o tests), lo que permite tests de integración
 * sin red externa ni estado global.
 */
export function createApp(options: CreateAppOptions): Express {
  const service = new SchoolService(options.repository);
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));
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

  app.use(notFoundHandler);
  app.use(errorMiddleware);

  return app;
}
