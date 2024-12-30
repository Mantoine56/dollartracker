import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Mock auth functions - replace with real implementation
  const handleGoogleSignIn = async () => {
    try {
      // TODO: Implement Google Sign In
      router.replace('/(tabs)');
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      // TODO: Implement Apple Sign In
      router.replace('/(tabs)');
    } catch (err) {
      setError('Failed to sign in with Apple. Please try again.');
    }
  };

  return (
    <Screen>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <Surface style={styles.logoContainer} elevation={4}>
              <MaterialCommunityIcons
                name="wallet"
                size={64}
                color={theme.colors.primary}
              />
            </Surface>
            <Text variant="displaySmall" style={styles.title}>
              DollarTracker
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              Smart budgeting made simple
            </Text>
          </View>

          {/* Auth Buttons */}
          <View style={styles.authContainer}>
            <Surface style={styles.buttonContainer} elevation={2}>
              <Button
                mode="contained-tonal"
                onPress={handleGoogleSignIn}
                style={styles.button}
                contentStyle={styles.buttonContent}
                icon={({ size, color }) => (
                  <MaterialCommunityIcons 
                    name="google" 
                    size={24} 
                    color={color}
                  />
                )}
              >
                Continue with Google
              </Button>

              {Platform.OS === 'ios' && (
                <Button
                  mode="contained-tonal"
                  onPress={handleAppleSignIn}
                  style={[styles.button, styles.appleButton]}
                  contentStyle={styles.buttonContent}
                  icon={({ size, color }) => (
                    <MaterialCommunityIcons 
                      name="apple" 
                      size={24} 
                      color={color}
                    />
                  )}
                >
                  Continue with Apple
                </Button>
              )}
            </Surface>

            {/* Error Message */}
            {error && (
              <Surface style={styles.errorContainer} elevation={1}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={20}
                  color={theme.colors.error}
                />
                <Text variant="bodyMedium" style={styles.errorText}>
                  {error}
                </Text>
              </Surface>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="bodySmall" style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 64,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: 'white',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    opacity: 0.9,
  },
  authContainer: {
    width: '100%',
    gap: 16,
  },
  buttonContainer: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
    gap: 12,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    gap: 8,
  },
  errorText: {
    color: 'red',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    opacity: 0.7,
    textAlign: 'center',
  },
});
