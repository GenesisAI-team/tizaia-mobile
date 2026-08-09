import type {
  AssistantGateway,
  AssistantRequest,
  AssistantResponse,
} from '../domain/assistantGateway';

export class N8nAssistantGateway implements AssistantGateway {
  public constructor(
    private readonly webhookUrl: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  public async sendMessage(
    request: AssistantRequest,
  ): Promise<AssistantResponse> {
    const response = await this.fetcher(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Assistant gateway failed with HTTP ${response.status}`);
    }
    return (await response.json()) as AssistantResponse;
  }
}
