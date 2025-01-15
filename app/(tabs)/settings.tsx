import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, List, Switch, Text, Divider, Button, SegmentedButtons, ActivityIndicator, Portal, Dialog } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../context/auth';
import { useSettings } from '../../context/settings';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Screen } from '../../components/layout';
import { useUser } from '../../context/user';
import { supabase } from '../../lib/supabase';
import React from 'react';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const { state: settings, updateSettings } = useSettings();
  const { user } = useUser();
  
  const [isBiometricAvailable, setIsBiometricAvailable] = React.useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    checkBiometricAvailability();
  }, []);

  async function checkBiometricAvailability() {
    const available = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricAvailable(available);
  }
  
  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setDeleteDialogVisible(true),
        },
      ],
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      // Delete user data from Supabase
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user?.id);

      if (error) throw error;

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user?.id as string
      );

      if (authError) throw authError;

      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogVisible(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email as string, {
        redirectTo: 'dollartracker://reset-password',
      });

      if (error) throw error;

      Alert.alert(
        'Password Reset Email Sent',
        'Check your email and open the reset link on this device to reset your password in the app.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sending reset password email:', error);
      Alert.alert(
        'Error',
        'Failed to send password reset email. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        <List.Section>
          <List.Subheader>Account Information</List.Subheader>
          <List.Item
            title={user?.email || 'No email'}
            description={`Member since ${new Date(user?.created_at || '').toLocaleDateString()}`}
            left={props => <List.Icon {...props} icon="account" />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Budget Management</List.Subheader>
          <List.Item
            title="Budget Setup"
            description="Reconfigure your income, expenses, and savings targets"
            left={props => <List.Icon {...props} icon="calculator" />}
            onPress={() => router.push('/modals/budget-wizard')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>

        <Divider />
        
        <List.Section>
          <List.Subheader>Theme</List.Subheader>
          <View style={styles.segmentedContainer}>
            <SegmentedButtons
              value={settings.theme}
              onValueChange={value => 
                updateSettings({ theme: value as typeof settings.theme })
              }
              buttons={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' }
              ]}
              disabled={settings.isSaving}
            />
            {settings.isSaving && (
              <ActivityIndicator style={styles.savingIndicator} size="small" />
            )}
          </View>
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Push Notifications"
            description="Receive important updates and alerts"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={value =>
                  updateSettings({ notificationsEnabled: value })
                }
                disabled={settings.isSaving}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Email Notifications"
            description="Get weekly summaries via email"
            left={props => <List.Icon {...props} icon="email" />}
            right={() => (
              <Switch
                value={settings.emailNotificationsEnabled}
                onValueChange={value =>
                  updateSettings({ emailNotificationsEnabled: value })
                }
                disabled={settings.isSaving}
              />
            )}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Legal</List.Subheader>
          <List.Item
            title="Privacy Policy"
            description="Read our privacy policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/modals/privacy')}
          />
          <List.Item
            title="Terms of Service"
            description="View terms of service"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/modals/terms')}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Data Management</List.Subheader>
          <List.Item
            title="Export Data"
            description="Download your transaction history"
            left={props => <List.Icon {...props} icon="download" />}
            onPress={() => router.push('/modals/export')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            disabled={settings.isSaving}
          />
          <Divider />
        </List.Section>

        <View style={styles.dangerZone}>
          <List.Section>
            <List.Subheader>Danger Zone</List.Subheader>
            <List.Item
              title="Sign Out"
              description="Sign out of your account"
              left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
              onPress={() => {
                Alert.alert(
                  'Sign Out',
                  'Are you sure you want to sign out?',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Sign Out',
                      style: 'destructive',
                      onPress: handleLogout,
                    },
                  ],
                );
              }}
            />
            <List.Item
              title="Reset Password"
              description="Send password reset instructions to your email"
              left={props => <List.Icon {...props} icon="key" color={theme.colors.error} />}
              onPress={handleResetPassword}
            />
            <List.Item
              title="Delete Account"
              description="Permanently delete your account and all data"
              left={props => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
              onPress={handleDeleteAccount}
            />
          </List.Section>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Final Confirmation</Dialog.Title>
          <Dialog.Content>
            <Text>This will permanently delete your account and all associated data. This action cannot be undone. Are you sure you want to proceed?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button
              mode="contained"
              textColor={theme.colors.error}
              loading={isDeleting}
              onPress={confirmDeleteAccount}
            >
              Delete Forever
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 2,
    paddingBottom: 32,
    marginTop: -26,
  },
  title: {
    marginTop: 16,
    marginBottom: 24,
  },
  segmentedContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingIndicator: {
    marginLeft: 16,
  },
  dangerZone: {
    marginTop: 'auto',
  },
});
