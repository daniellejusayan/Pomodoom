import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import AppNavigator from './navigation';
import { SettingsProvider } from './context/SettingsContext';
import { SessionProvider } from './context/SessionContext';
import { ErrorBoundary } from './shared/components/ErrorBoundary/ErrorBoundary';
// initialize firebase once at app start (config placeholders must be filled first)
import './services/firebase';

export default function App() {
  // Use system defaults on web; avoid hard-blocking for font load failures.
  return (
    <ErrorBoundary>
      <SessionProvider>
        <SettingsProvider>
          <AppNavigator />
        </SettingsProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  // kept styles in case we want fallback text in the future
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
  },
});
