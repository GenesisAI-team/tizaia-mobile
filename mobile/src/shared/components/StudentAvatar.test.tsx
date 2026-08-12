import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { getAvatarColor, getInitials, StudentAvatar } from './StudentAvatar';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

async function renderAvatar(
  props: React.ComponentProps<typeof StudentAvatar>,
): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<StudentAvatar {...props} />);
  });
  return renderer;
}

describe('getInitials', () => {
  it('extrae hasta dos iniciales en mayúsculas', () => {
    expect(getInitials('Lucía Gómez')).toBe('LG');
    expect(getInitials('Marco')).toBe('M');
    expect(getInitials('Ana María Torres')).toBe('AM');
  });
});

describe('getAvatarColor', () => {
  it('es determinista para el mismo nombre', () => {
    expect(getAvatarColor('Lucía Gómez')).toBe(getAvatarColor('Lucía Gómez'));
  });
});

describe('StudentAvatar', () => {
  it('muestra las iniciales cuando no hay foto', async () => {
    const renderer = await renderAvatar({ name: 'Lucía Gómez' });
    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children);
    expect(texts).toContain('LG');
  });

  it('expone el nombre del alumno como etiqueta accesible', async () => {
    const renderer = await renderAvatar({
      name: 'Marco Pérez',
      testID: 'avatar-marco',
    });
    const avatar = renderer.root
      .findAll((node) => node.props.testID === 'avatar-marco')
      .find((node) => node.props.accessibilityLabel !== undefined)!;
    expect(avatar.props.accessibilityLabel).toBe('Marco Pérez');
    expect(avatar.props.accessibilityRole).toBe('image');
  });
});
