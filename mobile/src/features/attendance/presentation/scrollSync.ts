import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import type { RefObject } from 'react';

/**
 * Sincroniza el desplazamiento horizontal de las celdas con la cabecera de
 * fechas (issue #17): la cabecera sigue al contenido y permanece fija
 * verticalmente. Debe llamarse desde un manejador de evento, nunca durante
 * el render.
 */
export function syncHeaderScroll(
  headerRef: RefObject<ScrollView | null>,
  event: NativeSyntheticEvent<NativeScrollEvent>,
): void {
  headerRef.current?.scrollTo({
    animated: false,
    x: event.nativeEvent.contentOffset.x,
  });
}
