import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { paperTheme, navigationTheme } from './theme.config';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          {children}
        </PaperProvider>
      </SafeAreaProvider>
    </NavigationThemeProvider>
  );
}
