/** Tipos compartidos del benchmark HTTP (`bench:api`, issue #104). */

export type HttpMethod = 'GET';

export type EndpointSpec = {
  /** Etiqueta corta para la tabla humana (p. ej. `/v1/classes/:classId/attendance-board`). */
  name: string;
  method: HttpMethod;
  /** Ruta real de la petición, incluida la query (valores concretos del seed). */
  path: string;
  /** Plantilla de ruta sin valores (para logs, sin PII/query). */
  routeTemplate: string;
};

export type RunResult = {
  ok: boolean;
  status: number;
  durationMs: number;
  responseBytes: number;
  error?: string;
};

export type EndpointStats = {
  runs: number;
  errors: number;
  /** Tasa de error = `errors / runs` (0..1). Denominador explícito: `runs`. */
  errorRate: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  minMs: number;
  maxMs: number;
  responseBytes: number;
};

export type BenchmarkReport = {
  baseUrl: string;
  runs: number;
  warmup: number;
  timeoutMs: number;
  startedAt: string;
  endpoints: Record<string, EndpointStats>;
};

export type BenchmarkConfig = {
  baseUrl: string;
  runs: number;
  warmup: number;
  timeoutMs: number;
  output?: string;
  baseline?: string;
};

/** `fetch` inyectable para poder testear el runner sin red externa. */
export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;
