import { Router } from 'express';
import type { SchoolService } from '../../../application/schoolService.js';

/** `GET /health` — sonda de vida usada también por el healthcheck Docker. */
export function createHealthRouter(service: SchoolService): Router {
  const router = Router();
  const startedAt = Date.now();

  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      teacher: service.me().teacher,
      demo: true,
    });
  });

  return router;
}
