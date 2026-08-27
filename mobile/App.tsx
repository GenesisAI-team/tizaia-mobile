import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AppDependenciesProvider } from './src/app/AppDependenciesProvider';
import { createAppDependencies } from './src/app/createAppDependencies';
import {
  AuthProvider,
  useAuth,
} from './src/features/auth/application/AuthProvider';
import { LoginScreen } from './src/features/auth/presentation/LoginScreen';
import { AppDrawerNavigator } from './src/navigation/AppDrawerNavigator';
import { AuthTransitionLoading } from './src/shared/components/AuthTransitionLoading';

function RootNavigator(): React.JSX.Element {
  const { isLoading, session } = useAuth();
  if (isLoading) return <AuthTransitionLoading />;

  return session ? <AppDrawerNavigator /> : <LoginScreen />;
}

export default function App(): React.JSX.Element {
  const [dependencies] = useState(createAppDependencies);

  return (
    <AppDependenciesProvider dependencies={dependencies}>
      <AuthProvider gateway={dependencies.authGateway}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </AppDependenciesProvider>
  );
}
