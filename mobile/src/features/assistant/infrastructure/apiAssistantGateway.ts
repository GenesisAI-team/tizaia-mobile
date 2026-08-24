import type {
  AssistantGateway,
  AssistantRequest,
  AssistantResponse,
} from '../domain/assistantGateway';
import type { ApiClient } from '../../../infrastructure/api/apiClient';

/** DTO del contrato `POST /v1/assistant/messages` (RFC-001 §7). */
type AssistantMessageDto = {
  conversationId?: string;
  message: string;
};

/**
 * Adaptador HTTP del asistente (AI-001): consume el endpoint propio del
 * backend reutilizando `apiClient` (timeout, cancelación y errores
 * normalizados a dominio). Sin claves ni SDK de proveedor en el móvil.
 */
export class ApiAssistantGateway implements AssistantGateway {
  public constructor(private readonly client: ApiClient) {}

  public async sendMessage(
    request: AssistantRequest,
  ): Promise<AssistantResponse> {
    const dto = await this.client.post<AssistantRequest, AssistantMessageDto>(
      '/v1/assistant/messages',
      request,
    );
    return {
      message: dto.message,
      conversationId: dto.conversationId,
    };
  }
}
