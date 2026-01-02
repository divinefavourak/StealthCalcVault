import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CalculatorScreen from '../screens/CalculatorScreen';
import VaultScreen from '../screens/VaultScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Vault" component={VaultScreen} />
    </Stack.Navigator>
  );
}