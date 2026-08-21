import type { ZodType } from 'zod';
import { ValidationError } from '../../application/errors.js';

/**
 * Valida datos de entrada con Zod y lanza el error de dominio correspondiente
 * con detalles legibles por campo.
 */
export function parseWith<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      'Solicitud no válida',
      result.error.issues.map(
        (issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`,
      ),
    );
  }
  return result.data;
}
