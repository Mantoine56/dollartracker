import { useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Surface, useTheme, Button } from 'react-native-paper';
import { useBudget } from '../context/budget-context';
import { formatCurrency } from '../../../../lib/utils/currency';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BudgetReviewProps {
  onBack: () => void;
  onComplete: () => void;
}

function SummaryCard({ 
  icon, 
  title, 
  amount, 
  subtitle,
  fullWidth = false,
}: { 
  icon: keyof typeof MaterialCommunityIcons.glyphMap; 
  title: string; 
  amount: number; 
  subtitle: string;
  fullWidth?: boolean;
}) {
  const theme = useTheme();
  return (
    <Surface 
      style={[
        styles.summaryCard, 
        fullWidth && styles.fullWidthCard,
        { backgroundColor: theme.colors.elevation.level2 }
      ]} 
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color={theme.colors.primary} 
        style={styles.cardIcon}
      />
      <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
        {title}
      </Text>
      <Text 
        variant="titleLarge" 
        style={[styles.amount, { color: theme.colors.onSurface }]}
      >
        {formatCurrency(amount)}
      </Text>
      <Text 
        variant="bodySmall" 
        style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        {subtitle}
      </Text>
    </Surface>
  );
}

export default function BudgetReview({ onBack, onComplete }: BudgetReviewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state, saveBudget } = useBudget();

  const handleFinish = useCallback(async () => {
    try {
      await saveBudget();
      onComplete();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  }, [saveBudget, onComplete]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Animated.ScrollView
        entering={FadeIn.duration(300)}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 84,
            paddingTop: 16,
            paddingHorizontal: 16
          }
        ]}
      >
        <Surface style={[styles.headerCard, { backgroundColor: theme.colors.elevation.level2 }]}>
          <MaterialCommunityIcons 
            name="chart-pie" 
            size={24} 
            color={theme.colors.primary}
            style={styles.headerIcon} 
          />
          <Text 
            variant="titleLarge" 
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Your Budget Summary
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Here's how we've organized your finances to help you meet your goals.
          </Text>
        </Surface>

        <View style={styles.summaryRow}>
          <SummaryCard
            icon="home"
            title="Fixed Expenses"
            amount={state.fixedExpenses}
            subtitle="Rent, utilities, etc."
          />
          <SummaryCard
            icon="piggy-bank"
            title="Monthly Savings"
            amount={state.savingsTarget}
            subtitle="Your savings goal"
          />
        </View>

        <SummaryCard
          icon="cash-multiple"
          title="Monthly Spending Budget"
          amount={state.spendingBudget}
          subtitle={`${formatCurrency(state.dailyAllowance)} daily allowance`}
          fullWidth
        />

        <View style={[styles.buttonContainer, { marginBottom: Platform.OS === 'ios' ? 0 : 16 }]}>
          <Button
            mode="outlined"
            onPress={onBack}
            style={[styles.button, { marginBottom: 8 }]}
          >
            Back
          </Button>
          <Button
            mode="contained"
            onPress={handleFinish}
            style={styles.button}
          >
            Finish
          </Button>
        </View>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullWidthCard: {
    marginBottom: 12,
  },
  cardIcon: {
    marginBottom: 8,
  },
  amount: {
    marginTop: 2,
    marginBottom: 2,
  },
  cardSubtitle: {
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  button: {
    borderRadius: 8,
  },
});
