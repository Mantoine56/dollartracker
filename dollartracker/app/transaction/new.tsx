import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function NewTransactionScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('food');

  const handleSubmit = async () => {
    // TODO: Save transaction to Supabase
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          style={styles.input}
          mode="outlined"
          outlineColor="#58A6FF"
          activeOutlineColor="#58A6FF"
          textColor="#FFFFFF"
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          outlineColor="#58A6FF"
          activeOutlineColor="#58A6FF"
          textColor="#FFFFFF"
        />

        <SegmentedButtons
          value={category}
          onValueChange={setCategory}
          buttons={[
            { value: 'food', label: 'Food' },
            { value: 'transport', label: 'Transport' },
            { value: 'shopping', label: 'Shopping' },
            { value: 'entertainment', label: 'Entertainment' },
          ]}
          style={styles.categoryButtons}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          buttonColor="#58A6FF">
          Add Transaction
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#2D2D2D',
  },
  categoryButtons: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
});
