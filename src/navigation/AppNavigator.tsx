import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import CalculatorScreen from '../screens/CalculatorScreen';
import VaultScreen from '../screens/VaultScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // Smooth fade/slide
        gestureEnabled: false, // Prevent swipe back to keep "stealth" feel
      }}
    >
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Vault" component={VaultScreen} />
    </Stack.Navigator>
  );
}