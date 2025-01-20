import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, Portal, Modal, TextInput } from 'react-native-paper';
import { useCurrentBudget, useCreateBudget, useDailyTransactions, useAddTransaction } from '../../lib/enhanced-hooks';
import { BudgetPeriod } from '../../types/database';
import { BudgetCircle } from './BudgetCircle';

export function BudgetDashboard() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  // Create a memoized date that updates only when the component mounts
  const today = useMemo(() => {
    const date = new Date();
    // Ensure we're working with the start of the day in local time
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const { data: budget, isLoading: budgetLoading } = useCurrentBudget();
  const { data: todayTransactions, isLoading: transactionsLoading } = useDailyTransactions(today);
  const { mutate: createBudget, isLoading: createBudgetLoading } = useCreateBudget();
  const { mutate: addTransaction, isLoading: addTransactionLoading } = useAddTransaction();

  const totalSpentToday = todayTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const dailyAllowance = budget?.daily_allowance || 0;
  const remainingBudget = dailyAllowance - totalSpentToday;

  console.log('Budget Dashboard State:', {
    date: today.toISOString(),
    budget,
    dailyAllowance,
    totalSpentToday,
    remainingBudget
  });

  const handleCreateBudget = async () => {
    await createBudget({
      amount: 3000, // Monthly budget
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
      date: today, // Use the same date context
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
        <Text variant="headlineMedium" style={styles.title}>Daily Budget</Text>
        {budget ? (
          <>
            <BudgetCircle amount={totalSpentToday} total={dailyAllowance} />
            <Text variant="titleMedium" style={styles.budgetText}>
              Daily Allowance: ${dailyAllowance.toFixed(2)}
            </Text>
            <Text variant="titleMedium" style={styles.budgetText}>
              Spent Today: ${totalSpentToday.toFixed(2)}
            </Text>
            <Text variant="titleMedium" style={styles.budgetText}>
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

        {todayTransactions?.length === 0 ? (
          <Text style={styles.emptyText}>No transactions today</Text>
        ) : (
          todayTransactions?.map((transaction) => (
            <Surface key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionRow}>
                <View>
                  <Text variant="titleMedium">${transaction.amount.toFixed(2)}</Text>
                  {transaction.category && (
                    <Text variant="bodyMedium">{transaction.category.name}</Text>
                  )}
                </View>
                {transaction.notes && (
                  <Text variant="bodySmall" style={styles.notes}>{transaction.notes}</Text>
                )}
              </View>
            </Surface>
          ))
        )}
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
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  budgetCard: {
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  budgetText: {
    textAlign: 'center',
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
    marginBottom: 8,
  },
  transactionItem: {
    padding: 12,
    borderRadius: 6,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notes: {
    color: 'gray',
  },
  emptyText: {
    textAlign: 'center',
    color: 'gray',
    fontStyle: 'italic',
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
