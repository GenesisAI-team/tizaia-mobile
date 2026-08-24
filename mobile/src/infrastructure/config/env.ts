export const DEFAULT_API_BASE_URL = 'http://10.0.2.2:3000';

export type AppConfig = {
  /** URL base del backend propio (RFC-001); sin /v1 final. */
  apiBaseUrl: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  n8nAssistantWebhookUrl: string;
};

function requiredPublicEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing public configuration: ${name}`);
  }
  return value;
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
    n8nAssistantWebhookUrl: requiredPublicEnv(
      'EXPO_PUBLIC_N8N_ASSISTANT_WEBHOOK_URL',
      process.env.EXPO_PUBLIC_N8N_ASSISTANT_WEBHOOK_URL,
    ),
  };
}
