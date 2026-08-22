import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { ResourceState } from '../state/schoolDataProvider';
import { dp, tizaiaColors } from '../theme/tizaiaTheme';

type DataStateViewProps = {
  state: ResourceState<unknown>;
  /** Texto mostrado cuando la consulta no devuelve datos. */
  emptyMessage?: string;
  onRetry?: () => void;
};

/**
 * Estados transversales de las pantallas conectadas a la API (MOB-API-001):
 * carga (spinner), vacío (mensaje) y error recuperable con reintento.
 * Las pantallas renderizan su contenido solo en `success`.
 */
export function DataStateView({
  state,
  emptyMessage = 'No hay datos disponibles.',
  onRetry,
}: DataStateViewProps): React.JSX.Element | null {
  if (state.status === 'loading' && state.data === undefined) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          accessibilityLabel="Cargando datos"
          color={tizaiaColors.inkButton}
          size="large"
        />
      </View>
    );
  }
  if (state.status === 'empty') {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>{emptyMessage}</Text>
      </View>
    );
  }
  if (state.status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>No se pudieron cargar los datos</Text>
        <Text style={styles.errorMessage}>{state.error}</Text>
        {onRetry !== undefined && (
          <Pressable
            accessibilityLabel="Reintentar la carga"
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryPressed,
            ]}
            testID="data-state-retry"
          >
            <Text style={styles.retryLabel}>Reintentar</Text>
          </Pressable>
        )}
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: dp(48),
  },
  errorTitle: {
    color: tizaiaColors.ink,
    fontSize: dp(24),
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMessage: {
    color: tizaiaColors.textMenuSecondary,
    fontSize: dp(19),
    marginTop: dp(12),
    textAlign: 'center',
  },
  message: {
    color: tizaiaColors.textMenuSecondary,
    fontSize: dp(21),
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: tizaiaColors.inkButton,
    borderRadius: dp(20),
    marginTop: dp(24),
    paddingHorizontal: dp(36),
    paddingVertical: dp(16),
  },
  retryLabel: {
    color: tizaiaColors.white,
    fontSize: dp(19),
    fontWeight: '700',
  },
  retryPressed: {
    opacity: 0.8,
  },
});
