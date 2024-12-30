import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { theme } from './index';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';

const navigationTheme = {
  dark: false,
  colors: {
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.onSurface,
    border: theme.colors.outline,
    notification: theme.colors.error,
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          {children}
        </PaperProvider>
      </SafeAreaProvider>
    </NavigationThemeProvider>
  );
}
