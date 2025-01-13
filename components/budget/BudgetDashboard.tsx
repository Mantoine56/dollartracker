import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, Portal, Modal, TextInput } from 'react-native-paper';
import { useCurrentBudget, useCreateBudget, useDailyTransactions, useAddTransaction } from '../../lib/enhanced-hooks';
import { BudgetPeriod } from '../../types/database';

export function BudgetDashboard() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  const { data: budget, isLoading: budgetLoading } = useCurrentBudget();
  const { data: todayTransactions, isLoading: transactionsLoading } = useDailyTransactions(new Date());
  const { mutate: createBudget, isLoading: createBudgetLoading } = useCreateBudget();
  const { mutate: addTransaction, isLoading: addTransactionLoading } = useAddTransaction();

  const totalSpentToday = todayTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const remainingBudget = budget ? budget.budget_amount - totalSpentToday : 0;

  const handleCreateBudget = async () => {
    await createBudget({
      amount: 1000,
      period: 'monthly' as BudgetPeriod,
      startDate: new Date(),
    });
  };

  const handleAddTransaction = async () => {
    if (!amount) return;

    await addTransaction({
      amount: parseFloat(amount),
      category: category || undefined,
      notes: notes || undefined,
    });

    // Reset form
    setAmount('');
    setCategory('');
    setNotes('');
    setIsModalVisible(false);
  };

  if (budgetLoading || transactionsLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.budgetCard}>
        <Text variant="headlineMedium">Budget Overview</Text>
        {budget ? (
          <>
            <Text variant="titleLarge">
              Budget: ${budget.budget_amount.toFixed(2)}
            </Text>
            <Text variant="titleMedium">
              Spent Today: ${totalSpentToday.toFixed(2)}
            </Text>
            <Text variant="titleMedium">
              Remaining: ${remainingBudget.toFixed(2)}
            </Text>
          </>
        ) : (
          <Button
            mode="contained"
            onPress={handleCreateBudget}
            loading={createBudgetLoading}
          >
            Set Up Budget
          </Button>
        )}
      </Surface>

      <Surface style={styles.transactionsCard}>
        <View style={styles.transactionsHeader}>
          <Text variant="titleLarge">Today's Transactions</Text>
          <Button
            mode="contained"
            onPress={() => setIsModalVisible(true)}
            icon="plus"
          >
            Add
          </Button>
        </View>

        {todayTransactions?.map((transaction) => (
          <Surface key={transaction.id} style={styles.transactionItem}>
            <View>
              <Text variant="titleMedium">${transaction.amount.toFixed(2)}</Text>
              {transaction.category && (
                <Text variant="bodyMedium">{transaction.category}</Text>
              )}
            </View>
            {transaction.notes && (
              <Text variant="bodySmall">{transaction.notes}</Text>
            )}
          </Surface>
        ))}
      </Surface>

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={() => setIsModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Add Transaction
          </Text>
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <TextInput
            label="Category"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />
          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleAddTransaction}
            loading={addTransactionLoading}
            style={styles.button}
          >
            Add Transaction
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  budgetCard: {
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  transactionsCard: {
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionItem: {
    padding: 12,
    borderRadius: 6,
    gap: 4,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
});
