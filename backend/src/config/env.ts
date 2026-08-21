import { z } from 'zod';

/**
 * Configuración validada con Zod en el límite del proceso. Sin secretos:
 * este backend demo no necesita claves (la IA llega en la issue #69).
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
});

export type AppConfig = {
  port: number;
  corsOrigins: string[];
  devResetEnabled: boolean;
  demoMode: boolean;
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
  };
}
