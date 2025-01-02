import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { TextInput, Button, useTheme, IconButton, Surface, Text, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Screen } from '../layout';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAddTransaction } from '../../lib/enhanced-hooks';
import { format } from 'date-fns';

type Category = 'food' | 'transport' | 'shopping' | 'entertainment' | 'other';

interface CategoryOption {
  value: Category;
  label: string;
  icon: string;
}

const categories: CategoryOption[] = [
  { value: 'food', label: 'Food', icon: 'food' },
  { value: 'transport', label: 'Transport', icon: 'bus' },
  { value: 'shopping', label: 'Shopping', icon: 'shopping' },
  { value: 'entertainment', label: 'Entertainment', icon: 'movie' },
  { value: 'other', label: 'Other', icon: 'dots-horizontal' },
];

export default function TransactionForm() {
  const router = useRouter();
  const theme = useTheme();
  const { mutate: addTransaction, isLoading } = useAddTransaction();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      // TODO: Show error message
      return;
    }

    await addTransaction({
      amount: parseFloat(amount),
      category_id: category,
      notes,
      transaction_time: date,
    });

    router.back();
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Screen>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Add Transaction" />
      </Appbar.Header>
      
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Amount Input */}
          <Surface style={styles.section} elevation={0}>
            <View style={styles.amountContainer}>
              <Text variant="titleLarge" style={styles.currencySymbol}>$</Text>
              <TextInput
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={styles.amountInput}
                mode="flat"
              />
            </View>
          </Surface>

          {/* Category Selection */}
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <Surface
                  key={cat.value}
                  style={[
                    styles.categoryItem,
                    category === cat.value && { backgroundColor: theme.colors.primaryContainer }
                  ]}
                  elevation={1}
                >
                  <View style={styles.categoryContent}>
                    <MaterialCommunityIcons
                      name={cat.icon}
                      size={24}
                      color={category === cat.value ? theme.colors.primary : theme.colors.onSurface}
                    />
                    <Text
                      variant="labelMedium"
                      style={[
                        styles.categoryLabel,
                        category === cat.value && { color: theme.colors.primary }
                      ]}
                      numberOfLines={1}
                    >
                      {cat.label}
                    </Text>
                  </View>
                </Surface>
              ))}
            </View>
          </Surface>

          {/* Notes Input */}
          <Surface style={styles.section} elevation={0}>
            <TextInput
              placeholder="Add notes..."
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
          </Surface>

          {/* Date Selection */}
          <Surface style={styles.section} elevation={0}>
            <View style={styles.dateContainer}>
              <View>
                <Text variant="titleMedium">Date & Time</Text>
                <Text variant="bodyMedium" style={styles.dateText}>
                  {format(date, 'MMM dd, yyyy h:mm a')}
                </Text>
              </View>
              <IconButton
                icon="calendar"
                mode="contained-tonal"
                onPress={() => setShowDatePicker(true)}
              />
            </View>
          </Surface>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              is24Hour={true}
              onChange={handleDateChange}
            />
          )}

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={isLoading}
            disabled={isLoading}
            contentStyle={styles.submitButtonContent}
          >
            Save Transaction
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    marginRight: 8,
    fontSize: 24,
    fontWeight: '500',
  },
  amountInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '30%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryContent: {
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  categoryLabel: {
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'transparent',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    marginTop: 4,
    color: '#666',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});
