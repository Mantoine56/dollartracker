import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Text, TextInput, Button, useTheme, SegmentedButtons, HelperText, Surface } from 'react-native-paper';
import { useState, useCallback, useEffect } from 'react';
import { useBudget } from '../context/budget-context';
import { budgetSchema } from '../../../../lib/validation/budget-schema';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface IncomeSetupProps {
  onNext: () => void;
}

export default function IncomeSetup({ onNext }: IncomeSetupProps) {
  const theme = useTheme();
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
      style={styles.container}
    >
      <View style={styles.content}>
        <Surface style={styles.headerCard} elevation={1}>
          <MaterialCommunityIcons 
            name="wallet-outline" 
            size={24} 
            color={theme.colors.primary}
          />
          <Text variant="titleLarge" style={styles.title}>
            Let's Set Up Your Budget
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            First, tell us about your income to help calculate your daily budget.
          </Text>
        </Surface>
        
        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            What's your take-home pay?
          </Text>
          
          <TextInput
            label={getIncomeLabel()}
            value={monthlyIncome}
            onChangeText={handleIncomeChange}
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

          <Text variant="titleMedium" style={[styles.sectionTitle, styles.frequencyTitle]}>
            How often do you receive your paycheck?
          </Text>
          
          <SegmentedButtons
            value={frequency}
            onValueChange={(value) => {
              setFrequency(value as typeof frequency);
              setError(null);
            }}
            buttons={[
              { 
                value: 'weekly', 
                label: 'Weekly',
                checkedColor: theme.colors.primary,
              },
              { 
                value: 'biweekly', 
                label: 'Biweekly',
                checkedColor: theme.colors.primary,
              },
              { 
                value: 'monthly', 
                label: 'Monthly',
                checkedColor: theme.colors.primary,
              },
            ]}
          />
        </View>
      </View>

      <Surface style={styles.footer} elevation={1}>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!monthlyIncome}
          contentStyle={styles.buttonContent}
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
  frequencyTitle: {
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
