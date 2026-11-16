import { Router } from 'express';

/**
 * `GET /health` — sonda de vida usada también por el healthcheck Docker.
 * GEN-43: sin dependencia de `SchoolService`/`SchoolRepository`; solo estado
 * operativo (`status`, `uptimeSeconds`, `demo` derivado del modo demo real).
 * Ningún dato docente, IDs escolares ni PII en el cuerpo, logs ni headers.
 */
export function createHealthRouter(options: { demoMode: boolean }): Router {
  const router = Router();
  const startedAt = Date.now();

  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      demo: options.demoMode,
    });
  });

  return router;
}
