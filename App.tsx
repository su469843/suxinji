/**
 * 速记星
 * 快速记忆英语单词的React Native应用
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppInitialization } from './src/hooks/useStorage';

function AppContent() {
  const { isInitialized, loading } = useAppInitialization();

  if (loading) {
    return null; // Or a loading screen
  }

  return <AppNavigator />;
}

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#4facfe" />
        <AppContent />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
