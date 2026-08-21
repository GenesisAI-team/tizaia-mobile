import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../application/errors.js';

/** Envolvente estable de errores exigida por la issue #67. */
export function errorEnvelope(
  code: string,
  message: string,
  details: readonly string[] = [],
): Record<string, unknown> {
  return {
    error: {
      code,
      message,
      details: [...details],
    },
  };
}

/** 404 JSON para rutas no definidas. */
export const notFoundHandler: RequestHandler = (req, res) => {
  res
    .status(404)
    .json(
      errorEnvelope(
        'NOT_FOUND',
        `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      ),
    );
};

/**
 * Manejo centralizado de errores: Zod → 400, AppError → su estado, JSON
 * malformado → 400, resto → 500 sin filtrar datos sensibles en logs.
 */
export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof AppError) {
    res
      .status(error.httpStatus)
      .json(errorEnvelope(error.code, error.message, error.details));
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json(
      errorEnvelope(
        'VALIDATION_ERROR',
        'Solicitud no válida',
        error.issues.map(
          (issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`,
        ),
      ),
    );
    return;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    (error as { type?: string }).type === 'entity.parse.failed'
  ) {
    res
      .status(400)
      .json(errorEnvelope('VALIDATION_ERROR', 'Cuerpo JSON malformado'));
    return;
  }
  // Log mínimo sin datos docentes sensibles.
  console.error(
    JSON.stringify({
      level: 'error',
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Error desconocido',
    }),
  );
  res
    .status(500)
    .json(errorEnvelope('INTERNAL_ERROR', 'Error interno del servidor'));
};
