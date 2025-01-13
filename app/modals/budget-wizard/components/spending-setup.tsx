import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText, Surface } from 'react-native-paper';
import { useState, useCallback, useEffect } from 'react';
import { useBudget } from '../context/budget-context';
import { budgetSchema } from '../../../../lib/validation/budget-schema';
import { formatCurrency } from '../../../../lib/utils/currency';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SpendingSetupProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SpendingSetup({ onNext, onBack }: SpendingSetupProps) {
  const theme = useTheme();
  const { state, dispatch } = useBudget();
  const [fixedExpenses, setFixedExpenses] = useState(state.fixedExpenses ? state.fixedExpenses.toString() : '');
  const [savingsTarget, setSavingsTarget] = useState(state.savingsTarget ? state.savingsTarget.toString() : '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update local state when context state changes
    if (state.fixedExpenses) {
      setFixedExpenses(state.fixedExpenses.toString());
    }
    if (state.savingsTarget) {
      setSavingsTarget(state.savingsTarget.toString());
    }
  }, [state.fixedExpenses, state.savingsTarget]);

  const handleNumberInput = (value: string, setter: (value: string) => void) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setter(numericValue);
    setError(null);
  };

  const handleContinue = useCallback(() => {
    try {
      const expenses = Number(fixedExpenses);
      const savings = Number(savingsTarget);

      console.log('Current state:', {
        income: state.income,
        expenses,
        savings,
      });

      // Validate expenses
      if (!fixedExpenses) {
        setError('Please enter your fixed monthly expenses');
        return;
      }
      if (isNaN(expenses) || expenses < 0) {
        setError('Please enter a valid amount for fixed expenses');
        return;
      }

      // Validate savings
      if (!savingsTarget) {
        setError('Please enter your monthly savings target');
        return;
      }
      if (isNaN(savings) || savings < 0) {
        setError('Please enter a valid amount for savings target');
        return;
      }

      // Validate total against income
      const total = expenses + savings;
      const monthlyIncome = state.income.amount;

      console.log('Validation:', {
        total,
        monthlyIncome,
        isExceeding: total > monthlyIncome
      });

      if (total > monthlyIncome) {
        const remaining = monthlyIncome - expenses;
        if (remaining < 0) {
          setError(`Your fixed expenses (${formatCurrency(expenses)}) exceed your monthly income (${formatCurrency(monthlyIncome)})`);
        } else {
          setError(`Your total expenses and savings (${formatCurrency(total)}) exceed your monthly income (${formatCurrency(monthlyIncome)}). Maximum savings allowed: ${formatCurrency(remaining)}`);
        }
        return;
      }

      console.log('Dispatching:', {
        type: 'SET_EXPENSES_AND_SAVINGS',
        payload: { expenses, savings }
      });

      const result = budgetSchema.expenses.safeParse({
        fixedExpenses: expenses,
        savingsTarget: savings,
      });

      if (!result.success) {
        setError(result.error.errors[0].message);
        return;
      }

      dispatch({
        type: 'SET_EXPENSES_AND_SAVINGS',
        payload: { expenses, savings },
      });
      
      dispatch({ type: 'CALCULATE_BUDGET' });
      onNext();
    } catch (error) {
      console.error('Error in handleContinue:', error);
      setError('Please enter valid amounts');
    }
  }, [fixedExpenses, savingsTarget, state.income.amount, dispatch, onNext]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Surface style={styles.headerCard} elevation={1}>
          <MaterialCommunityIcons 
            name="calculator-variant" 
            size={24} 
            color={theme.colors.primary}
          />
          <Text variant="titleLarge" style={styles.title}>
            Plan Your Monthly Expenses
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Let's break down your monthly income of {formatCurrency(state.income.amount)} into fixed expenses
            and savings goals.
          </Text>
        </Surface>

        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            What are your fixed monthly expenses?
          </Text>
          
          <TextInput
            label="Fixed Expenses (rent, utilities, etc.)"
            value={fixedExpenses}
            onChangeText={(value) => handleNumberInput(value, setFixedExpenses)}
            keyboardType="decimal-pad"
            left={<TextInput.Affix text="$" />}
            style={styles.input}
            error={!!error}
          />

          <Text variant="titleMedium" style={[styles.sectionTitle, styles.savingsTitle]}>
            How much would you like to save monthly?
          </Text>
          
          <TextInput
            label="Monthly Savings Target"
            value={savingsTarget}
            onChangeText={(value) => handleNumberInput(value, setSavingsTarget)}
            keyboardType="decimal-pad"
            left={<TextInput.Affix text="$" />}
            style={styles.input}
            error={!!error}
          />
          
          {error && (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          )}
        </View>
      </View>

      <Surface style={styles.footer} elevation={1}>
        <Button
          mode="outlined"
          onPress={onBack}
          style={styles.footerButton}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!fixedExpenses || !savingsTarget}
          style={styles.footerButton}
        >
          Continue
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 8,
  },
  form: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  savingsTitle: {
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
