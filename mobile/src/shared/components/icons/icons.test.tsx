import { act } from 'react';
import { Circle, Line, Path, Polyline } from 'react-native-svg';
import { create, type ReactTestRenderer } from 'react-test-renderer';

import { colors } from '../../theme/theme';
import { CheckIcon } from './CheckIcon';
import { EyeIcon } from './EyeIcon';
import { MailPlusIcon } from './MailPlusIcon';
import { TrashIcon } from './TrashIcon';
import type { IconProps } from './types';
import { WarningIcon } from './WarningIcon';

type IconComponent = (props: IconProps) => React.JSX.Element;

const STROKE_TYPES = [Path, Circle, Line, Polyline];

async function renderIcon(
  Icon: IconComponent,
  props: IconProps = {},
): Promise<ReactTestRenderer> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<Icon {...props} />);
  });
  return renderer;
}

function strokesOf(
  renderer: ReactTestRenderer,
): { props: { stroke?: string } }[] {
  return STROKE_TYPES.flatMap((type) => renderer.root.findAllByType(type));
}

describe('iconos compartidos (UI-000, issue #16)', () => {
  it.each<[string, IconComponent, string]>([
    ['EyeIcon', EyeIcon, colors.info],
    ['WarningIcon', WarningIcon, colors.warning],
    ['TrashIcon', TrashIcon, colors.danger],
    ['MailPlusIcon', MailPlusIcon, colors.primary],
    ['CheckIcon', CheckIcon, colors.success],
  ])(
    '%s renderiza un SVG decorativo de 24 con su color por defecto',
    async (_name, Icon, expectedColor) => {
      const renderer = await renderIcon(Icon);
      const svg = renderer.root.findByProps({ viewBox: '0 0 24 24' });
      expect(svg.props.width).toBe(24);
      expect(svg.props.height).toBe(24);
      expect(svg.props.accessible).toBe(false);
      const strokes = strokesOf(renderer).map((node) => node.props.stroke);
      expect(strokes.length).toBeGreaterThan(0);
      expect(new Set(strokes)).toEqual(new Set([expectedColor]));
    },
  );

  it('admite tamaño y color personalizados', async () => {
    const renderer = await renderIcon(CheckIcon, {
      color: '#123456',
      size: 32,
    });
    const svg = renderer.root.findByProps({ viewBox: '0 0 24 24' });
    expect(svg.props.width).toBe(32);
    expect(svg.props.height).toBe(32);
    const strokes = strokesOf(renderer).map((node) => node.props.stroke);
    expect(new Set(strokes)).toEqual(new Set(['#123456']));
  });
});
