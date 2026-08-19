import type { AssistantGateway } from '../features/assistant/domain/assistantGateway';
import { FakeAssistantGateway } from '../features/assistant/infrastructure/fakeAssistantGateway';
import type { AuthGateway } from '../features/auth/domain/authGateway';
import { createSupabaseAuthGateway } from '../features/auth/infrastructure/supabaseAuthGateway';
import { createInMemorySchoolRepository } from '../infrastructure/in-memory';
import { createSupabaseClient } from '../infrastructure/supabase/client';
import type { SchoolRepository } from '../domain/school/schoolRepository';

/**
 * Dependencias de aplicación ensambladas en la raíz. La selección de cada
 * implementación vive aquí para poder sustituir Auth, Assistant o la capa de
 * datos con un único cambio sin tocar las pantallas.
 */
export type AppDependencies = {
  authGateway: AuthGateway;
  assistantGateway: AssistantGateway;
  schoolRepository: SchoolRepository;
};

export function createAppDependencies(): AppDependencies {
  return {
    authGateway: createSupabaseAuthGateway(createSupabaseClient()),
    assistantGateway: new FakeAssistantGateway(),
    schoolRepository: createInMemorySchoolRepository(),
  };
}
