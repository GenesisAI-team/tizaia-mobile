export type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AssistantRequest = {
  message: string;
  conversationId?: string;
};

export type AssistantResponse = {
  message: string;
  conversationId?: string;
};

export interface AssistantGateway {
  sendMessage(request: AssistantRequest): Promise<AssistantResponse>;
}
