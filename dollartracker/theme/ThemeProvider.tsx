import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { theme } from './index';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </SafeAreaProvider>
  );
}
