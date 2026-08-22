import { MemorySchoolRepository } from './memorySchoolRepository.js';

/**
 * Fábrica del repositorio en memoria. En `server.ts` se crea UNA instancia por
 * proceso y se inyecta en la aplicación; los tests crean instancias
 * independientes con fecha de referencia fija para ser deterministas.
 */
export function createMemorySchoolRepository(
  referenceDate?: Date,
): MemorySchoolRepository {
  return new MemorySchoolRepository(referenceDate ?? new Date());
}

export { MemorySchoolRepository };
