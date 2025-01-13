import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Screen } from '../../components/layout';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useRouter } from 'expo-router';

export default function EmptyStatesScreen() {
  const theme = useTheme();
  const router = useRouter();

  const examples = [
    {
      title: 'No Transactions Yet',
      description: 'Start tracking your expenses by adding your first transaction.',
      icon: 'cash-plus',
      action: {
        label: 'Add Transaction',
        onPress: () => router.push('/(tabs)'),
      },
    },
    {
      title: 'No Budget Set',
      description: 'Set up your budget to start tracking your spending.',
      icon: 'wallet-outline',
      action: {
        label: 'Set Budget',
        onPress: () => router.push('/setup'),
      },
    },
    {
      title: 'No Badges Yet',
      description: 'Complete tasks and challenges to earn badges!',
      icon: 'trophy-outline',
      action: {
        label: 'View Challenges',
        onPress: () => router.push('/(tabs)/incentives'),
      },
    },
    {
      title: 'Network Error',
      description: 'Unable to connect to the server. Please check your internet connection and try again.',
      icon: 'wifi-off',
      action: {
        label: 'Retry',
        onPress: () => {},
      },
      isError: true,
    },
    {
      title: 'Session Expired',
      description: 'Your session has expired. Please sign in again to continue.',
      icon: 'account-lock',
      action: {
        label: 'Sign In',
        onPress: () => router.push('/auth/login'),
      },
      isError: true,
    },
  ];

  return (
    <Screen>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium">Empty States</Text>
        <Text variant="bodyLarge" style={{ opacity: 0.7 }}>
          Examples of empty states and error handling
        </Text>
      </Surface>

      <ScrollView style={styles.container}>
        {examples.map((example, index) => (
          <Surface key={index} style={styles.card} elevation={1}>
            <View style={styles.cardContent}>
              <EmptyState {...example} />
            </View>
          </Surface>
        ))}
      </ScrollView>
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
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    minHeight: 300,
  },
});
