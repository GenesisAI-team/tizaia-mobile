import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import { useSchoolRepository } from '../../app/AppDependenciesProvider';
import type { SchoolBootstrap, SchoolClass } from '../../domain/school/models';
import type { ResourceState } from './schoolDataProvider';
import { toUserMessage } from './schoolDataProvider';

/**
 * Contexto global mínimo para clase activa (#76).
 * Carga `GET /v1/bootstrap` mínimo (teacher/activeClassId/classes) una vez
 * al montar el drawer y lo comparte a todas las pantallas, evitando waterfalls
 * `getMe → getStudents` cuando el dato ya pertenece al contexto de la app.
 * Sin caché persistente ni React Query: solo memoria viva del provider.
 */
type AppBootstrapValue = {
  /** Bootstrap mínimo si está disponible. */
  bootstrap: SchoolBootstrap | null;
  activeClassId: string | null;
  classes: SchoolClass[];
  state: ResourceState<SchoolBootstrap>;
  reload: () => void;
};

const AppBootstrapContext = createContext<AppBootstrapValue | null>(null);

export function AppBootstrapProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const repository = useSchoolRepository();
  const [state, setState] = useState<ResourceState<SchoolBootstrap>>({
    status: 'loading',
  });
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    repository
      .getBootstrap()
      .then((bootstrap) => {
        if (cancelled) return;
        setState({ status: 'success', data: bootstrap });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({ status: 'error', error: toUserMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [repository, tick]);

  const value: AppBootstrapValue = {
    bootstrap: state.status === 'success' ? state.data : null,
    activeClassId: state.status === 'success' ? state.data.activeClassId : null,
    classes: state.status === 'success' ? state.data.classes : [],
    state,
    reload,
  };

  return (
    <AppBootstrapContext.Provider value={value}>
      {children}
    </AppBootstrapContext.Provider>
  );
}

export function useAppBootstrap(): AppBootstrapValue {
  const context = useContext(AppBootstrapContext);
  if (!context) {
    throw new Error(
      'useAppBootstrap debe utilizarse dentro de AppBootstrapProvider.',
    );
  }
  return context;
}

/** Atajo cuando solo interesa el activeClassId ya resuelto. */
export function useActiveClassId(): string | null {
  return useAppBootstrap().activeClassId;
}
