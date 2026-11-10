import { createApp } from './app.js';
import { loadAppConfig } from './config/env.js';
import { createLanguageModel } from './infrastructure/ai/modelProvider.js';
import { createMemorySchoolRepository } from './infrastructure/memory/index.js';

/**
 * Punto de entrada del proceso: carga configuración, crea UNA instancia del
 * almacén en memoria (seed determinista al arrancar) y la inyecta en la app.
 * El modelo del asistente se crea solo si hay clave configurada; sin ella,
 * `POST /v1/assistant/messages` responde 503 estable (AI-001).
 */
const config = loadAppConfig();
const repository = createMemorySchoolRepository(new Date());
const model = createLanguageModel(config.assistant);
const app = createApp({
  repository,
  corsOrigins: config.corsOrigins,
  demoMode: config.demoMode,
  devResetEnabled: config.devResetEnabled,
  // El endpoint del asistente SIEMPRE está montado: sin clave responde 503
  // estable (`ASSISTANT_UNAVAILABLE`) en lugar de un 404 genérico.
  assistant: {
    model,
    traceEnabled: config.assistant.traceEnabled,
    assistantConfig: config.assistant,
  },
});

app.listen(config.port, () => {
  console.log(
    JSON.stringify({
      level: 'info',
      message: `TizaIA backend escuchando en http://localhost:${config.port}`,
      demo: config.demoMode,
      devReset: config.devResetEnabled,
      assistant:
        model === undefined
          ? 'unconfigured'
          : `${config.assistant.provider}/${config.assistant.model}`,
    }),
  );
});
