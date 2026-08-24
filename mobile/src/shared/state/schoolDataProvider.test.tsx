import { act, useEffect } from 'react';
import { create, type ReactTestRenderer } from 'react-test-renderer';

import {
  SchoolDataProvider,
  useSchoolInvalidation,
  useSchoolResource,
  type ResourceState,
} from './schoolDataProvider';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type ProbeProps = {
  fetcher: () => Promise<unknown>;
  onState: (state: ResourceState<unknown>) => void;
};

/** La captura de estados ocurre en efecto, no durante el render. */
function ResourceProbe({ fetcher, onState }: ProbeProps): null {
  const { state } = useSchoolResource(fetcher, []);

  useEffect(() => {
    onState(state);
  });

  return null;
}

async function renderElement(
  element: React.ReactElement,
): Promise<ReactTestRenderer> {
  let testRenderer!: ReactTestRenderer;
  await act(async () => {
    testRenderer = create(element);
  });
  return testRenderer;
}

describe('useSchoolResource', () => {
  it('pasa de loading a success con los datos resueltos', async () => {
    const states: ResourceState<unknown>[] = [];
    const fetcher = jest.fn().mockResolvedValue([{ id: 'a' }, { id: 'b' }]);

    await renderElement(
      <SchoolDataProvider>
        <ResourceProbe
          fetcher={fetcher}
          onState={(state) => states.push(state)}
        />
      </SchoolDataProvider>,
    );

    expect(fetcher).toHaveBeenCalledTimes(1);
    const finalState = states.at(-1)!;
    expect(finalState.status).toBe('success');
    if (finalState.status === 'success') {
      expect(finalState.data).toHaveLength(2);
    }
  });

  it('reporta empty cuando la consulta no devuelve datos', async () => {
    const states: ResourceState<unknown>[] = [];
    const fetcher = jest.fn().mockResolvedValue([]);

    await renderElement(
      <SchoolDataProvider>
        <ResourceProbe
          fetcher={fetcher}
          onState={(state) => states.push(state)}
        />
      </SchoolDataProvider>,
    );

    expect(states.at(-1)!.status).toBe('empty');
  });

  it('expone un mensaje estable en error', async () => {
    const states: ResourceState<unknown>[] = [];
    const fetcher = jest.fn().mockRejectedValue(new Error('boom'));

    await renderElement(
      <SchoolDataProvider>
        <ResourceProbe
          fetcher={fetcher}
          onState={(state) => states.push(state)}
        />
      </SchoolDataProvider>,
    );

    const errorState = states.at(-1)!;
    expect(errorState.status).toBe('error');
    if (errorState.status === 'error') {
      expect(errorState.error).toBe('boom');
    }
  });

  it('reload vuelve a ejecutar la consulta', async () => {
    const fetcher = jest.fn().mockResolvedValue([{ id: 'a' }]);
    let reloadHandle: (() => void) | undefined;

    function Reloadable(): null {
      const { state, reload } = useSchoolResource(fetcher, []);
      useEffect(() => {
        reloadHandle = reload;
        void state;
      });
      return null;
    }

    await renderElement(
      <SchoolDataProvider>
        <Reloadable />
      </SchoolDataProvider>,
    );
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      reloadHandle?.();
    });
    await act(async () => {});

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

describe('useSchoolInvalidation', () => {
  it('dispara el refetch de los recursos vivos', async () => {
    const fetcher = jest.fn().mockResolvedValue([{ id: 'a' }]);
    let invalidateHandle: (() => void) | undefined;

    function ProbeWithInvalidate(): null {
      const resource = useSchoolResource(fetcher, []);
      const invalidate = useSchoolInvalidation();
      useEffect(() => {
        invalidateHandle = invalidate;
        void resource;
      });
      return null;
    }

    await renderElement(
      <SchoolDataProvider>
        <ProbeWithInvalidate />
      </SchoolDataProvider>,
    );
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      invalidateHandle?.();
    });
    // La invalidación provoca una segunda carga del mismo recurso.
    await act(async () => {});

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
