import { act } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';

import {
  ActionIconButton,
  ScreenTitle,
  StudentAvatar,
} from '../../../shared/components';
import { MailPlusIcon } from '../../../shared/components/icons';
import { getSenderInitials, MailListItem } from './MailListItem';
import { MailScreen } from './MailScreen';
import { MAX_VISIBLE_MAILS, mockMails } from './mockMails';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

async function renderMailScreen(): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<MailScreen />);
  });
  return renderer;
}

function flattenText(node: ReactTestInstance): string {
  return node
    .findAllByType(Text)
    .map((t) => t.props.children)
    .join('');
}

describe('getSenderInitials', () => {
  it('toma la inicial de las dos primeras palabras en mayúsculas', () => {
    expect(getSenderInitials('Marta Jiménez')).toBe('MJ');
    expect(getSenderInitials('ana belén ruiz')).toBe('AB');
  });

  it('usa una única inicial para nombres de una palabra y recorta espacios', () => {
    expect(getSenderInitials('  Secretaría  ')).toBe('S');
  });
});

describe('MailScreen (diseño visual, issue #21)', () => {
  it('muestra el título visual MAILS con el componente compartido', async () => {
    const renderer = await renderMailScreen();
    const titles = renderer.root.findAllByType(ScreenTitle);
    expect(titles).toHaveLength(1);
    expect(titles[0]!.props.children).toBe('MAILS');
  });

  it('lista hasta diez correos mock', async () => {
    const renderer = await renderMailScreen();
    expect(mockMails).toHaveLength(10);
    expect(renderer.root.findAllByType(MailListItem)).toHaveLength(
      MAX_VISIBLE_MAILS,
    );
  });

  it('cada fila muestra avatar, nombre, hora/fecha, asunto y descripción', async () => {
    const renderer = await renderMailScreen();
    const rows = renderer.root.findAllByType(MailListItem);
    expect(rows).toHaveLength(mockMails.length);
    expect(renderer.root.findAllByType(StudentAvatar)).toHaveLength(
      mockMails.length,
    );
    mockMails.forEach((mock, index) => {
      const rowText = flattenText(rows[index]!);
      expect(rowText).toContain(mock.senderName);
      expect(rowText).toContain(mock.displayDate);
      expect(rowText).toContain(mock.subject);
      expect(rowText).toContain(mock.snippet);
      expect(rowText).toContain(getSenderInitials(mock.senderName));
    });
  });

  it('los correos no leídos del mock van en negrita y los leídos atenuados', async () => {
    const renderer = await renderMailScreen();
    const rows = renderer.root.findAllByType(MailListItem);
    rows.forEach((row, index) => {
      const sender = row
        .findAllByType(Text)
        .find((t) => t.props.children === mockMails[index]!.senderName);
      const weight = StyleSheet.flatten(sender!.props.style).fontWeight;
      expect(weight).toBe(mockMails[index]!.isUnread ? '700' : '600');
    });
  });

  it('muestra el botón correo+ centrado abajo, sin acción todavía', async () => {
    const renderer = await renderMailScreen();
    const button = renderer.root.findByProps({
      accessibilityLabel: 'Redactar nuevo correo',
    });
    expect(button).toBeTruthy();
    expect(button.findAllByType(ActionIconButton)).toHaveLength(1);
    expect(button.findAllByType(MailPlusIcon)).toHaveLength(1);
    // La acción de componer queda pendiente (HU-011): pulsar no navega.
    expect(() => button.props.onPress()).not.toThrow();
  });
});
