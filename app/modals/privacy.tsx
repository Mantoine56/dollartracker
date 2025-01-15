import { ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
          presentation: 'modal',
        }}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          Privacy Policy
        </Text>
        <Text style={[styles.lastUpdated, { color: theme.colors.onSurfaceVariant }]}>
          Last Updated: January 14, 2025
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          1. Information We Collect
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We collect information that you provide directly to us, including:
          {'\n'}- Account information (email, name)
          {'\n'}- Financial information (income, expenses, savings goals)
          {'\n'}- Transaction data
          {'\n'}- Device information and usage statistics
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          2. How We Use Your Information
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We use the collected information to:
          {'\n'}- Provide and maintain our services
          {'\n'}- Personalize your experience
          {'\n'}- Send important notifications
          {'\n'}- Improve our services
          {'\n'}- Comply with legal obligations
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          3. Data Storage and Security
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          Your data is stored securely using industry-standard encryption. We use Supabase for data storage, which employs robust security measures to protect your information.
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          4. Data Sharing
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We do not sell your personal information. We may share your information only:
          {'\n'}- With your consent
          {'\n'}- To comply with legal obligations
          {'\n'}- With service providers who assist in operating our app
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          5. Your Rights
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          You have the right to:
          {'\n'}- Access your personal information
          {'\n'}- Correct inaccurate data
          {'\n'}- Request deletion of your data
          {'\n'}- Export your data
          {'\n'}- Opt-out of marketing communications
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          6. Children's Privacy
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          Our service is not intended for children under 13. We do not knowingly collect information from children under 13.
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          7. Changes to Privacy Policy
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy and updating the "Last Updated" date.
        </Text>

        <Text style={[styles.section, { color: theme.colors.onSurface }]}>
          8. Contact Us
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          If you have questions about this Privacy Policy, please contact us at:
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
