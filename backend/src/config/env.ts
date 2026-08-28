import { z } from 'zod';

/**
 * Configuración validada con Zod en el límite del proceso. La clave del
 * proveedor de IA vive SOLO aquí (RFC-001 §8): nunca en el móvil ni en el
 * repositorio. Sin clave configurada, el asistente responde `503
 * ASSISTANT_UNAVAILABLE` y el resto de la API funciona con normalidad.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z.string().default('*'),
  ENABLE_DEV_RESET: z
    .string()
    .default('false')
    .refine(
      (value) => value === 'true' || value === 'false',
      'ENABLE_DEV_RESET debe ser "true" o "false"',
    ),
  DEMO_MODE: z
    .string()
    .default('true')
    .refine(
      (value) => value === 'true' || value === 'false',
      'DEMO_MODE debe ser "true" o "false"',
    ),
  // ---------- Asistente (AI-001, RFC-001) ----------
  AI_PROVIDER: z.enum(['openai']).default('openai'),
  AI_MODEL: z.string().min(1).default('gpt-4o-mini'),
  OPENAI_API_KEY: z.string().min(1).optional(),
  AI_MAX_STEPS: z.coerce.number().int().positive().default(6),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  CONVERSATION_TTL_MS: z.coerce.number().int().positive().default(1_800_000),
  CONVERSATION_MAX_MESSAGES: z.coerce.number().int().positive().default(24),
  // Trace de la herramienta asistente (issue #103). NUNCA activado por
  // defecto y sin efecto salvo que además la petición envíe el header
  // `x-assistant-trace`. Solo expone nombre + entrada de cada tool al
  // evaluador; la respuesta por defecto queda intacta.
  ASSISTANT_TRACE_ENABLED: z
    .string()
    .default('false')
    .refine(
      (value) => value === 'true' || value === 'false',
      'ASSISTANT_TRACE_ENABLED debe ser "true" o "false"',
    ),
});

export type AssistantConfig = {
  provider: 'openai';
  /** Modelo configurable por entorno (sin valor fijado en código de UI). */
  model: string;
  apiKey?: string;
  maxSteps: number;
  timeoutMs: number;
  conversationTtlMs: number;
  conversationMaxMessages: number;
  /**
   * Trace de tools habilitado por entorno (issue #103). Siempre requiere
   * además el header `x-assistant-trace` en la petición; por defecto `false`.
   */
  traceEnabled: boolean;
};

export type AppConfig = {
  port: number;
  corsOrigins: string[];
  devResetEnabled: boolean;
  demoMode: boolean;
  assistant: AssistantConfig;
};

export function loadAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(
      `Configuración inválida: ${parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ')}`,
    );
  }
  const corsOrigins = parsed.data.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  return {
    port: parsed.data.PORT,
    corsOrigins: corsOrigins.length > 0 ? corsOrigins : ['*'],
    devResetEnabled: parsed.data.ENABLE_DEV_RESET === 'true',
    demoMode: parsed.data.DEMO_MODE === 'true',
    assistant: {
      provider: parsed.data.AI_PROVIDER,
      model: parsed.data.AI_MODEL,
      apiKey: parsed.data.OPENAI_API_KEY,
      maxSteps: parsed.data.AI_MAX_STEPS,
      timeoutMs: parsed.data.AI_TIMEOUT_MS,
      conversationTtlMs: parsed.data.CONVERSATION_TTL_MS,
      conversationMaxMessages: parsed.data.CONVERSATION_MAX_MESSAGES,
      traceEnabled: parsed.data.ASSISTANT_TRACE_ENABLED === 'true',
    },
  };
}
