import { ActivityIndicator, Text } from 'react-native';
import { act, create } from 'react-test-renderer';

import { BrandMark } from './BrandMark';
import { AuthTransitionLoading } from './AuthTransitionLoading';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('AuthTransitionLoading', () => {
  it('muestra la marca TizaIA con variante loading y la palabra TIZAIA estática', async () => {
    let renderer: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(<AuthTransitionLoading />);
    });
    const brandMarks = renderer!.root.findAllByType(BrandMark);
    expect(brandMarks).toHaveLength(1);
    expect(brandMarks[0]!.props.variant).toBe('loading');
    const texts = renderer!.root.findAllByType(Text);
    const hasTizaia = texts.some((t) => t.props.children === 'TIZAIA');
    expect(hasTizaia).toBe(true);
  });

  it('muestra un spinner pequeño debajo de TIZAIA', async () => {
    let renderer: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(<AuthTransitionLoading />);
    });
    const spinners = renderer!.root.findAllByType(ActivityIndicator);
    expect(spinners).toHaveLength(1);
    expect(spinners[0]!.props.size).toBe('small');
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
