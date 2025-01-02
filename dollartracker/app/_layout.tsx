import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../context/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { paperTheme, navigationTheme } from '../theme/theme.config';

// Suppress specific warnings if needed
LogBox.ignoreLogs([
  'Warning: ...',
  // Add other warnings to ignore
]);

function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login if not authenticated
    return <Slot />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationThemeProvider value={navigationTheme}>
            <SafeAreaProvider>
              <PaperProvider theme={paperTheme}>
                <View style={{ flex: 1 }}>
                  <ProtectedRoute />
                </View>
              </PaperProvider>
            </SafeAreaProvider>
          </NavigationThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
