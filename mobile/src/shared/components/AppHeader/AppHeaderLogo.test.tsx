import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { BrandMark } from '../BrandMark';
import { AppHeaderLogo } from './AppHeaderLogo';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

async function renderLogo(onPress: () => void): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<AppHeaderLogo onPress={onPress} />);
  });
  return renderer;
}

describe('AppHeaderLogo', () => {
  it('reutiliza BrandMark con la variante compacta header', async () => {
    const renderer = await renderLogo(jest.fn());
    const brandMarks = renderer.root.findAllByType(BrandMark);
    expect(brandMarks).toHaveLength(1);
    expect(brandMarks[0]!.props.variant).toBe('header');
    // No debe leerse dos veces: el botón ya anuncia "Ir a Home".
    expect(brandMarks[0]!.props.accessible).toBe(false);
  });

  it('ya no muestra el placeholder textual LOGO', async () => {
    const renderer = await renderLogo(jest.fn());
    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .filter((c) => typeof c === 'string');
    expect(texts).not.toContain('LOGO');
  });

  it('invoca onPress al pulsar el botón (navega a Home)', async () => {
    const onPress = jest.fn();
    const renderer = await renderLogo(onPress);
    const button = renderer.root.findByProps({
      accessibilityRole: 'button',
      testID: 'header-logo',
    });
    expect(typeof button.props.onPress).toBe('function');
    await act(async () => {
      button.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
