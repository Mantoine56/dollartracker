import React, { useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Surface, useTheme, Button, TextInput, SegmentedButtons } from 'react-native-paper';
import { Screen, ScrollView } from '../components/layout';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

type Period = 'weekly' | 'biweekly' | 'monthly';

export default function BudgetSetupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState('');
  const [period, setPeriod] = useState<Period>('monthly');
  const [progressWidth] = useState(new Animated.Value(0));

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const calculateDailyAllowance = () => {
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum)) return 0;

    switch (period) {
      case 'weekly':
        return budgetNum / 7;
      case 'biweekly':
        return budgetNum / 14;
      case 'monthly':
        return budgetNum / 30;
      default:
        return 0;
    }
  };

  const handleNext = () => {
    if (step < 3) {
      Animated.timing(progressWidth, {
        toValue: (step + 1) / 3,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setStep(step + 1);
    } else {
      // Save the budget settings
      router.back();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      Animated.timing(progressWidth, {
        toValue: (step - 1) / 3,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>

        {step === 1 && (
          <View style={styles.step}>
            <Text variant="headlineMedium">Set Your Budget</Text>
            <TextInput
              label="Budget Amount"
              value={budget}
              onChangeText={setBudget}
              keyboardType="decimal-pad"
              style={styles.input}
              mode="outlined"
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.step}>
            <Text variant="headlineMedium">Choose Period</Text>
            <SegmentedButtons
              value={period}
              onValueChange={setPeriod}
              buttons={periods}
              style={styles.segmentedButtons}
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.step}>
            <Text variant="headlineMedium">Review</Text>
            <Surface style={styles.reviewCard}>
              <Text variant="titleMedium">Budget: ${budget}</Text>
              <Text variant="titleMedium">Period: {period}</Text>
              <Text variant="titleMedium">
                Daily Allowance: ${calculateDailyAllowance().toFixed(2)}
              </Text>
            </Surface>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={handleBack} style={styles.button}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button mode="contained" onPress={handleNext} style={styles.button}>
            {step === 3 ? 'Finish' : 'Next'}
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
  },
  step: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    marginTop: 16,
  },
  segmentedButtons: {
    marginTop: 16,
  },
  reviewCard: {
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
