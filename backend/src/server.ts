import { createApp } from './app.js';
import { loadAppConfig } from './config/env.js';
import { createMemorySchoolRepository } from './infrastructure/memory/index.js';

/**
 * Punto de entrada del proceso: carga configuración, crea UNA instancia del
 * almacén en memoria (seed determinista al arrancar) y la inyecta en la app.
 */
const config = loadAppConfig();
const repository = createMemorySchoolRepository(new Date());
const app = createApp({
  repository,
  corsOrigins: config.corsOrigins,
  demoMode: config.demoMode,
  devResetEnabled: config.devResetEnabled,
});

app.listen(config.port, () => {
  console.log(
    JSON.stringify({
      level: 'info',
      message: `TizaIA backend escuchando en http://localhost:${config.port}`,
      demo: config.demoMode,
      devReset: config.devResetEnabled,
    }),
  );
});
