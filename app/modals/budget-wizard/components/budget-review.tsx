import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme, Button } from 'react-native-paper';
import { useBudget } from '../context/budget-context';
import { formatCurrency } from '../../../../lib/utils/currency';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BudgetReviewProps {
  onBack: () => void;
  onComplete: () => void;
}

function SummaryItem({ 
  icon, 
  title, 
  amount, 
  subtitle 
}: { 
  icon: keyof typeof MaterialCommunityIcons.glyphMap; 
  title: string; 
  amount: number; 
  subtitle: string;
}) {
  const theme = useTheme();
  return (
    <Surface style={styles.summaryCard} elevation={1}>
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color={theme.colors.primary} 
      />
      <Text variant="titleMedium">{title}</Text>
      <Text variant="headlineSmall" style={styles.amount}>
        {formatCurrency(amount)}
      </Text>
      <Text variant="bodyMedium" style={styles.cardSubtitle}>
        {subtitle}
      </Text>
    </Surface>
  );
}

export default function BudgetReview({ onBack, onComplete }: BudgetReviewProps) {
  const theme = useTheme();
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
    <View style={styles.container}>
      <View style={styles.content}>
        <Surface style={styles.header} elevation={1}>
          <Text variant="headlineMedium" style={styles.title}>
            Your Budget Summary
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Here's how we've organized your finances to help you meet your goals.
          </Text>
        </Surface>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Surface style={styles.summaryCard} elevation={1}>
              <View style={styles.cardContent}>
                <MaterialCommunityIcons 
                  name="home" 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text variant="titleMedium">Fixed Expenses</Text>
                <Text variant="headlineSmall" style={styles.amount}>
                  {formatCurrency(state.fixedExpenses)}
                </Text>
                <Text variant="bodyMedium" style={styles.cardSubtitle}>
                  Rent, utilities, etc.
                </Text>
              </View>
            </Surface>

            <Surface style={styles.summaryCard} elevation={1}>
              <View style={styles.cardContent}>
                <MaterialCommunityIcons 
                  name="piggy-bank" 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text variant="titleMedium">Monthly Savings</Text>
                <Text variant="headlineSmall" style={styles.amount}>
                  {formatCurrency(state.savingsTarget)}
                </Text>
                <Text variant="bodyMedium" style={styles.cardSubtitle}>
                  Your savings goal
                </Text>
              </View>
            </Surface>
          </View>

          <Surface style={styles.spendingCard} elevation={1}>
            <View style={styles.cardContent}>
              <MaterialCommunityIcons 
                name="cash-multiple" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text variant="titleMedium">Monthly Spending Budget</Text>
              <Text variant="headlineSmall" style={styles.amount}>
                {formatCurrency(state.spendingBudget)}
              </Text>
              <Text variant="bodyMedium" style={styles.cardSubtitle}>
                {formatCurrency(state.dailyAllowance)} daily allowance
              </Text>
            </View>
          </Surface>
        </View>
      </View>

      <Surface style={styles.buttonContainer} elevation={1}>
        <Button 
          mode="outlined" 
          onPress={onBack}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Back
        </Button>
        <Button 
          mode="contained" 
          onPress={handleFinish}
          style={[styles.button, styles.finishButton]}
          labelStyle={styles.buttonLabel}
        >
          Finish
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 16,
  },
  header: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  summaryContainer: {
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    height: 140,
  },
  spendingCard: {
    borderRadius: 12,
    height: 140,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  amount: {
    fontWeight: '600',
    marginTop: 4,
  },
  cardSubtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
  finishButton: {
    flex: 2,
  },
});
