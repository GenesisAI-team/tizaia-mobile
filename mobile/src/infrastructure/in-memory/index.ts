import { InMemorySchoolRepository } from './inMemorySchoolRepository';

/**
 * Instancia única del repositorio demo. Se crea al arrancar la app tomando
 * la fecha local del dispositivo; en el hito de integración se sustituirá la
 * implementación sin tocar las pantallas.
 */
export const schoolRepository = new InMemorySchoolRepository(new Date());
