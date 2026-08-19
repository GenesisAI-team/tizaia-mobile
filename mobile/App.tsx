import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AppDependenciesProvider } from './src/app/AppDependenciesProvider';
import { createAppDependencies } from './src/app/createAppDependencies';
import {
  AuthProvider,
  useAuth,
} from './src/features/auth/application/AuthProvider';
import { LoginScreen } from './src/features/auth/presentation/LoginScreen';
import { AppDrawerNavigator } from './src/navigation/AppDrawerNavigator';

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
  const [dependencies] = useState(createAppDependencies);

  return (
    <AppDependenciesProvider dependencies={dependencies}>
      <AuthProvider gateway={dependencies.authGateway}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </AppDependenciesProvider>
  );
}
