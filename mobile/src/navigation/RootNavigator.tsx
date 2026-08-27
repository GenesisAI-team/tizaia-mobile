import { useAuth } from '../features/auth/application/AuthProvider';
import { AuthLoadingScreen } from '../features/auth/presentation/AuthLoadingScreen';
import { LoginScreen } from '../features/auth/presentation/LoginScreen';
import { AppDrawerNavigator } from './AppDrawerNavigator';

/**
 * Enrutado raíz de auth (AUTH-UX-086):
 * - isInitializing: restauración global de sesión → AuthLoadingScreen con branding.
 * - session: aplicación autenticada.
 * - resto: Login, que permanece montado durante isAuthenticating (OAuth en curso).
 */
export function RootNavigator(): React.JSX.Element {
  const { isInitializing, session } = useAuth();
  if (isInitializing) return <AuthLoadingScreen />;

  return session ? <AppDrawerNavigator /> : <LoginScreen />;
}
