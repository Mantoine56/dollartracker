import React, { useState } from 'react';
import { View, StyleSheet, Platform, Pressable, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Text, Button, Surface, useTheme, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/layout';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/auth';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    try {
      setError(null);
      setLoading(true);
      if (isLogin) {
        await signInWithEmail(email, password);
        router.replace('/(tabs)');
      } else {
        const { needsEmailConfirmation } = await signUpWithEmail(email, password);
        if (needsEmailConfirmation) {
          setError('Please check your email to confirm your account before signing in.');
          setIsLogin(true); // Switch to login mode
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
      console.error('Email auth error:', err);
    } finally {
      setLoading(false);
    }
  };

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
    <Screen style={styles.screen}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              {error && (
                <Surface style={styles.errorContainer} elevation={1}>
                  <Text style={styles.errorText}>{error}</Text>
                </Surface>
              )}
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

              {/* Email Auth Form */}
              <View style={styles.formContainer}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                />
                <Button
                  mode="contained"
                  onPress={handleEmailAuth}
                  loading={loading}
                  style={styles.emailButton}
                >
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </Button>
                <Pressable onPress={() => setIsLogin(!isLogin)}>
                  <Text style={styles.switchText}>
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </Text>
                </Pressable>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Auth Buttons */}
              <View style={styles.socialContainer}>
                <Button
                  mode="contained-tonal"
                  onPress={handleGoogleSignIn}
                  style={styles.socialButton}
                  contentStyle={styles.buttonContent}
                  icon={({ size }) => (
                    <MaterialCommunityIcons 
                      name="google" 
                      size={24} 
                      color={theme.colors.onSurfaceVariant}
                    />
                  )}
                >
                  Continue with Google
                </Button>

                {Platform.OS === 'ios' && (
                  <Button
                    mode="contained"
                    onPress={handleAppleSignIn}
                    style={styles.appleButton}
                    contentStyle={styles.buttonContent}
                    textColor="white"
                    icon={({ size }) => (
                      <MaterialCommunityIcons 
                        name="apple" 
                        size={24} 
                        color="white"
                      />
                    )}
                  >
                    Continue with Apple
                  </Button>
                )}
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text variant="bodySmall" style={styles.footerText}>
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
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
  formContainer: {
    width: '100%',
    gap: 16,
    marginTop: 32,
  },
  input: {
    backgroundColor: 'white',
  },
  emailButton: {
    marginTop: 8,
  },
  switchText: {
    color: 'white',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'white',
    marginHorizontal: 16,
  },
  socialContainer: {
    width: '100%',
    gap: 16,
  },
  socialButton: {
    backgroundColor: 'white',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: 'white',
    opacity: 0.7,
    textAlign: 'center',
  },
});
