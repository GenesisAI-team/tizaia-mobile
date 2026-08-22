import { ApiError, NetworkError, createApiClient } from './apiClient';

/** Respuesta mínima compatible con `Response` para los tests. */
function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('createApiClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('GET resuelve la ruta sobre la base URL y parsea el JSON', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ ok: true }));
    jest.spyOn(globalThis, 'fetch').mockImplementation(fetchMock);
    const client = createApiClient({ baseUrl: 'http://localhost:3000/' });

    const data = await client.get<{ ok: boolean }>('/v1/classes');

    expect(data).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0]! as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('http://localhost:3000/v1/classes');
    expect(init.method).toBe('GET');
  });

  it('POST serializa el cuerpo como JSON con Content-Type', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse({ id: 'mail-30' }, 201));
    jest.spyOn(globalThis, 'fetch').mockImplementation(fetchMock);
    const client = createApiClient({ baseUrl: 'http://localhost:3000' });

    await client.post<{ subject: string }, { id: string }>('/v1/mails', {
      subject: 'Hola',
    });

    const [, init] = fetchMock.mock.calls[0]! as unknown as [
      string,
      RequestInit,
    ];
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(init.body).toBe(JSON.stringify({ subject: 'Hola' }));
  });

  it('convierte la envolvente de error del backend en ApiError', async () => {
    jest.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        jsonResponse(
          {
            error: {
              code: 'NON_SCHOOL_DAY',
              message: 'La fecha no es un día lectivo',
              details: ['2026-08-22'],
            },
          },
          409,
        ),
      ),
    );
    const client = createApiClient({ baseUrl: 'http://localhost:3000' });

    await expect(
      client.put('/v1/attendance/c/s/d', { status: 'present' }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'NON_SCHOOL_DAY',
      message: 'La fecha no es un día lectivo',
      details: ['2026-08-22'],
    });
  });

  it('DELETE sin cuerpo (204) devuelve undefined sin parsear JSON', async () => {
    const response204 = {
      ok: true,
      status: 204,
      json: () => {
        throw new Error('no debe llamarse');
      },
    } as unknown as Response;
    jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() => Promise.resolve(response204));
    const client = createApiClient({ baseUrl: 'http://localhost:3000' });

    await expect(
      client.delete('/v1/students/student-1'),
    ).resolves.toBeUndefined();
  });

  it('fallos de red o aborto se normalizan a NetworkError', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() =>
        Promise.reject(new TypeError('Network request failed')),
      );
    const client = createApiClient({ baseUrl: 'http://localhost:3000' });

    await expect(client.get('/v1/bootstrap')).rejects.toThrow(NetworkError);
  });

  it('un ApiError se propaga tal cual (no se envuelve en NetworkError)', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          jsonResponse(
            { error: { code: 'NOT_FOUND', message: 'Recurso no encontrado' } },
            404,
          ),
        ),
      );
    const client = createApiClient({ baseUrl: 'http://localhost:3000' });

    await expect(client.get('/v1/students/nope')).rejects.toThrow(ApiError);
  });
});
