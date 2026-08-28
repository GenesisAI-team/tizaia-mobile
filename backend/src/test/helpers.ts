import type { AddressInfo } from 'node:net';
import type { Express } from 'express';
import type { LanguageModel } from 'ai';
import { createApp, type CreateAppAssistantOptions } from '../app.js';
import { createMemorySchoolRepository } from '../infrastructure/memory/index.js';
import { getRecentSchoolDays } from '../seeds/schoolDates.js';
import { CountingSchoolRepository } from './countingSchoolRepository.js';

/**
 * Ayudas de test: servidor efímero sin red externa y fecha de referencia fija
 * (viernes 21-08-2026) para que los días lectivos sean deterministas.
 */
export const REFERENCE_DATE = new Date(2026, 7, 21);

/** Primer día lectivo del seed (el más reciente): viernes 2026-08-21. */
export const FIRST_SCHOOL_DAY = getRecentSchoolDays(REFERENCE_DATE, 10)[0]!;

export type JsonResponse<T = unknown> = {
  status: number;
  headers: Record<string, string>;
  body: T;
};

export type TestServer = {
  repository: ReturnType<typeof createMemorySchoolRepository>;
  baseUrl: string;
  request: (path: string, init?: RequestInit) => Promise<Response>;
  requestJson: <T = unknown>(
    path: string,
    init?: RequestInit,
  ) => Promise<JsonResponse<T>>;
  close: () => Promise<void>;
};

export function startTestServer(options?: {
  devResetEnabled?: boolean;
  /** Logging de rendimiento opt-in (issue #104). */
  perfLogging?: boolean;
  /** Opciones del asistente (AI-001): modelo mock y configuración. */
  assistant?: CreateAppAssistantOptions & { model?: LanguageModel };
}): Promise<TestServer> {
  const repository = createMemorySchoolRepository(REFERENCE_DATE);
  const app: Express = createApp({
    repository,
    corsOrigins: ['*'],
    demoMode: true,
    devResetEnabled: options?.devResetEnabled ?? false,
    perfLogging: options?.perfLogging ?? false,
    assistant: options?.assistant,
  });
  const server = app.listen(0);
  return new Promise((resolve, reject) => {
    server.once('listening', () => {
      const address = server.address() as AddressInfo | null;
      if (address === null) {
        reject(new Error('Servidor sin dirección'));
        return;
      }
      const baseUrl = `http://127.0.0.1:${address.port}`;
      resolve({
        repository,
        baseUrl,
        request: (path, init) => fetch(`${baseUrl}${path}`, init),
        requestJson: async <T>(
          path: string,
          init?: RequestInit,
        ): Promise<JsonResponse<T>> => {
          const response = await fetch(`${baseUrl}${path}`, init);
          const headers: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value;
          });
          let body: unknown;
          try {
            body = await response.json();
          } catch {
            body = null;
          }
          return { status: response.status, headers, body: body as T };
        },
        close: () =>
          new Promise<void>((resolveClose, rejectClose) => {
            server.close((error) =>
              error === undefined ? resolveClose() : rejectClose(error),
            );
          }),
      });
    });
    server.once('error', reject);
  });
}

export function jsonInit(
  method: string,
  body: unknown,
): RequestInit | undefined {
  if (body === undefined) return { method };
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

/**
 * Servidor de test con el `SchoolRepository` envuelto en un contador de
 * operaciones (`CountingSchoolRepository`, issue #104) para detectar N+1
 * ocultos por la memoria. El contador expone `getCounts()` después de una o
 * varias peticiones.
 */
export async function startCountingTestServer(options?: {
  devResetEnabled?: boolean;
  /** Logging de rendimiento opt-in (issue #104). */
  perfLogging?: boolean;
  assistant?: CreateAppAssistantOptions & { model?: LanguageModel };
}): Promise<
  TestServer & { getCounts: () => Readonly<Record<string, number>> }
> {
  const repository = createMemorySchoolRepository(REFERENCE_DATE);
  const counter = new CountingSchoolRepository(repository);
  const app: Express = createApp({
    repository: counter,
    corsOrigins: ['*'],
    demoMode: true,
    devResetEnabled: options?.devResetEnabled ?? false,
    perfLogging: options?.perfLogging ?? false,
    assistant: options?.assistant,
  });
  const server = app.listen(0);
  return new Promise((resolve, reject) => {
    server.once('listening', () => {
      const address = server.address() as AddressInfo | null;
      if (address === null) {
        reject(new Error('Servidor sin dirección'));
        return;
      }
      const baseUrl = `http://127.0.0.1:${address.port}`;
      resolve({
        repository,
        baseUrl,
        request: (path, init) => fetch(`${baseUrl}${path}`, init),
        requestJson: async <T>(
          path: string,
          init?: RequestInit,
        ): Promise<JsonResponse<T>> => {
          const response = await fetch(`${baseUrl}${path}`, init);
          const headers: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value;
          });
          let body: unknown;
          try {
            body = await response.json();
          } catch {
            body = null;
          }
          return { status: response.status, headers, body: body as T };
        },
        getCounts: () => counter.getCounts(),
        close: () =>
          new Promise<void>((resolveClose, rejectClose) => {
            server.close((error) =>
              error === undefined ? resolveClose() : rejectClose(error),
            );
          }),
      });
    });
    server.once('error', reject);
  });
}
