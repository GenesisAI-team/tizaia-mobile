import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import {
  AuthProvider,
  useAuth,
} from './src/features/auth/application/AuthProvider';
import { LoginScreen } from './src/features/auth/presentation/LoginScreen';
import { HomeScreen } from './src/features/auth/presentation/HomeScreen';
import { createSupabaseAuthGateway } from './src/features/auth/infrastructure/supabaseAuthGateway';
import { createSupabaseClient } from './src/infrastructure/supabase/client';
import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
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

  return (
    <Stack.Navigator>
      {session ? (
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Acceso' }}
        />
      )}
    </Stack.Navigator>
  );
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
