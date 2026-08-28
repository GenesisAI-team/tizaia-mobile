import type { Express, Request, Response } from 'express';

/**
 * Instrumentación de rendimiento HTTP opt-in (issue #104).
 *
 * Solo se instala cuando `PERF_LOGGING=true` (desactivada por defecto), de modo
 * que la ejecución normal del backend no añade ruido. Para cada request emite
 * una línea estructurada `http_perf`:
 *
 * ```json
 * { "type": "http_perf", "method": "GET", "path": "/v1/classes/:classId/task-board",
 *   "status": 200, "durationMs": 18.4, "responseBytes": 38120 }
 * ```
 *
 * `path` es la PLANTILLA de ruta (p. ej. `/v1/classes/:classId/task-board`),
 * no el valor real: no se registran query strings, cuerpos ni datos personales.
 * Cuando la ruta no está asociada a una plantilla (p. ej. un 404), se registra
 * la etiqueta segura `<unknown>` en lugar de la URL real.
 *
 * `responseBytes` es el `Content-Length` de la respuesta; `null` cuando el
 * header no está presente. No se evita nunca una linea por ausencia de tamaño.
 * Opcionalmente se añade `Server-Timing: app;dur=<ms>` en entorno de desarrollo.
 */
export function installPerfLogging(app: Express): void {
  app.use((req: Request, res: Response, next) => {
    const start = process.hrtime.bigint();

    // Inyecta `Server-Timing` justo antes de enviar la respuesta JSON con la
    // duración transcurrida (header no enviable en el evento `finish`).
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      res.setHeader('Server-Timing', `app;dur=${elapsedMs(start).toFixed(1)}`);
      return originalJson(body);
    };

    res.on('finish', () => {
      // `res.getHeader` puede devolver number o string para content-length
      // (Express normalmente guarda el tamaño numérico). `null` si no existe.
      const contentLength = res.getHeader('content-length');
      const responseBytes =
        typeof contentLength === 'number'
          ? contentLength
          : typeof contentLength === 'string'
            ? Number(contentLength)
            : null;
      // Nunca caer a `req.path` (contiene IDs reales): ruta segura si no hay
      // plantilla coincidente. Sin query ni body.
      const routeTemplate =
        (req.route?.path as string | undefined) ?? '<unknown>';
      console.log(
        JSON.stringify({
          type: 'http_perf',
          method: req.method,
          path: routeTemplate,
          status: res.statusCode,
          durationMs: Math.round(elapsedMs(start) * 10) / 10,
          responseBytes,
        }),
      );
    });

    next();
  });
}

function elapsedMs(start: bigint): number {
  return Number(process.hrtime.bigint() - start) / 1_000_000;
}
