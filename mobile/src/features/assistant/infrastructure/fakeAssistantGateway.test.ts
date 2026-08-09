import { FakeAssistantGateway } from './fakeAssistantGateway';

describe('FakeAssistantGateway', () => {
  it('records a request and returns a replaceable response', async () => {
    const gateway = new FakeAssistantGateway();

    await expect(gateway.sendMessage({ message: 'hola' })).resolves.toEqual({
      message: 'Fake response: hola',
      conversationId: 'fake-conversation',
    });
    expect(gateway.requests).toEqual([{ message: 'hola' }]);
  });
});
