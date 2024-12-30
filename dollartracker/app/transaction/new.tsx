import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { TextInput, Button, SegmentedButtons, useTheme, IconButton, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/layout';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

export default function NewTransactionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    // Validate input
    if (!amount || isNaN(parseFloat(amount))) {
      // TODO: Show error message
      return;
    }

    const transaction = {
      amount: parseFloat(amount),
      description,
      category,
      date: date.toISOString(),
    };

    // TODO: Save transaction to database
    console.log('Saving transaction:', transaction);
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
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Amount Input */}
          <Surface style={styles.amountContainer}>
            <Text variant="titleLarge" style={styles.currencySymbol}>$</Text>
            <TextInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={styles.amountInput}
              mode="outlined"
            />
          </Surface>

          {/* Category Selection */}
          <Text variant="titleMedium" style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <Surface
                key={cat.value}
                style={[
                  styles.categoryItem,
                  category === cat.value && { backgroundColor: theme.colors.primaryContainer }
                ]}
                onTouchEnd={() => setCategory(cat.value)}
              >
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={24}
                  color={category === cat.value ? theme.colors.onPrimaryContainer : theme.colors.onSurface}
                />
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.categoryLabel,
                    category === cat.value && { color: theme.colors.onPrimaryContainer }
                  ]}
                >
                  {cat.label}
                </Text>
              </Surface>
            ))}
          </View>

          {/* Description Input */}
          <TextInput
            label="Notes (optional)"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          {/* Date Selection */}
          <Surface style={styles.dateContainer}>
            <Text variant="titleMedium">Date & Time</Text>
            <IconButton
              icon="calendar"
              mode="contained"
              onPress={() => setShowDatePicker(true)}
            />
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
  },
  content: {
    padding: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
    borderRadius: 12,
  },
  currencySymbol: {
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  categoryItem: {
    width: '18%',
    aspectRatio: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  categoryLabel: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 24,
    borderRadius: 12,
  },
  submitButton: {
    marginTop: 8,
  },
});
