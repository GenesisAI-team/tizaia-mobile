import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { ApiError, NetworkError } from '../../infrastructure/api/apiClient';

/**
 * Estado compartido mínimo y explícito (MOB-API-001): un contador de versión
 * que invalida los recursos al completarse una mutación, y un hook de
 * recurso con máquina de estados visible (loading/success/empty/error).
 * Sin React Query ni cachés ocultas: cada pantalla declara su consulta.
 */

export type ResourceState<T> =
  | { status: 'loading'; data?: T }
  | { status: 'success'; data: T }
  | { status: 'empty'; data?: undefined }
  | { status: 'error'; error: string; data?: T };

type SchoolRefresh = {
  /** Sube en cada invalidación; los recursos activos se recargan solos. */
  readonly version: number;
  /** Llamar tras una mutación confirmada para refrescar las pantallas vivas. */
  invalidate: () => void;
};

const SchoolRefreshContext = createContext<SchoolRefresh | null>(null);

export function SchoolDataProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const [version, setVersion] = useState(0);
  const invalidate = useCallback(() => setVersion((v) => v + 1), []);
  const value = useMemo<SchoolRefresh>(
    () => ({ version, invalidate }),
    [version, invalidate],
  );
  return (
    <SchoolRefreshContext.Provider value={value}>
      {children}
    </SchoolRefreshContext.Provider>
  );
}

function useSchoolRefresh(): SchoolRefresh {
  const context = useContext(SchoolRefreshContext);
  if (!context) {
    throw new Error(
      'useSchoolResource debe utilizarse dentro de SchoolDataProvider.',
    );
  }
  return context;
}

/** Invalida los recursos escolares vivos tras una mutación confirmada. */
export function useSchoolInvalidation(): () => void {
  return useSchoolRefresh().invalidate;
}

const isEmptyData = (data: unknown): boolean =>
  data == null || (Array.isArray(data) && data.length === 0);

/** Mensaje estable y sin detalles técnicos para mostrar en UI. */
export function toUserMessage(error: unknown): string {
  if (error instanceof NetworkError) return error.message;
  if (error instanceof ApiError) {
    if (error.status >= 500) return 'Error del servidor. Inténtalo de nuevo.';
    return error.message;
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return 'No se pudo completar la operación.';
}

/**
 * Observa una consulta asíncrona del repositorio escolar. Se recarga cuando
 * cambia la versión global (mutaciones), sus `deps` explícitas o tras
 * `reload`. Mientras recarga conserva el estado previo (stale-while-
 * revalidate simple): sin parpadeos ni estados de carga intermedios.
 */
export function useSchoolResource<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
): { state: ResourceState<T>; reload: () => void } {
  const { version } = useSchoolRefresh();
  // El estado inicial cubre la primera carga; las siguientes conservan el
  // resultado anterior hasta que llega el nuevo (sin setState síncronos).
  const [state, setState] = useState<ResourceState<T>>({ status: 'loading' });
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);

  // Mantiene el fetcher más reciente sin reiniciar la consulta por identidad.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  // `deps` llega desde cada pantalla como dependencias explícitas.
  useEffect(
    () => {
      let cancelled = false;
      fetcherRef
        .current()
        .then((data) => {
          if (cancelled) return;
          if (isEmptyData(data)) {
            setState({ status: 'empty' });
            return;
          }
          setState({ status: 'success', data });
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setState({ status: 'error', error: toUserMessage(error) });
        });
      return () => {
        cancelled = true;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, tick, ...deps],
  );

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { state, reload };
}
