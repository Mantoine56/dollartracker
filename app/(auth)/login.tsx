/**
 * File: app/(auth)/login.tsx
 * Description: Login screen component for DollarTracker app
 * This component handles user authentication through email/password,
 * Google Sign-In, and Apple Sign-In (iOS only).
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform, Pressable, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Text, Button, Surface, useTheme, TextInput, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

// Validation schema for authentication inputs
const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * LoginScreen Component
 * Provides a user interface for authentication with the following features:
 * - Email/password authentication
 * - Social authentication (Google, Apple)
 * - Password reset functionality
 * - New user registration
 */
export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles email authentication
   * Validates user input using the authSchema
   * Calls the signInWithEmail or signUpWithEmail function based on the isLogin state
   */
  const handleEmailAuth = async () => {
    try {
      setError(null);
      setLoading(true);

      const credentials = authSchema.parse({ email, password });
      
      if (isLogin) {
        await signInWithEmail(credentials.email, credentials.password);
        router.replace('/(tabs)');
      } else {
        const { needsEmailConfirmation } = await signUpWithEmail(credentials.email, credentials.password);
        if (needsEmailConfirmation) {
          router.push('/(auth)/confirm');
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please try again.');
      }
      console.error('Email auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Google Sign-In authentication
   * Calls the signInWithGoogle function
   */
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Google sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Apple Sign-In authentication (iOS only)
   * Calls the signInWithApple function
   */
  const handleAppleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithApple();
      router.replace('/(tabs)');
    } catch (err) {
      setError('Failed to sign in with Apple. Please try again.');
      console.error('Apple sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryContainer]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.screen} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.screen}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
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
                <Text variant="bodyLarge" style={styles.subtitle}>
                  Smart budgeting made simple
                </Text>
              </View>

              <Surface style={styles.form} elevation={1}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  disabled={loading}
                  error={!!error && error.toLowerCase().includes('email')}
                />
                
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  disabled={loading}
                  error={!!error && error.toLowerCase().includes('password')}
                />

                {error && <HelperText type="error">{error}</HelperText>}

                {isLogin && (
                  <Pressable
                    onPress={() => router.push('/(auth)/forgot-password')}
                    style={styles.forgotPassword}
                  >
                    <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                      Forgot Password?
                    </Text>
                  </Pressable>
                )}

                <Button
                  mode="contained"
                  onPress={handleEmailAuth}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtons}>
                  <Button
                    mode="outlined"
                    icon="google"
                    onPress={handleGoogleSignIn}
                    disabled={loading}
                    style={[styles.socialButton, styles.googleButton]}
                    textColor={theme.colors.onSurface}
                  >
                    Google
                  </Button>
                  {Platform.OS === 'ios' && (
                    <Button
                      mode="outlined"
                      icon="apple"
                      onPress={handleAppleSignIn}
                      disabled={loading}
                      style={[styles.socialButton, styles.appleButton]}
                      textColor={theme.colors.onSurface}
                    >
                      Apple
                    </Button>
                  )}
                </View>

                <Pressable
                  onPress={() => setIsLogin(!isLogin)}
                  style={styles.switchAuth}
                >
                  <Text variant="bodyMedium" style={styles.switchAuthText}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </Text>
                </Pressable>
              </Surface>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  form: {
    padding: 24,
    borderRadius: 16,
    gap: 16,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    marginHorizontal: 8,
    opacity: 0.5,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  socialButton: {
    flex: 1,
  },
  googleButton: {
    borderColor: '#4285F4',
  },
  appleButton: {
    borderColor: '#000000',
  },
  switchAuth: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchAuthText: {
    color: 'white',
  },
});
