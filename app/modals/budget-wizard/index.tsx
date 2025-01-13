import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Text, ProgressBar, Surface } from 'react-native-paper';
import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { BudgetProvider } from './context/budget-context';
import IncomeSetup from './components/income-setup';
import SpendingSetup from './components/spending-setup';
import BudgetReview from './components/budget-review';

export type WizardStep = 'income' | 'spending' | 'review';

const STEP_TITLES = {
  income: 'Set Your Income',
  spending: 'Plan Your Budget',
  review: 'Review Your Budget',
} as const;

export default function BudgetWizard() {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState<WizardStep>('income');

  const getProgress = useCallback(() => {
    switch (currentStep) {
      case 'income':
        return 0.33;
      case 'spending':
        return 0.66;
      case 'review':
        return 1;
      default:
        return 0;
    }
  }, [currentStep]);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 'income':
        return <IncomeSetup onNext={() => setCurrentStep('spending')} />;
      case 'spending':
        return (
          <SpendingSetup
            onBack={() => setCurrentStep('income')}
            onNext={() => setCurrentStep('review')}
          />
        );
      case 'review':
        return (
          <BudgetReview
            onBack={() => setCurrentStep('spending')}
            onComplete={handleClose}
          />
        );
      default:
        return null;
    }
  }, [currentStep, handleClose]);

  const containerStyle = [styles.container, { backgroundColor: theme.colors.background }];
  const progressCardStyle = [styles.progressCard, { backgroundColor: theme.colors.elevation.level2 }];
  const progressBarStyle = [styles.progressBar, { backgroundColor: 'rgba(0,0,0,0.1)' }];
  const stepIndicatorStyle = { color: theme.colors.onSurfaceVariant };
  const stepTitleStyle = [styles.stepTitle, { color: theme.colors.onSurface }];

  return (
    <BudgetProvider>
      <SafeAreaView style={containerStyle} edges={['top']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={styles.content}
          >
            <Surface style={progressCardStyle}>
              <Text variant="titleMedium" style={stepTitleStyle}>
                {STEP_TITLES[currentStep]}
              </Text>
              <ProgressBar 
                progress={getProgress()} 
                color={theme.colors.primary}
                style={progressBarStyle}
              />
              <View 
                style={[
                  progressBarStyle, 
                  { 
                    width: `${getProgress() * 100}%`,
                    backgroundColor: theme.colors.primary 
                  }
                ]} 
              />
              <Text variant="bodySmall" style={stepIndicatorStyle}>
                Step {currentStep === 'income' ? '1' : currentStep === 'spending' ? '2' : '3'} of 3
              </Text>
            </Surface>

            {renderStep()}
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BudgetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  stepIndicator: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
});
