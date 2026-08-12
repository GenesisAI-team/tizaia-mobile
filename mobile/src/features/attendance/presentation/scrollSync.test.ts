import type { ScrollView } from 'react-native';

import { syncHeaderScroll } from './scrollSync';

describe('syncHeaderScroll', () => {
  const scrollEvent = (x: number) =>
    ({
      nativeEvent: { contentOffset: { x, y: 0 } },
    }) as never;

  it('traslada el desplazamiento horizontal de las celdas a la cabecera', () => {
    const scrollTo = jest.fn();
    const headerRef = {
      current: { scrollTo } as unknown as ScrollView,
    };
    syncHeaderScroll(headerRef, scrollEvent(140));
    expect(scrollTo).toHaveBeenCalledWith({ animated: false, x: 140 });
  });

  it('no falla si la cabecera todavía no está montada', () => {
    expect(() =>
      syncHeaderScroll({ current: null }, scrollEvent(10)),
    ).not.toThrow();
  });
});
