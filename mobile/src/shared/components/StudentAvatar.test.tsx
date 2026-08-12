import { act } from 'react';
import { StyleSheet, Text } from 'react-native';
import { create, type ReactTestRenderer } from 'react-test-renderer';

import { getAvatarInitials, StudentAvatar } from './StudentAvatar';

async function renderAvatar(
  props: React.ComponentProps<typeof StudentAvatar>,
): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<StudentAvatar {...props} />);
  });
  return renderer;
}

describe('getAvatarInitials', () => {
  it('usa la inicial del nombre cuando hay una sola palabra', () => {
    expect(getAvatarInitials('Ana')).toBe('A');
  });

  it('usa las dos primeras iniciales en mayúsculas (nombre y apellido)', () => {
    expect(getAvatarInitials('ana garcía')).toBe('AG');
  });

  it('ignora palabras adicionales a partir de la segunda', () => {
    expect(getAvatarInitials('Ana García López')).toBe('AG');
  });

  it('tolera espacios extremos y múltiples separadores', () => {
    expect(getAvatarInitials('  Ana   García  ')).toBe('AG');
  });

  it('devuelve ? cuando el nombre está vacío', () => {
    expect(getAvatarInitials('   ')).toBe('?');
  });
});

describe('StudentAvatar (UI-000)', () => {
  it('muestra las iniciales cuando no hay foto', async () => {
    const renderer = await renderAvatar({ name: 'Ana García' });
    const initials = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children);
    expect(initials).toEqual(['AG']);
  });

  it('muestra la imagen remota cuando hay uri', async () => {
    const renderer = await renderAvatar({
      name: 'Ana García',
      testID: 'avatar',
      uri: 'https://example.com/ana.png',
    });
    // Se busca el nodo renderizado (no el compuesto StudentAvatar, cuyas
    // props también llevan testID) y se compara source por valor.
    const image = renderer.root.find(
      (node) =>
        node.props.testID === 'avatar' &&
        node.props.source?.uri === 'https://example.com/ana.png',
    );
    expect(image).toBeTruthy();
    expect(renderer.root.findAllByType(Text)).toHaveLength(0);
  });

  it('aplica la etiqueta accesible por defecto y rol de imagen', async () => {
    const renderer = await renderAvatar({ name: 'Ana García' });
    const avatar = renderer.root.findByProps({
      accessibilityLabel: 'Foto de Ana García',
    });
    expect(avatar.props.accessibilityRole).toBe('image');
  });

  it('permite sobrescribir la etiqueta accesible', async () => {
    const renderer = await renderAvatar({
      accessibilityLabel: 'Remitente',
      name: 'Ana García',
    });
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Remitente' }),
    ).toBeTruthy();
  });

  it('aplica el tamaño como círculo (ancho, alto y radio)', async () => {
    const renderer = await renderAvatar({
      name: 'Ana García',
      size: 64,
      testID: 'avatar',
    });
    const avatar = renderer.root.find(
      (node) => node.props.testID === 'avatar' && node.props.style != null,
    );
    const style = StyleSheet.flatten(avatar.props.style);
    expect(style).toMatchObject({ borderRadius: 32, height: 64, width: 64 });
  });
});
