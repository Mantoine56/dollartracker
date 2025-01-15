import { ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          title: 'Terms of Service',
          presentation: 'modal',
        }}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          Terms of Service
        </Text>
        <Text style={[styles.lastUpdated, { color: theme.colors.onSurfaceVariant }]}>
          Last Updated: January 14, 2025
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          1. Acceptance of Terms
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          By accessing or using DollarTracker, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the app.
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          2. Description of Service
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          DollarTracker is a personal finance management app that helps users track expenses, set budgets, and manage savings goals. The app is provided "as is" and may be updated from time to time.
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          3. User Accounts
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          - You must provide accurate and complete information when creating an account
          {'\n'}- You are responsible for maintaining the security of your account
          {'\n'}- You must notify us immediately of any unauthorized access
          {'\n'}- We reserve the right to terminate accounts that violate these terms
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          4. User Responsibilities
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          You agree not to:
          {'\n'}- Use the app for any illegal purpose
          {'\n'}- Attempt to gain unauthorized access
          {'\n'}- Interfere with the app's functionality
          {'\n'}- Upload malicious code or content
          {'\n'}- Impersonate others
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          5. Intellectual Property
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          All content, features, and functionality of DollarTracker are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          6. Subscription and Payments
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          - Subscriptions are billed according to your chosen plan
          {'\n'}- Prices are subject to change with notice
          {'\n'}- Refunds are handled according to the platform's policy (App Store/Google Play)
          {'\n'}- Cancellations take effect at the end of the current billing period
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          7. Limitation of Liability
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We are not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the app or any financial decisions made based on the app's information.
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          8. Disclaimers
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          - The app is provided "as is" without warranties
          {'\n'}- We do not guarantee accuracy of financial calculations
          {'\n'}- We are not responsible for financial losses
          {'\n'}- The app is not a substitute for professional financial advice
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          9. Changes to Terms
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We may modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          10. Governing Law
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          These terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of California.
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          11. Contact Information
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          For questions about these Terms, please contact us at:
          {'\n'}support@dollartracker.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
  },
  lastUpdated: {
    marginBottom: 24,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
  },
});
