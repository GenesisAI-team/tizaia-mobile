import type { AssistantGateway } from '../features/assistant/domain/assistantGateway';
import { ApiAssistantGateway } from '../features/assistant/infrastructure/apiAssistantGateway';
import { FakeAssistantGateway } from '../features/assistant/infrastructure/fakeAssistantGateway';
import type { AuthGateway } from '../features/auth/domain/authGateway';
import { createSupabaseAuthGateway } from '../features/auth/infrastructure/supabaseAuthGateway';
import { ApiSchoolRepository } from '../infrastructure/api/apiSchoolRepository';
import {
  ASSISTANT_TIMEOUT_MS,
  createApiClient,
  type ApiClient,
} from '../infrastructure/api/apiClient';
import { getAppConfig } from '../infrastructure/config/env';
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

/** El asistente se elige por configuración (AI-001): API por defecto. */
function createAssistantGateway(
  config: ReturnType<typeof getAppConfig>,
  client: ApiClient,
): AssistantGateway {
  if (config.assistantMode === 'fake') {
    return new FakeAssistantGateway();
  }
  return new ApiAssistantGateway(client);
}

export function createAppDependencies(): AppDependencies {
  const config = getAppConfig();
  // Cliente escolar: timeout ~10 s (operaciones CRUD rápidas).
  const schoolApiClient = createApiClient({ baseUrl: config.apiBaseUrl });
  // Cliente del asistente: ~35 s (> AI_TIMEOUT_MS=30 s) para no abortar
  // mientras el backend aún genera con tools/OpenAI.
  const assistantApiClient = createApiClient({
    baseUrl: config.apiBaseUrl,
    timeoutMs: ASSISTANT_TIMEOUT_MS,
  });
  return {
    authGateway: createSupabaseAuthGateway(createSupabaseClient()),
    // Sin claves de IA en el bundle: la clave vive solo en el backend.
    assistantGateway: createAssistantGateway(config, assistantApiClient),
    schoolRepository: new ApiSchoolRepository(schoolApiClient),
  };
}
