import React from 'react';

import AppNavigator from './navigation';
import { SettingsProvider } from './context/SettingsContext';
// initialize firebase once at app start (config placeholders must be filled first)
import './services/firebase';

// --- load required fonts --------------------------------------------------
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    // add other icon fonts here if your app uses them (FontAwesome, etc.)
  });

  if (!fontsLoaded) {
    return null; // or a loading indicator
  }

  return (
    <SettingsProvider>
      <AppNavigator />
    </SettingsProvider>
  );
}
