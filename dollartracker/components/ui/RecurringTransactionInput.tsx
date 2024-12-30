import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Switch, useTheme } from 'react-native-paper';
import { Input } from './Input';
import { SegmentedControl } from './SegmentedControl';
import { DatePicker } from './DatePicker';
import { CategoryPicker, Category } from './CategoryPicker';

type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

type RecurringTransactionInputProps = {
  amount: string;
  onAmountChange: (value: string) => void;
  category: string;
  onCategoryChange: (category: Category) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  isRecurring: boolean;
  onRecurringChange: (value: boolean) => void;
  recurrenceType: RecurrenceType;
  onRecurrenceTypeChange: (type: RecurrenceType) => void;
  startDate: Date;
  onStartDateChange: (date: Date) => void;
  endDate?: Date;
  onEndDateChange: (date?: Date) => void;
  errors?: {
    amount?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  };
};

const RECURRENCE_OPTIONS = [
  { label: 'Daily', value: 'daily', icon: 'calendar-today' },
  { label: 'Weekly', value: 'weekly', icon: 'calendar-week' },
  { label: 'Monthly', value: 'monthly', icon: 'calendar-month' },
  { label: 'Yearly', value: 'yearly', icon: 'calendar' },
];

export const RecurringTransactionInput = ({
  amount,
  onAmountChange,
  category,
  onCategoryChange,
  notes,
  onNotesChange,
  isRecurring,
  onRecurringChange,
  recurrenceType,
  onRecurrenceTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  errors = {},
}: RecurringTransactionInputProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Input
        label="Amount"
        value={amount}
        onChangeText={onAmountChange}
        type="currency"
        icon="cash"
        error={errors.amount}
        placeholder="0.00"
      />

      <CategoryPicker
        value={category}
        onChange={onCategoryChange}
        error={errors.category}
      />

      <Input
        label="Notes (Optional)"
        value={notes}
        onChangeText={onNotesChange}
        icon="note-text"
        placeholder="Add notes..."
        multiline
      />

      <View style={styles.recurringContainer}>
        <View style={styles.switchContainer}>
          <Text variant="titleMedium">Recurring Transaction</Text>
          <Switch
            value={isRecurring}
            onValueChange={onRecurringChange}
            color={theme.colors.primary.main}
          />
        </View>

        {isRecurring && (
          <View style={styles.recurringOptions}>
            <Text
              variant="bodyMedium"
              style={[styles.label, { color: theme.colors.text.secondary }]}
            >
              Recurrence
            </Text>
            <SegmentedControl
              options={RECURRENCE_OPTIONS}
              value={recurrenceType}
              onChange={(value) => onRecurrenceTypeChange(value as RecurrenceType)}
            />

            <View style={styles.dateContainer}>
              <View style={styles.dateInput}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={onStartDateChange}
                  minDate={new Date()}
                />
                {errors.startDate && (
                  <Text
                    variant="bodySmall"
                    style={[styles.error, { color: theme.colors.error.main }]}
                  >
                    {errors.startDate}
                  </Text>
                )}
              </View>

              <View style={styles.dateInput}>
                <DatePicker
                  label="End Date (Optional)"
                  value={endDate || new Date()}
                  onChange={onEndDateChange}
                  minDate={startDate}
                />
                {errors.endDate && (
                  <Text
                    variant="bodySmall"
                    style={[styles.error, { color: theme.colors.error.main }]}
                  >
                    {errors.endDate}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  recurringContainer: {
    gap: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recurringOptions: {
    gap: 12,
  },
  label: {
    marginLeft: 4,
  },
  dateContainer: {
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  error: {
    marginTop: 4,
    marginLeft: 12,
  },
});
