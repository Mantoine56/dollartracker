import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Text, 
  useTheme, 
  Button, 
  List, 
  Switch, 
  Divider,
  Surface,
  IconButton
} from 'react-native-paper';
import { Screen } from '../../components/layout';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  // State for toggles
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifyBudget, setNotifyBudget] = useState(true);
  const [notifyAchievements, setNotifyAchievements] = useState(true);

  // Mock auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/auth/login');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <Screen>
      <Surface style={styles.header} elevation={1}>
        <View>
          <Text variant="headlineMedium">Settings</Text>
        </View>
      </Surface>

      <View style={styles.container}>
        {/* Budget Section */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionContent}>
            <List.Item
              title="Budget Setup"
              description="Configure your daily and monthly budget limits"
              left={props => <List.Icon {...props} icon="wallet" />}
              right={props => (
                <IconButton
                  {...props}
                  icon="chevron-right"
                  onPress={() => router.push('/setup')}
                />
              )}
            />
          </View>
        </Surface>

        {/* Theme Section */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionContent}>
            <List.Item
              title="Theme"
              description="Customize app appearance"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
            />
            <Divider />
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
          </View>
        </Surface>

        {/* Notifications Section */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionContent}>
            <List.Item
              title="Notifications"
              description="Manage app notifications"
              left={props => <List.Icon {...props} icon="bell" />}
            />
            <Divider />
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
              description="Get notified about new badges and levels"
              left={props => <List.Icon {...props} icon="trophy" />}
              right={props => (
                <Switch
                  value={notifyAchievements}
                  onValueChange={setNotifyAchievements}
                  color={theme.colors.primary}
                />
              )}
            />
          </View>
        </Surface>

        {/* Authentication Section */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionContent}>
            <List.Item
              title="Account"
              description="Manage your account settings"
              left={props => <List.Icon {...props} icon="account" />}
            />
            <Divider />
            {isLoggedIn ? (
              <List.Item
                title="Sign Out"
                description="Sign out of your account"
                left={props => <List.Icon {...props} icon="logout" />}
                onPress={handleLogout}
              />
            ) : (
              <>
                <List.Item
                  title="Sign In"
                  description="Sign in to your account"
                  left={props => <List.Icon {...props} icon="login" />}
                  onPress={handleLogin}
                />
                <Divider />
                <List.Item
                  title="Create Account"
                  description="Create a new account"
                  left={props => <List.Icon {...props} icon="account-plus" />}
                  onPress={() => router.push('/auth/login')}
                />
              </>
            )}
          </View>
        </Surface>

        {/* App Info Section */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionContent}>
            <List.Item
              title="About"
              description="Version 1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
            />
          </View>
        </Surface>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    paddingTop: 24,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 12,
  },
  sectionContent: {
    overflow: 'hidden',
    borderRadius: 12,
  },
});
