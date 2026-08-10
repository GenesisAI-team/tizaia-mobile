import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import {
  AuthProvider,
  useAuth,
} from './src/features/auth/application/AuthProvider';
import { LoginScreen } from './src/features/auth/presentation/LoginScreen';
import { createSupabaseAuthGateway } from './src/features/auth/infrastructure/supabaseAuthGateway';
import { createSupabaseClient } from './src/infrastructure/supabase/client';
import { AppDrawerNavigator } from './src/navigation/AppDrawerNavigator';

const authGateway = createSupabaseAuthGateway(createSupabaseClient());

function LoadingScreen(): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator accessibilityLabel="Restaurando sesión" />
    </View>
  );
}

function RootNavigator(): React.JSX.Element {
  const { isLoading, session } = useAuth();
  if (isLoading) return <LoadingScreen />;

  return session ? <AppDrawerNavigator /> : <LoginScreen />;
}

export default function App(): React.JSX.Element {
  return (
    <AuthProvider gateway={authGateway}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
