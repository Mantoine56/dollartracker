import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../context/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';
import { Redirect, Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useAppTheme } from '../theme/theme.config';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { UserProvider } from '../context/user';
import { SettingsProvider, useSettings } from '../context/settings';
import { SupabaseProvider } from '../context/supabase'; // Added import statement

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Suppress specific warnings if needed
LogBox.ignoreLogs([
  'Warning: ...',
  // Add other warnings to ignore
]);

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { state: settings } = useSettings();
  const { paperTheme, navigationTheme } = useAppTheme(settings.theme);

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationThemeProvider value={navigationTheme}>
        {children}
      </NavigationThemeProvider>
    </PaperProvider>
  );
}

function NavigationContent() {
  const { user, loading } = useAuth();

  const onLayoutRootView = useCallback(async () => {
    if (!loading) {
      await SplashScreen.hideAsync();
    }
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="(auth)" 
          options={{ 
            headerShown: false,
            animation: 'fade'
          }} 
          redirect={user !== null}
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            animation: 'fade'
          }} 
          redirect={!user}
        />
        <Stack.Screen 
          name="modals" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }} 
        />
      </Stack>
      {loading ? null : (
        <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SupabaseProvider>
            <AuthProvider>
              <UserProvider>
                <SettingsProvider>
                  <ThemedApp>
                    <NavigationContent />
                  </ThemedApp>
                </SettingsProvider>
              </UserProvider>
            </AuthProvider>
          </SupabaseProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
