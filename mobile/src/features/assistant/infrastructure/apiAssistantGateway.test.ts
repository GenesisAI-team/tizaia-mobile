import { ApiError, NetworkError } from '../../../infrastructure/api/apiClient';
import type { ApiClient } from '../../../infrastructure/api/apiClient';
import { ApiAssistantGateway } from './apiAssistantGateway';

type PostMock = jest.Mock<Promise<unknown>, [string, unknown]>;

function createClientStub(impl: PostMock): ApiClient {
  return {
    get: jest.fn(),
    post: impl as unknown as ApiClient['post'],
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
}

describe('ApiAssistantGateway', () => {
  it('envía el mensaje a /v1/assistant/messages y mapea la respuesta', async () => {
    const post = jest.fn(
      async (
        _path: string,
        _body: unknown,
      ): Promise<{ conversationId: string; message: string }> => ({
        conversationId: 'conv_abc',
        message: 'Ayer faltaron dos alumnos.',
      }),
    ) as unknown as PostMock;
    const gateway = new ApiAssistantGateway(createClientStub(post));

    const response = await gateway.sendMessage({
      message: '¿Quién faltó ayer?',
      conversationId: 'conv_prev',
    });

    expect(post).toHaveBeenCalledWith('/v1/assistant/messages', {
      message: '¿Quién faltó ayer?',
      conversationId: 'conv_prev',
    });
    expect(response).toEqual({
      message: 'Ayer faltaron dos alumnos.',
      conversationId: 'conv_abc',
    });
  });

  it('permite conversaciones nuevas sin conversationId', async () => {
    const post = jest.fn(async (): Promise<{ message: string }> => ({
      message: 'Hola',
    })) as unknown as PostMock;
    const gateway = new ApiAssistantGateway(createClientStub(post));

    await gateway.sendMessage({ message: 'Hola' });

    expect(post).toHaveBeenCalledWith('/v1/assistant/messages', {
      message: 'Hola',
      conversationId: undefined,
    });
  });

  it('propaga los errores normalizados del cliente (404/red)', async () => {
    const apiError = new ApiError(
      404,
      'NOT_FOUND',
      'Conversación no encontrada o expirada',
    );
    const failingPost = jest
      .fn()
      .mockRejectedValue(apiError) as unknown as PostMock;
    await expect(
      new ApiAssistantGateway(createClientStub(failingPost)).sendMessage({
        message: 'hola',
      }),
    ).rejects.toBe(apiError);

    const networkError = new NetworkError();
    const offlinePost = jest
      .fn()
      .mockRejectedValue(networkError) as unknown as PostMock;
    await expect(
      new ApiAssistantGateway(createClientStub(offlinePost)).sendMessage({
        message: 'hola',
      }),
    ).rejects.toBe(networkError);
  });
});
