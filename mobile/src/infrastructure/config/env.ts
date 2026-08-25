import { z } from 'zod';

export const DEFAULT_API_BASE_URL = 'http://10.0.2.2:3000';

export type AssistantMode = 'api' | 'fake';

export type AppConfig = {
  /** URL base del backend propio (RFC-001); sin /v1 final. */
  apiBaseUrl: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  /**
   * Implementación del asistente (AI-001): adaptador HTTP contra
   * `POST /v1/assistant/messages` por defecto; el fake queda seleccionable
   * para desarrollo aislado y pruebas. Sin claves de IA en el bundle.
   */
  assistantMode: AssistantMode;
};

function requiredPublicEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing public configuration: ${name}`);
  }
  return value;
}

const assistantModeSchema = z.enum(['api', 'fake']);

function resolveAssistantMode(value: string | undefined): AssistantMode {
  const raw = value?.trim() || 'api';
  const parsed = assistantModeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `EXPO_PUBLIC_ASSISTANT_MODE inválido: "${raw}" (valores: api | fake)`,
    );
  }
  return parsed.data;
}

export function getAppConfig(): AppConfig {
  return {
    supabaseUrl: requiredPublicEnv(
      'EXPO_PUBLIC_SUPABASE_URL',
      process.env.EXPO_PUBLIC_SUPABASE_URL,
    ),
    supabasePublishableKey: requiredPublicEnv(
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
    assistantMode: resolveAssistantMode(process.env.EXPO_PUBLIC_ASSISTANT_MODE),
  };
}
