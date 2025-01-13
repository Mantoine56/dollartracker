import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Platform, Pressable } from 'react-native';
import { TextInput, Button, useTheme, Surface, Text, Snackbar, IconButton, Portal, Modal } from 'react-native-paper';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAddTransaction } from '../../lib/enhanced-hooks';
import { format } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/auth';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  icon: string;
}

const defaultCategories: Category[] = [
  { id: '5ddfad72-9807-4d91-8970-666256bf3292', name: 'Food', icon: 'food' },
  { id: 'ae26c668-44e5-4270-86d7-4d9f9e57c25f', name: 'Transport', icon: 'car' },
  { id: 'a5c92142-1b30-46b7-adfa-0126e37a428c', name: 'Shopping', icon: 'cart' },
  { id: 'aa04278c-8e94-4b2a-9cae-4a8c0edb1f73', name: 'Entertainment', icon: 'movie' },
  { id: '3089529b-0fdf-4e0b-8fba-2beea1757248', name: 'Other', icon: 'dots-horizontal' },
];

export default function NewTransactionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { mutate: addTransaction, isLoading } = useAddTransaction();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  useEffect(() => {
    async function fetchCategories() {
      if (!user) return;

      const { data: userCategories, error: fetchError } = await supabase
        .from('categories')
        .select('id, name, icon')
        .eq('user_id', user.id);
      
      if (fetchError) {
        console.error('Error fetching categories:', fetchError);
        return;
      }
      
      if (!userCategories || userCategories.length === 0) {
        const defaultCategoryData = [
          { name: 'Food', icon: 'food' },
          { name: 'Entertainment', icon: 'movie' },
          { name: 'Shopping', icon: 'cart' },
          { name: 'Transport', icon: 'car' },
          { name: 'Other', icon: 'dots-horizontal' },
        ];

        const { data: createdCategories, error: createError } = await supabase
          .from('categories')
          .insert(defaultCategoryData.map(cat => ({
            user_id: user.id,
            name: cat.name,
            icon: cat.icon,
            is_system: true
          })))
          .select();

        if (createError) {
          console.error('Error creating default categories:', createError);
          return;
        }

        if (createdCategories) {
          const orderedCategories = orderCategories(createdCategories);
          setCategories(orderedCategories);
          setSelectedCategory(orderedCategories[0]);
        }
      } else {
        const orderedCategories = orderCategories(userCategories);
        setCategories(orderedCategories);
        setSelectedCategory(orderedCategories[0]);
      }
    }

    fetchCategories();
  }, [user]);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    setDate(currentDate);
    
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage('Please sign in to add transactions');
      setSnackbarVisible(true);
      return;
    }

    if (!amount || isNaN(parseFloat(amount))) {
      setErrorMessage('Please enter a valid amount');
      setSnackbarVisible(true);
      return;
    }

    if (!selectedCategory) {
      setErrorMessage('Please select a category');
      setSnackbarVisible(true);
      return;
    }

    try {
      await addTransaction({
        amount: parseFloat(amount),
        category_id: selectedCategory.id,
        notes: notes.trim(),
        date,
      });

      setSnackbarVisible(true);
      setErrorMessage('');
      router.back();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add transaction');
      setSnackbarVisible(true);
    }
  };

  const orderCategories = (cats: Category[]) => {
    const order = ['Food', 'Entertainment', 'Transport', 'Shopping', 'Other'];
    return [...cats].sort((a, b) => {
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);
      return indexA - indexB;
    });
  };

  const regularCategories = categories.filter(cat => cat.name !== 'Other');
  const otherCategory = categories.find(cat => cat.name === 'Other');

  const errorSnackbarStyle = {
    margin: 16,
    backgroundColor: theme.colors.error,
  };

  const successSnackbarStyle = {
    margin: 16,
    backgroundColor: theme.colors.success,
  };

  return (
    <Screen>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]} 
        contentContainerStyle={styles.contentContainer}
      >
        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={[styles.currencySymbol, { color: theme.colors.onBackground }]}>$</Text>
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.amountInput}
            mode="outlined"
            theme={theme}
          />
        </View>

        {/* Category Selection */}
        <Text style={[styles.sectionTitle, styles.centeredText, { color: theme.colors.onBackground }]}>Category</Text>
        <View style={styles.categoryGrid}>
          {/* Regular categories in 2x2 grid */}
          {regularCategories.map((cat) => (
            <Pressable 
              key={cat.id} 
              onPress={() => setSelectedCategory(cat)}
              style={({ pressed }) => [
                styles.categoryItemPressable,
                pressed && styles.categoryItemPressed
              ]}
            >
              <Surface 
                style={[
                  styles.categoryItem,
                  {
                    backgroundColor: selectedCategory?.id === cat.id 
                      ? theme.colors.primary 
                      : theme.colors.elevation.level2
                  }
                ]}
                elevation={1}
              >
                <View style={styles.categoryButtonContainer}>
                  <MaterialCommunityIcons 
                    name={cat.icon as any} 
                    size={24} 
                    color={selectedCategory?.id === cat.id ? theme.colors.onPrimary : theme.colors.onSurface} 
                  />
                  <Text 
                    style={[
                      styles.categoryButtonLabel,
                      { color: selectedCategory?.id === cat.id ? theme.colors.onPrimary : theme.colors.onSurface }
                    ]}
                  >
                    {cat.name}
                  </Text>
                </View>
              </Surface>
            </Pressable>
          ))}

          {/* Other category spanning full width */}
          {otherCategory && (
            <Pressable 
              key={otherCategory.id}
              onPress={() => setSelectedCategory(otherCategory)}
              style={({ pressed }) => [
                styles.categoryItemPressableFull,
                pressed && styles.categoryItemPressed
              ]}
            >
              <Surface 
                style={[
                  styles.categoryItemFull,
                  {
                    backgroundColor: selectedCategory?.id === otherCategory.id 
                      ? theme.colors.primary 
                      : theme.colors.elevation.level2
                  }
                ]}
                elevation={1}
              >
                <View style={styles.categoryButtonContainer}>
                  <MaterialCommunityIcons 
                    name={otherCategory.icon as any} 
                    size={24} 
                    color={selectedCategory?.id === otherCategory.id ? theme.colors.onPrimary : theme.colors.onSurface} 
                  />
                  <Text 
                    style={[
                      styles.categoryButtonLabel,
                      { color: selectedCategory?.id === otherCategory.id ? theme.colors.onPrimary : theme.colors.onSurface }
                    ]}
                  >
                    {otherCategory.name}
                  </Text>
                </View>
              </Surface>
            </Pressable>
          )}
        </View>

        {/* Notes Input */}
        <TextInput
          placeholder="Add notes"
          value={notes}
          onChangeText={setNotes}
          style={styles.notesInput}
          mode="outlined"
          multiline
          theme={theme}
        />

        {/* Date Selection */}
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          icon="calendar"
          style={styles.dateButton}
          contentStyle={styles.dateButtonContent}
          labelStyle={styles.dateButtonLabel}
          theme={theme}
        >
          {format(date, 'MMMM do, yyyy')}
        </Button>

        {Platform.OS === 'ios' && (
          <Portal>
            <Modal
              visible={showDatePicker}
              onDismiss={() => setShowDatePicker(false)}
              contentContainerStyle={[
                styles.modalContainer,
                { backgroundColor: theme.colors.background }
              ]}
              style={styles.datePickerModal}
            >
              <Text variant="titleLarge" style={styles.modalTitle}>Select Date</Text>
              
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  textColor={theme.colors.onBackground}
                />
              </View>

              <View style={styles.modalActions}>
                <Button onPress={() => setShowDatePicker(false)} theme={theme}>
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => setShowDatePicker(false)}
                  theme={theme}
                >
                  Confirm
                </Button>
              </View>
            </Modal>
          </Portal>
        )}

        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={isLoading}
          disabled={isLoading}
          theme={theme}
        >
          Add Transaction
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={errorMessage ? errorSnackbarStyle : successSnackbarStyle}
      >
        {errorMessage || 'Transaction added successfully!'}
      </Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 24,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  centeredText: {
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryItemPressable: {
    width: '48%',
    marginBottom: 16,
  },
  categoryItemPressableFull: {
    width: '100%',
    marginBottom: 16,
  },
  categoryItem: {
    padding: 16,
    borderRadius: 12,
    minHeight: 90,
  },
  categoryItemFull: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    minHeight: 90,
  },
  categoryButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  categoryButtonLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryItemPressed: {
    opacity: 0.7,
  },
  notesInput: {
    marginBottom: 24,
  },
  dateButton: {
    marginBottom: 24,
  },
  dateButtonContent: {
    height: 48,
  },
  dateButtonLabel: {
    fontSize: 16,
  },
  submitButton: {
    marginBottom: 24,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
});
