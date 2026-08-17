import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import type { TabBarTab } from '../shared/components';
import type { RootDrawerParamList } from './types';

/**
 * Acción de la TabBar compartida: Home → Home, Overview → Clases.
 * El destino de Overview no está definido en Tizaia.op (Q-015): se cablea
 * provisionalmente a Clases.
 */
export function useTabBarPress(): (tab: TabBarTab) => void {
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  return (tab) => {
    navigation.navigate(tab === 'home' ? 'Home' : 'Classes');
  };
}
