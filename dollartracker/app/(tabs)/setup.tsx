import React, { useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Surface, useTheme, Button, TextInput, SegmentedButtons } from 'react-native-paper';
import { Screen, ScrollView } from '../../components/layout';
import { LinearGradient } from 'expo-linear-gradient';

type Period = 'weekly' | 'biweekly' | 'monthly';

export default function BudgetSetupScreen() {
  const theme = useTheme();
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
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text variant="headlineMedium" style={styles.stepTitle}>
              Set Your Budget
            </Text>
            <Text variant="bodyLarge" style={styles.stepDescription}>
              Enter the total amount you want to budget
            </Text>
            <Surface style={styles.inputContainer} elevation={2}>
              <TextInput
                label="Budget Amount"
                value={budget}
                onChangeText={setBudget}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Affix text="$" />}
              />
            </Surface>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text variant="headlineMedium" style={styles.stepTitle}>
              Choose Period
            </Text>
            <Text variant="bodyLarge" style={styles.stepDescription}>
              Select how often you want to reset your budget
            </Text>
            <Surface style={styles.periodContainer} elevation={2}>
              <SegmentedButtons
                value={period}
                onValueChange={setPeriod as (value: string) => void}
                buttons={periods}
              />
            </Surface>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text variant="headlineMedium" style={styles.stepTitle}>
              Confirm Daily Allowance
            </Text>
            <Text variant="bodyLarge" style={styles.stepDescription}>
              Based on your selections, here's your daily spending allowance
            </Text>
            <Surface style={styles.allowanceContainer} elevation={3}>
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.allowanceGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text variant="displayMedium" style={styles.allowanceAmount}>
                  ${calculateDailyAllowance().toFixed(2)}
                </Text>
                <Text style={styles.allowanceLabel}>per day</Text>
              </LinearGradient>
            </Surface>
          </View>
        );
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground} />
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: theme.colors.primary.main,
              },
            ]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {renderStep()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <Button
              mode="outlined"
              onPress={handleBack}
              style={styles.button}
            >
              Back
            </Button>
          )}
          <Button
            mode="contained"
            onPress={handleNext}
            style={[styles.button, styles.nextButton]}
          >
            {step === 3 ? 'Complete Setup' : 'Next'}
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  progressContainer: {
    height: 8,
    backgroundColor: theme.colors.surfaceVariant,
    overflow: 'hidden',
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surfaceVariant,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepTitle: {
    marginBottom: 8,
    textAlign: 'center',
    color: theme.colors.text.primary,
    fontWeight: 'bold',
  },
  stepDescription: {
    marginBottom: 32,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  inputContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  periodContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  allowanceContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  allowanceGradient: {
    padding: 24,
    alignItems: 'center',
  },
  allowanceAmount: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  allowanceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceVariant,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
  },
});
