import { FakeAuthGateway } from './fakeAuthGateway';

describe('FakeAuthGateway', () => {
  it('accepts valid email credentials', async () => {
    const gateway = new FakeAuthGateway();
    await expect(
      gateway.signInWithPassword({
        email: 'teacher@example.com',
        password: 'correct-password',
      }),
    ).resolves.toEqual({ error: null });
    await expect(gateway.getSession()).resolves.toMatchObject({
      session: { user: { id: 'fake-user' } },
    });
  });

  it('rejects invalid credentials without creating a session', async () => {
    const gateway = new FakeAuthGateway();
    await expect(
      gateway.signInWithPassword({
        email: 'teacher@example.com',
        password: 'wrong',
      }),
    ).resolves.toMatchObject({ error: expect.any(Error) });
    await expect(gateway.getSession()).resolves.toMatchObject({
      session: null,
    });
  });

  it('restores a persisted session and clears it on logout', async () => {
    const persistedSession = {
      user: { id: 'persisted-user', aud: 'authenticated' },
    } as never;
    const gateway = new FakeAuthGateway({ session: persistedSession });
    await expect(gateway.getSession()).resolves.toEqual({
      session: persistedSession,
      error: null,
    });
    await expect(gateway.signOut()).resolves.toEqual({ error: null });
    await expect(gateway.getSession()).resolves.toEqual({
      session: null,
      error: null,
    });
  });
});
