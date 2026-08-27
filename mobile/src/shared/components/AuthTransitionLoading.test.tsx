import { act, create } from 'react-test-renderer';
import Animated from 'react-native-reanimated';

import { BrandMark } from './BrandMark';
import { AuthTransitionLoading } from './AuthTransitionLoading';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('AuthTransitionLoading', () => {
  it('muestra la marca TizaIA con variante loading y la palabra TIZAIA', async () => {
    let renderer: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(<AuthTransitionLoading />);
    });
    const brandMarks = renderer!.root.findAllByType(BrandMark);
    expect(brandMarks).toHaveLength(1);
    expect(brandMarks[0]!.props.variant).toBe('loading');
    const animatedTexts = renderer!.root.findAllByType(Animated.Text);
    expect(animatedTexts).toHaveLength(6);
    expect(animatedTexts.map((t) => t.props.children).join('')).toBe('TIZAIA');
  });

  it('expone estado accesible de carga', async () => {
    let renderer: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(<AuthTransitionLoading />);
    });
    const loader = renderer!.root.findByProps({
      accessibilityLabel: 'Cargando TizaIA',
    });
    expect(loader.props.accessibilityRole).toBe('progressbar');
  });
});
