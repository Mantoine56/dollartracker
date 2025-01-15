import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Text, TextInput, Button, useTheme, SegmentedButtons, HelperText, Surface } from 'react-native-paper';
import { useState, useCallback, useEffect } from 'react';
import { useBudget } from '../context/budget-context';
import { budgetSchema } from '../../../../lib/validation/budget-schema';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface IncomeSetupProps {
  onNext: () => void;
}

export default function IncomeSetup({ onNext }: IncomeSetupProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useBudget();
  const [monthlyIncome, setMonthlyIncome] = useState(state.income.amount ? state.income.amount.toString() : '');
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>(state.income.frequency || 'monthly');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.income.amount) {
      setMonthlyIncome(state.income.amount.toString());
    }
    if (state.income.frequency) {
      setFrequency(state.income.frequency);
    }
  }, [state.income.amount, state.income.frequency]);

  const handleIncomeChange = (value: string) => {
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

    setMonthlyIncome(numericValue);
    setError(null);
  };

  const getIncomeLabel = () => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly Income After Taxes';
      case 'biweekly':
        return 'Bi-Weekly Income After Taxes';
      case 'monthly':
        return 'Monthly Income After Taxes';
    }
  };

  const handleContinue = useCallback(() => {
    try {
      const amount = Number(monthlyIncome);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid income amount');
        return;
      }

      console.log('Setting income:', { amount, frequency });
      
      // Convert to monthly amount if needed
      let monthlyAmount = amount;
      if (frequency === 'weekly') {
        monthlyAmount = amount * 52 / 12;
      } else if (frequency === 'biweekly') {
        monthlyAmount = amount * 26 / 12;
      }

      console.log('Monthly amount after conversion:', monthlyAmount);

      const result = budgetSchema.income.safeParse({
        amount: monthlyAmount,
        frequency,
      });
      
      if (!result.success) {
        setError(result.error.errors[0].message);
        return;
      }

      dispatch({
        type: 'SET_INCOME',
        payload: {
          amount: monthlyAmount,
          frequency,
        },
      });
      onNext();
    } catch (error) {
      console.error('Error in handleContinue:', error);
      setError('Please enter a valid amount');
    }
  }, [monthlyIncome, frequency, dispatch, onNext]);

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
            name="currency-usd" 
            size={32} 
            color={theme.colors.primary}
            style={styles.icon} 
          />
          <Text 
            variant="headlineMedium" 
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Let's Set Up Your Budget
          </Text>
          <Text 
            variant="bodyLarge" 
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            First, tell us about your income to help calculate your daily budget.
          </Text>
        </Surface>

        <Surface style={[styles.inputCard, { backgroundColor: theme.colors.elevation.level2 }]}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {getIncomeLabel()}
          </Text>
          <TextInput
            mode="outlined"
            value={monthlyIncome}
            onChangeText={handleIncomeChange}
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

          <Text 
            variant="titleMedium" 
            style={[styles.frequencyLabel, { color: theme.colors.onSurface }]}
          >
            How often do you receive your paycheck?
          </Text>
          <SegmentedButtons
            value={frequency}
            onValueChange={value => setFrequency(value as typeof frequency)}
            buttons={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'biweekly', label: 'Biweekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            style={styles.segmentedButtons}
          />
        </Surface>

        <View style={[styles.buttonContainer, { marginBottom: Platform.OS === 'ios' ? 0 : 16 }]}>
          <Button 
            mode="contained"
            onPress={handleContinue}
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
    marginBottom: 4,
  },
  frequencyLabel: {
    marginTop: 24,
    marginBottom: 12,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  button: {
    borderRadius: 8,
  },
});
