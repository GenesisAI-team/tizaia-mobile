import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

type RootStackParamList = {
  Foundation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function FoundationScreen(): React.JSX.Element {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Text accessibilityRole="header">Tizaia</Text>
      <Text>Foundation BOOTSTRAP-001 lista para el desarrollo Android.</Text>
    </View>
  );
}

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen
          name="Foundation"
          component={FoundationScreen}
          options={{ title: 'Tizaia' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
