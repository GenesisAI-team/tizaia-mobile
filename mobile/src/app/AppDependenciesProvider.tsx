import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';

import type { AssistantGateway } from '../features/assistant/domain/assistantGateway';
import type { SchoolRepository } from '../domain/school/schoolRepository';
import type { AppDependencies } from './createAppDependencies';

type AppServices = {
  assistantGateway: AssistantGateway;
  schoolRepository: SchoolRepository;
};

const AppServicesContext = createContext<AppServices | null>(null);

/**
 * Transporta los puertos de aplicación ensamblados en la raíz (App.tsx) hacia
 * las pantallas. La selección de implementación no vive aquí: se recibe por
 * prop y solo se expone vía hooks, de modo que la UI nunca importa
 * infrastructure.
 */
export function AppDependenciesProvider({
  dependencies,
  children,
}: PropsWithChildren<{ dependencies: AppDependencies }>): React.JSX.Element {
  const value = useMemo<AppServices>(
    () => ({
      assistantGateway: dependencies.assistantGateway,
      schoolRepository: dependencies.schoolRepository,
    }),
    [dependencies.assistantGateway, dependencies.schoolRepository],
  );

  return (
    <AppServicesContext.Provider value={value}>
      {children}
    </AppServicesContext.Provider>
  );
}

export function useAssistantGateway(): AssistantGateway {
  const context = useContext(AppServicesContext);
  if (!context)
    throw new Error(
      'useAssistantGateway debe utilizarse dentro de AppDependenciesProvider.',
    );
  return context.assistantGateway;
}

export function useSchoolRepository(): SchoolRepository {
  const context = useContext(AppServicesContext);
  if (!context)
    throw new Error(
      'useSchoolRepository debe utilizarse dentro de AppDependenciesProvider.',
    );
  return context.schoolRepository;
}
