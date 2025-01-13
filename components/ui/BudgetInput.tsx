import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Input } from './Input';
import { SegmentedControl } from './SegmentedControl';

export type BudgetPeriod = 'weekly' | 'biweekly' | 'monthly';

type BudgetInputProps = {
  value: string;
  onChange: (value: string) => void;
  period: BudgetPeriod;
  onPeriodChange: (period: BudgetPeriod) => void;
  error?: string;
};

const PERIOD_OPTIONS = [
  { label: 'Weekly', value: 'weekly', icon: 'calendar-week' },
  { label: 'Biweekly', value: 'biweekly', icon: 'calendar-range' },
  { label: 'Monthly', value: 'monthly', icon: 'calendar-month' },
];

export const BudgetInput = ({
  value,
  onChange,
  period,
  onPeriodChange,
  error,
}: BudgetInputProps) => {
  const theme = useTheme();
  const [dailyAllowance, setDailyAllowance] = useState('0');

  useEffect(() => {
    const budget = parseFloat(value) || 0;
    let days = 0;

    switch (period) {
      case 'weekly':
        days = 7;
        break;
      case 'biweekly':
        days = 14;
        break;
      case 'monthly':
        days = 30;
        break;
    }

    const daily = days > 0 ? (budget / days).toFixed(2) : '0';
    setDailyAllowance(daily);
  }, [value, period]);

  return (
    <View style={styles.container}>
      <Input
        label="Budget Amount"
        value={value}
        onChangeText={onChange}
        type="currency"
        icon="cash"
        error={error}
        placeholder="0.00"
      />

      <View style={styles.periodContainer}>
        <Text
          variant="bodyMedium"
          style={[styles.label, { color: theme.colors.text.secondary }]}
        >
          Budget Period
        </Text>
        <SegmentedControl
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(value) => onPeriodChange(value as BudgetPeriod)}
        />
      </View>

      <View
        style={[
          styles.allowanceContainer,
          { backgroundColor: theme.colors.primary.light + '20' },
        ]}
      >
        <Text
          variant="bodyMedium"
          style={[styles.allowanceLabel, { color: theme.colors.text.secondary }]}
        >
          Daily Allowance
        </Text>
        <Text
          variant="headlineMedium"
          style={[styles.allowanceValue, { color: theme.colors.primary.main }]}
        >
          ${dailyAllowance}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  periodContainer: {
    gap: 8,
  },
  label: {
    marginLeft: 4,
  },
  allowanceContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  allowanceLabel: {
    marginBottom: 4,
  },
  allowanceValue: {
    fontWeight: 'bold',
  },
});
