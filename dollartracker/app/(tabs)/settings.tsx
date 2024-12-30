import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  useTheme, 
  Button, 
  List, 
  Switch, 
  Divider,
  Surface,
  IconButton,
  Avatar
} from 'react-native-paper';
import { Screen } from '../../components/layout';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth';

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
      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <View style={styles.sectionWrapper}>
          <Surface style={styles.section} elevation={1}>
            <View style={styles.sectionContent}>
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
            </View>
          </Surface>
        </View>

        {/* Budget Section */}
        <View style={styles.sectionWrapper}>
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
        </View>

        {/* Theme Section */}
        <View style={styles.sectionWrapper}>
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
        </View>

        {/* Notifications Section */}
        <View style={styles.sectionWrapper}>
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
            </View>
          </Surface>
        </View>

        {/* Account Actions Section */}
        <View style={styles.sectionWrapper}>
          <Surface style={styles.section} elevation={1}>
            <View style={styles.sectionContent}>
              <List.Item
                title="Sign Out"
                description="Sign out of your account"
                left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
                onPress={confirmLogout}
                right={props => (
                  <IconButton
                    {...props}
                    icon="chevron-right"
                    iconColor={theme.colors.error}
                  />
                )}
              />
            </View>
          </Surface>
        </View>

        {/* App Info Section */}
        <View style={styles.sectionWrapper}>
          <Surface style={styles.section} elevation={1}>
            <View style={styles.sectionContent}>
              <List.Item
                title="About"
                description="App version 1.0.0"
                left={props => <List.Icon {...props} icon="information" />}
              />
            </View>
          </Surface>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  sectionWrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  section: {
    borderRadius: 8,
  },
  sectionContent: {
    paddingVertical: 8,
  },
});
