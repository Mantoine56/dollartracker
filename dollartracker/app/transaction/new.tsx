import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Platform, Pressable } from 'react-native';
import { TextInput, Button, useTheme, Surface, Text, Snackbar, IconButton } from 'react-native-paper';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAddTransaction } from '../../lib/enhanced-hooks';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
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

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
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
    const order = ['Food', 'Entertainment', 'Other', 'Transport', 'Shopping'];
    return [...cats].sort((a, b) => {
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);
      return indexA - indexB;
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <Link href="../" asChild>
          <IconButton
            icon="arrow-left"
            size={24}
            style={styles.backButton}
          />
        </Link>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.amountInput}
            mode="outlined"
          />
        </View>

        {/* Category Selection */}
        <Text style={[styles.sectionTitle, styles.centeredText]}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.slice(0, 4).map((cat) => (
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
                  selectedCategory?.id === cat.id && { backgroundColor: theme.colors.primary }
                ]}
              >
                <View style={styles.categoryButtonContainer}>
                  <MaterialCommunityIcons 
                    name={cat.icon as any} 
                    size={24} 
                    color={selectedCategory?.id === cat.id ? 'white' : theme.colors.onSurface} 
                  />
                  <Text 
                    style={[
                      styles.categoryButtonLabel,
                      { color: selectedCategory?.id === cat.id ? 'white' : theme.colors.onSurface }
                    ]}
                  >
                    {cat.name}
                  </Text>
                </View>
              </Surface>
            </Pressable>
          ))}
          
          {/* Other category button spanning full width */}
          <View style={styles.categoryItemFullContainer}>
            <Pressable 
              key={categories[4].id}
              onPress={() => setSelectedCategory(categories[4])}
              style={({ pressed }) => [
                styles.categoryItemPressableFull,
                pressed && styles.categoryItemPressed
              ]}
            >
              <Surface 
                style={[
                  styles.categoryItemFull,
                  selectedCategory?.id === categories[4].id && { backgroundColor: theme.colors.primary }
                ]}
              >
                <View style={styles.categoryButtonContainer}>
                  <MaterialCommunityIcons 
                    name={categories[4].icon as any} 
                    size={24} 
                    color={selectedCategory?.id === categories[4].id ? 'white' : theme.colors.onSurface} 
                  />
                  <Text 
                    style={[
                      styles.categoryButtonLabel,
                      { color: selectedCategory?.id === categories[4].id ? 'white' : theme.colors.onSurface }
                    ]}
                  >
                    {categories[4].name}
                  </Text>
                </View>
              </Surface>
            </Pressable>
          </View>
        </View>

        {/* Notes Input */}
        <TextInput
          placeholder="Add notes"
          value={notes}
          onChangeText={setNotes}
          style={styles.notesInput}
          mode="outlined"
          multiline
        />

        {/* Date Selection */}
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          icon="calendar"
          style={styles.dateButton}
        >
          {format(date, 'MMMM do, yyyy')}
        </Button>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
        >
          Add Transaction
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={errorMessage ? styles.errorSnackbar : styles.successSnackbar}
      >
        {errorMessage || 'Transaction added successfully!'}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 48 : 0, 
    paddingHorizontal: 8,
  },
  backButton: {
    margin: 0,
    marginLeft: -4, 
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 12, 
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 24,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  centeredText: {
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  categoryItemPressable: {
    width: '48%',
  },
  categoryItemPressableFull: {
    width: '100%',
  },
  categoryItemFullContainer: {
    width: '100%',
    paddingRight: 0, 
  },
  categoryItemPressed: {
    opacity: 0.7,
  },
  categoryItem: {
    aspectRatio: 1.5,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#f5f5f5',
  },
  categoryItemFull: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#f5f5f5',
    marginTop: 4, 
  },
  categoryButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  categoryButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  dateButton: {
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 4,
  },
  errorSnackbar: {
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#FF3737',
  },
  successSnackbar: {
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#34C759',
  },
});
