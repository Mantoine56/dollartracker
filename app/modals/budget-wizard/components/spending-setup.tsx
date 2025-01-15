import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText, Surface } from 'react-native-paper';
import { useState, useCallback, useEffect } from 'react';
import { useBudget } from '../context/budget-context';
import { budgetSchema } from '../../../../lib/validation/budget-schema';
import { formatCurrency } from '../../../../lib/utils/currency';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SpendingSetupProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SpendingSetup({ onNext, onBack }: SpendingSetupProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
        <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
          <MaterialCommunityIcons 
            name="calculator-variant" 
            size={32} 
            color={theme.colors.primary}
            style={styles.icon} 
          />
          <Text 
            variant="headlineMedium" 
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Plan Your Monthly Expenses
          </Text>
          <Text 
            variant="bodyLarge" 
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Let's break down your monthly income of {formatCurrency(state.income.amount)} into fixed expenses
            and savings goals.
          </Text>
        </Surface>

        <Surface style={[styles.inputCard, { backgroundColor: theme.colors.elevation.level2 }]}>
          <Text 
            variant="titleMedium" 
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Fixed Expenses (rent, utilities, etc.)
          </Text>
          <TextInput
            mode="outlined"
            value={fixedExpenses}
            onChangeText={(value) => handleNumberInput(value, setFixedExpenses)}
            keyboardType="decimal-pad"
            left={<TextInput.Affix text="$" />}
            style={styles.input}
            error={!!error}
            theme={{
              colors: {
                primary: theme.colors.primary,
                error: theme.colors.error,
              },
            }}
          />

          <Text 
            variant="titleMedium" 
            style={[styles.savingsTitle, { color: theme.colors.onSurface }]}
          >
            Monthly Savings Target
          </Text>
          <TextInput
            mode="outlined"
            value={savingsTarget}
            onChangeText={(value) => handleNumberInput(value, setSavingsTarget)}
            keyboardType="decimal-pad"
            left={<TextInput.Affix text="$" />}
            style={styles.input}
            error={!!error}
            theme={{
              colors: {
                primary: theme.colors.primary,
                error: theme.colors.error,
              },
            }}
          />
          
          {error && <HelperText type="error">{error}</HelperText>}
        </Surface>

        <View style={[styles.buttonContainer, { marginBottom: Platform.OS === 'ios' ? 0 : 16 }]}>
          <Button
            mode="outlined"
            onPress={onBack}
            style={[styles.button, { marginBottom: 8 }]}
            textColor={theme.colors.primary}
          >
            Back
          </Button>
          <Button
            mode="contained"
            onPress={handleContinue}
            disabled={!fixedExpenses || !savingsTarget}
            style={styles.button}
          >
            Continue
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
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  inputCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  savingsTitle: {
    marginTop: 8,
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  button: {
    borderRadius: 8,
  },
});
