import { InMemorySchoolRepository } from './inMemorySchoolRepository';

/**
 * Crea un repositorio demo en memoria. El ensamblado se decide en la raíz de
 * la aplicación (composition root en App.tsx); en el hito de integración se
 * sustituirá esta fábrica por una implementación sobre Supabase sin tocar las
 * pantallas.
 */
export function createInMemorySchoolRepository(
  referenceDate?: Date,
): InMemorySchoolRepository {
  return new InMemorySchoolRepository(referenceDate ?? new Date());
}
