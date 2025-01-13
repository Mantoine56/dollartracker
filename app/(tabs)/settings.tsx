import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, List, Switch, Text, Divider, Button, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../context/auth';
import { useSettings } from '../../context/settings';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Screen } from '../../components/layout';
import React from 'react';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const { state: settings, updateSettings } = useSettings();
  
  const [isBiometricAvailable, setIsBiometricAvailable] = React.useState(false);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
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

        {isBiometricAvailable && (
          <>
            <List.Section>
              <List.Subheader>Security</List.Subheader>
              <List.Item
                title="Biometric Authentication"
                description="Use Face ID or Touch ID to secure your app"
                left={props => <List.Icon {...props} icon="fingerprint" />}
                right={() => (
                  <Switch
                    value={false}
                    onValueChange={() => {
                      // TODO: Implement biometric auth
                    }}
                    disabled={true}
                  />
                )}
              />
            </List.Section>
            <Divider />
          </>
        )}

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
          <List.Item
            title="Privacy Policy"
            description="Read our privacy policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => router.push('/modals/privacy')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title="Terms of Service"
            description="View terms of service"
            left={props => <List.Icon {...props} icon="file-document" />}
            onPress={() => router.push('/modals/terms')}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>

        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor={theme.colors.error}
            disabled={settings.isSaving}
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>
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
  logoutContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  logoutButton: {
    borderColor: 'transparent',
  },
});
