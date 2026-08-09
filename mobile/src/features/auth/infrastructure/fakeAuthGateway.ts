import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import type { AuthCredentials, AuthGateway } from '../domain/authGateway';

export class FakeAuthGateway implements AuthGateway {
  private session: Session | null;
  private readonly listeners = new Set<
    (event: AuthChangeEvent, session: Session | null) => void
  >();
  private readonly validCredentials: AuthCredentials;

  constructor(
    options: {
      session?: Session | null;
      validCredentials?: AuthCredentials;
    } = {},
  ) {
    this.session = options.session ?? null;
    this.validCredentials = options.validCredentials ?? {
      email: 'teacher@example.com',
      password: 'correct-password',
    };
  }

  async getSession() {
    return { session: this.session, error: null };
  }

  async signInWithPassword(credentials: AuthCredentials) {
    if (
      credentials.email !== this.validCredentials.email ||
      credentials.password !== this.validCredentials.password
    ) {
      return { error: new Error('Correo o contraseña incorrectos.') };
    }

    this.session = {
      user: { id: 'fake-user', aud: 'authenticated' },
    } as Session;
    this.notify('SIGNED_IN');
    return { error: null };
  }

  async signInWithGoogle() {
    return { error: new Error('Google no está disponible en el fake.') };
  }

  async signOut() {
    this.session = null;
    this.notify('SIGNED_OUT');
    return { error: null };
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) {
    this.listeners.add(callback);
    return { unsubscribe: () => this.listeners.delete(callback) };
  }

  private notify(event: AuthChangeEvent) {
    this.listeners.forEach((listener) => listener(event, this.session));
  }
}
