import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AppDependenciesProvider } from './src/app/AppDependenciesProvider';
import { createAppDependencies } from './src/app/createAppDependencies';
import { AuthProvider } from './src/features/auth/application/AuthProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

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
