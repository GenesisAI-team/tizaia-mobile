import { View } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { BrandMark } from './BrandMark';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

async function renderMark(
  props: React.ComponentProps<typeof BrandMark>,
): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<BrandMark {...props} />);
  });
  return renderer;
}

/** Aplana el array de estilos RN (o lo deja tal cual) para inspeccionarlo. */
function styleOf(node: {
  props: { style?: unknown };
}): Record<string, unknown> {
  const style = node.props.style;
  if (Array.isArray(style)) return Object.assign({}, ...style);
  return (style ?? {}) as Record<string, unknown>;
}

/** Localiza el círculo raíz de la marca (View con fondo #FFFFFFC7). */
function findMarkRoot(renderer: ReactTestRenderer) {
  const rootView = renderer.root
    .findAllByType(View)
    .find((v) => styleOf(v).backgroundColor === '#FFFFFFC7');
  return rootView ? styleOf(rootView) : undefined;
}

describe('BrandMark', () => {
  it('login usa el tamaño grande intacto (168dp)', async () => {
    const renderer = await renderMark({ variant: 'login' });
    const root = findMarkRoot(renderer);
    expect(root?.width).toBe(168);
    expect(root?.height).toBe(168);
  });

  it('header es compacto (40dp) para caber sin recorte', async () => {
    const renderer = await renderMark({ variant: 'header' });
    const root = findMarkRoot(renderer);
    expect(root?.width).toBe(40);
    expect(root?.height).toBe(40);
  });

  it('loading es un tamaño intermedio (72dp) entre login y header', async () => {
    const renderer = await renderMark({ variant: 'loading' });
    const root = findMarkRoot(renderer);
    const size = (root?.width as number) ?? 0;
    expect(size).toBe(72);
    expect(size).toBeGreaterThan(40);
    expect(size).toBeLessThan(168);
  });

  it('está accesible por defecto y puede desactivarse dentro de un botón', async () => {
    const standalone = await renderMark({ variant: 'login' });
    const standaloneRoot = standalone.root.findByProps({
      accessibilityRole: 'image',
    });
    expect(standaloneRoot.props.accessible).toBe(true);

    const inButton = await renderMark({ accessible: false, variant: 'header' });
    const inButtonRoot = inButton.root.findByProps({ accessible: false });
    expect(inButtonRoot.props.accessibilityRole).toBeUndefined();
  });
});
