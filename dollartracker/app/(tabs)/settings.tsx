import React from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  useTheme, 
  List, 
  Switch, 
  Divider,
  Avatar
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/auth';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Screen } from '../../components/layout';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  
  // State for toggles
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notifyBudget, setNotifyBudget] = React.useState(true);
  const [notifyAchievements, setNotifyAchievements] = React.useState(true);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  return (
    <Screen>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        <Animated.View entering={FadeIn.duration(300)}>
          <Text variant="headlineMedium" style={styles.title}>Settings</Text>
          
          <List.Section>
            <List.Subheader>Budget Management</List.Subheader>
            <List.Item
              title="Budget Setup"
              description="Configure your income, expenses, and savings targets"
              left={props => <List.Icon {...props} icon="calculator" />}
              onPress={() => router.push('/modals/budget-wizard')}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider />
          </List.Section>

          <List.Section>
            <List.Subheader>User Profile</List.Subheader>
            <List.Item
              title={user?.email || 'Guest User'}
              description="Manage your account"
              left={() => (
                <Avatar.Text 
                  size={48} 
                  label={user?.email ? user.email[0].toUpperCase() : 'G'}
                  style={{ backgroundColor: theme.colors.primary }}
                />
              )}
            />
            {user && (
              <>
                <Divider />
                <List.Item
                  title="Email"
                  description={user.email}
                  left={props => <List.Icon {...props} icon="email" />}
                />
                <Divider />
                <List.Item
                  title="User ID"
                  description={user.id}
                  left={props => <List.Icon {...props} icon="identifier" />}
                />
              </>
            )}
          </List.Section>

          <List.Section>
            <List.Subheader>Theme</List.Subheader>
            <List.Item
              title="Dark Mode"
              description="Enable dark theme"
              left={props => <List.Icon {...props} icon="moon-waning-crescent" />}
              right={props => (
                <Switch
                  value={isDarkMode}
                  onValueChange={setIsDarkMode}
                  color={theme.colors.primary}
                />
              )}
            />
          </List.Section>

          <List.Section>
            <List.Subheader>Notifications</List.Subheader>
            <List.Item
              title="Budget Updates"
              description="Get notified about your spending"
              left={props => <List.Icon {...props} icon="cash" />}
              right={props => (
                <Switch
                  value={notifyBudget}
                  onValueChange={setNotifyBudget}
                  color={theme.colors.primary}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Achievements"
              description="Get notified about your milestones"
              left={props => <List.Icon {...props} icon="trophy" />}
              right={props => (
                <Switch
                  value={notifyAchievements}
                  onValueChange={setNotifyAchievements}
                  color={theme.colors.primary}
                />
              )}
            />
          </List.Section>

          <List.Section>
            <List.Subheader>Account Actions</List.Subheader>
            <List.Item
              title="Sign Out"
              description="Sign out of your account"
              left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
              onPress={confirmLogout}
              right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.error} />}
            />
          </List.Section>

          <List.Section>
            <List.Subheader>App Info</List.Subheader>
            <List.Item
              title="About"
              description="App version 1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
            />
          </List.Section>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
});
