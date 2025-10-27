/**
 * 速记星
 * 快速记忆英语单词的React Native应用
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppInitialization, useUserAgreementStatus } from './src/hooks/useStorage';

function AppContent() {
  const { isInitialized, loading: initLoading } = useAppInitialization();
  const {
    hasAcceptedCurrentVersion,
    loading: agreementLoading,
    acceptAgreement,
  } = useUserAgreementStatus();

  if (initLoading || agreementLoading || !isInitialized) {
    return null;
  }

  const needsAgreement = !hasAcceptedCurrentVersion;

  return (
    <AppNavigator
      needsAgreement={needsAgreement}
      onAgreementAccepted={acceptAgreement}
    />
  );
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
