import type {
  AssistantGateway,
  AssistantRequest,
  AssistantResponse,
} from '../domain/assistantGateway';

export class FakeAssistantGateway implements AssistantGateway {
  public readonly requests: AssistantRequest[] = [];

  public async sendMessage(
    request: AssistantRequest,
  ): Promise<AssistantResponse> {
    this.requests.push(request);
    return {
      message: `Fake response: ${request.message}`,
      conversationId: request.conversationId ?? 'fake-conversation',
    };
  }
}
