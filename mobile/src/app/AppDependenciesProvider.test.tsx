import { act } from 'react';
import { create } from 'react-test-renderer';

import type { AssistantGateway } from '../features/assistant/domain/assistantGateway';
import { FakeAssistantGateway } from '../features/assistant/infrastructure/fakeAssistantGateway';
import { FakeAuthGateway } from '../features/auth/infrastructure/fakeAuthGateway';
import type { SchoolRepository } from '../domain/school/schoolRepository';
import { createInMemorySchoolRepository } from '../infrastructure/in-memory';
import {
  AppDependenciesProvider,
  useAssistantGateway,
  useSchoolRepository,
} from './AppDependenciesProvider';
import type { AppDependencies } from './createAppDependencies';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type CapturedServices = {
  assistant: AssistantGateway;
  repo: SchoolRepository;
};

function Probe({ onReady }: { onReady: (services: CapturedServices) => void }) {
  const assistant = useAssistantGateway();
  const repo = useSchoolRepository();
  onReady({ assistant, repo });
  return null;
}

function createDependencies(): AppDependencies {
  return {
    authGateway: new FakeAuthGateway(),
    assistantGateway: new FakeAssistantGateway(),
    schoolRepository: createInMemorySchoolRepository(new Date('2026-08-19')),
  };
}

describe('AppDependenciesProvider', () => {
  it('expone los puertos de la aplicación a los consumidores', async () => {
    const dependencies = createDependencies();
    let captured: CapturedServices | undefined;

    await act(async () => {
      create(
        <AppDependenciesProvider dependencies={dependencies}>
          <Probe
            onReady={(services) => {
              captured = services;
            }}
          />
        </AppDependenciesProvider>,
      );
    });

    expect(captured?.assistant).toBe(dependencies.assistantGateway);
    expect(captured?.repo).toBe(dependencies.schoolRepository);
  });

  it('lanza un error si useAssistantGateway se usa fuera del provider', () => {
    expect(() =>
      act(() => {
        create(
          <Probe
            onReady={() => {
              throw new Error('No debería llegar aquí.');
            }}
          />,
        );
      }),
    ).toThrow(
      'useAssistantGateway debe utilizarse dentro de AppDependenciesProvider.',
    );
  });

  it('lanza un error si useSchoolRepository se usa fuera del provider', () => {
    function RepoOnlyProbe() {
      useSchoolRepository();
      return null;
    }

    expect(() =>
      act(() => {
        create(<RepoOnlyProbe />);
      }),
    ).toThrow(
      'useSchoolRepository debe utilizarse dentro de AppDependenciesProvider.',
    );
  });
});
