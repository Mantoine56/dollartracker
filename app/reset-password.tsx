import { useState, useEffect } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Screen } from '../components/layout/Screen';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { access_token } = useLocalSearchParams();

  useEffect(() => {
    if (!access_token) {
      Alert.alert('Error', 'Invalid or expired reset link');
      router.replace('/');
    }
  }, [access_token]);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your password has been reset successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/')
          }
        ]
      );
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: 'Reset Password',
          headerBackVisible: false
        }}
      />
      <View style={styles.container}>
        <Text variant="headlineMedium" style={{ marginBottom: 24 }}>
          Set New Password
        </Text>
        <TextInput
          label="New Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ marginBottom: 16 }}
        />
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={{ marginBottom: 24 }}
        />
        <Button
          mode="contained"
          onPress={handleResetPassword}
          loading={loading}
          disabled={loading || !password || !confirmPassword}
        >
          Reset Password
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
