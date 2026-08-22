/**
 * Cliente HTTP del MVP: concentra base URL, timeout, JSON y normalización de
 * errores de la API en memoria (#67). Las pantallas nunca importan este
 * módulo: lo consume únicamente el adaptador `ApiSchoolRepository`.
 */

/** La petición no llegó al servidor (red caída, timeout o aborto). */
export class NetworkError extends Error {
  public constructor(
    message = 'No hay conexión con el servidor. Comprueba tu red.',
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

/** El servidor respondió con la envolvente de error estable (#67). */
export class ApiError extends Error {
  public constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: readonly string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiClient = {
  get<TResponse>(path: string): Promise<TResponse>;
  post<TBody, TResponse>(path: string, body: TBody): Promise<TResponse>;
  patch<TBody, TResponse>(path: string, body: TBody): Promise<TResponse>;
  put<TBody, TResponse>(path: string, body: TBody): Promise<TResponse>;
  delete(path: string): Promise<void>;
};

const DEFAULT_TIMEOUT_MS = 10_000;

type ErrorEnvelopeDto = {
  error?: { code?: unknown; message?: unknown; details?: unknown };
};

const parseErrorEnvelope = async (response: Response): Promise<ApiError> => {
  let code = 'INTERNAL_ERROR';
  let message = `Error HTTP ${response.status}`;
  let details: string[] = [];
  try {
    const body = (await response.json()) as ErrorEnvelopeDto;
    if (typeof body.error?.code === 'string') code = body.error.code;
    if (typeof body.error?.message === 'string') message = body.error.message;
    if (Array.isArray(body.error?.details)) {
      details = body.error.details.filter(
        (detail): detail is string => typeof detail === 'string',
      );
    }
  } catch {
    // Cuerpo no JSON (p. ej. proxy sin el backend); se conservan los valores
    // por defecto con el estado HTTP real.
  }
  return new ApiError(response.status, code, message, details);
};

export function createApiClient(options: {
  baseUrl: string;
  timeoutMs?: number;
}): ApiClient {
  const baseUrl = options.baseUrl.replace(/\/+$/, '');
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const request = async <TResponse>(
    path: string,
    init?: { method?: string; body?: unknown },
  ): Promise<TResponse> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: init?.method ?? 'GET',
        headers:
          init?.body === undefined
            ? undefined
            : { 'Content-Type': 'application/json' },
        body: init?.body === undefined ? undefined : JSON.stringify(init.body),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw await parseErrorEnvelope(response);
      }
      if (response.status === 204) {
        return undefined as TResponse;
      }
      return (await response.json()) as TResponse;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      // AbortController y fallos de red llegan aquí indistinguibles; para el
      // usuario ambos significan "no se pudo contactar con el backend".
      throw new NetworkError();
    } finally {
      clearTimeout(timer);
    }
  };

  return {
    get: <TResponse>(path: string): Promise<TResponse> =>
      request<TResponse>(path),
    post: <TBody, TResponse>(path: string, body: TBody): Promise<TResponse> =>
      request<TResponse>(path, { method: 'POST', body }),
    patch: <TBody, TResponse>(path: string, body: TBody): Promise<TResponse> =>
      request<TResponse>(path, { method: 'PATCH', body }),
    put: <TBody, TResponse>(path: string, body: TBody): Promise<TResponse> =>
      request<TResponse>(path, { method: 'PUT', body }),
    delete: (path: string): Promise<void> =>
      request<void>(path, { method: 'DELETE' }),
  };
}
