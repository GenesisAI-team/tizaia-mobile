import { Router } from 'express';
import type { SchoolService } from '../../../application/schoolService.js';
import { NotFoundError } from '../../../application/errors.js';

/**
 * Rutas de sistema bajo `/v1`: bootstrap agregado, perfil docente y reset de
 * desarrollo (este último solo existe cuando ENABLE_DEV_RESET=true).
 */
export function createSystemRouter(
  service: SchoolService,
  options: { devResetEnabled: boolean },
): Router {
  const router = Router();

  // Grafo coherente con todos los dominios del MVP para hidratar el móvil.
  router.get('/v1/bootstrap', (_req, res) => {
    res.json(service.getBootstrap());
  });

  // Docente activo y clase activa actual.
  router.get('/v1/me', (_req, res) => {
    res.json(service.me());
  });

  // Solo desarrollo: restaura el seed determinista.
  router.post('/v1/dev/reset', (_req, res) => {
    if (!options.devResetEnabled) {
      throw new NotFoundError('Endpoint no disponible en este entorno');
    }
    service.resetStore();
    res.json({ status: 'reset' });
  });

  return router;
}
