import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider } from './src/context/AppContext';
import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { AppState } from 'react-native';

export default function App() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        await ScreenCapture.preventScreenCaptureAsync(); // Blank preview on Android
      } else if (nextState === 'active') {
        await ScreenCapture.allowScreenCaptureAsync();
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}