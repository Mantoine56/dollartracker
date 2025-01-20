import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Surface, useTheme, IconButton, FAB, Portal, Modal, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { BudgetCircle } from '../../components/budget/BudgetCircle';
import { ScrollView } from '../../components/layout';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCurrentBudget, useDailyTransactions } from '../../lib/enhanced-hooks';
import { format } from 'date-fns';
import { EmptyState } from '../../components/layout';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {
  const theme = useTheme();
  // Initialize with today's date at midnight in local time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState(today);
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState(today);

  // Fetch real data
  const { data: budget, isLoading: budgetLoading } = useCurrentBudget();
  const { data: transactions = [], isLoading: transactionsLoading } = useDailyTransactions(selectedDate);

  const isLoading = budgetLoading || transactionsLoading;

  // Date picker handlers
  const onDateChange = (event: any, date?: Date) => {
    if (date) {
      setTempDate(date);
    }
  };

  const handleConfirmDate = () => {
    setSelectedDate(tempDate);
    setShowDateModal(false);
  };

  const showPreviousDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate);
  };

  const showNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    // Allow navigation up to today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (nextDate <= today) {
      setSelectedDate(nextDate);
    }
  };

  // Calculate daily allowance and spent amount
  const dailyAllowance = budget?.daily_allowance ?? 0;
  const spent = transactions.reduce((total, t) => total + t.amount, 0) ?? 0;
  const remaining = dailyAllowance - spent;

  const containerStyle = [styles.container, { backgroundColor: theme.colors.background }];
  const budgetCardStyle = [styles.budgetCard, { backgroundColor: theme.colors.background }];
  const dateCardStyle = [styles.dateCard, { backgroundColor: theme.colors.background }];
  const dateTextStyle = { color: theme.colors.onSurface };
  const sectionTitleStyle = [styles.sectionTitle, { color: theme.colors.onSurface }];
  const fabStyle = [styles.fab, { backgroundColor: theme.colors.primary }];

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <Stack.Screen options={{ 
        title: 'Dollar Tracker',
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.onBackground,
      }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={budgetCardStyle}>
          <BudgetCircle 
            key={`${selectedDate.toISOString()}-${spent}-${dailyAllowance}`}
            amount={spent} 
            total={dailyAllowance} 
          />
          <View style={styles.dateSelector}>
            <IconButton
              icon="chevron-left"
              mode="contained"
              onPress={showPreviousDay}
              containerColor={theme.colors.background}
              iconColor={theme.colors.onSurfaceVariant}
              size={20}
            />
            <Pressable onPress={() => setShowDateModal(true)}>
              <View style={dateCardStyle}>
                <Text style={[dateTextStyle, { fontWeight: '600' }]}>
                  {format(selectedDate, 'EEE, MMM d, yyyy')}
                </Text>
              </View>
            </Pressable>
            <IconButton
              icon="chevron-right"
              mode="contained"
              onPress={showNextDay}
              containerColor={theme.colors.background}
              iconColor={theme.colors.onSurfaceVariant}
              size={20}
              disabled={new Date(selectedDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)}
            />
          </View>
        </View>

        <View style={styles.transactionsContainer}>
          <Text variant="titleMedium" style={sectionTitleStyle}>
            Today's Transactions
          </Text>
          {isLoading ? (
            <EmptyState
              title="Loading..."
              description="Fetching your transactions"
              icon="loading"
            />
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No Transactions Yet"
              description="Start tracking your expenses by adding your first transaction"
              icon="wallet-outline"
              action={{
                label: "Add Transaction",
                onPress: () => router.push('/transaction/new'),
              }}
            />
          ) : (
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionWrapper}>
                  <Surface style={[styles.transactionCard, { backgroundColor: theme.colors.elevation.level2 }]}>
                    <View style={styles.transactionContent}>
                      <View style={styles.leftContent}>
                        <View 
                          style={[
                            styles.categoryIcon,
                            { backgroundColor: theme.colors.elevation.level3 }
                          ]}
                        >
                          <MaterialCommunityIcons 
                            name={transaction.category?.icon || 'cash'} 
                            size={24} 
                            color={transaction.category?.color || theme.colors.primary}
                          />
                        </View>
                        <View style={styles.transactionDetails}>
                          <Text 
                            variant="titleMedium"
                            style={{ color: theme.colors.onSurface }}
                          >
                            {transaction.category?.name || 'Expense'}
                          </Text>
                          {transaction.notes ? (
                            <Text 
                              variant="bodySmall"
                              style={{ color: theme.colors.onSurfaceVariant }}
                            >
                              {transaction.notes}
                            </Text>
                          ) : null}
                          <Text 
                            variant="bodySmall"
                            style={{ color: theme.colors.onSurfaceVariant }}
                          >
                            {format(new Date(transaction.transaction_time), 'h:mm a')}
                          </Text>
                        </View>
                      </View>
                      <Text 
                        variant="titleMedium"
                        style={[
                          styles.amount,
                          { color: theme.colors.onSurface }
                        ]}
                      >
                        ${transaction.amount.toFixed(2)}
                      </Text>
                    </View>
                  </Surface>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      <FAB
        icon="plus"
        style={fabStyle}
        onPress={() => router.push('/transaction/new')}
        color={theme.colors.onPrimary}
      />

      <Portal>
        <Modal
          visible={showDateModal}
          onDismiss={() => setShowDateModal(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background }
          ]}
        >
          <Text variant="headlineMedium" style={{ color: theme.colors.onSurface, marginBottom: 20 }}>
            Select Date
          </Text>
          <DateTimePicker
            testID="dateTimePicker"
            value={tempDate}
            mode="date"
            onChange={onDateChange}
            display="inline"
            themeVariant={theme.dark ? "dark" : "light"}
          />
          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setShowDateModal(false)}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleConfirmDate}
            >
              Confirm
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    marginTop: -0,
  },
  budgetCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  dateCard: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  transactionsContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  transactionsList: {
    gap: 8,
  },
  transactionWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionCard: {
    borderRadius: 12,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    gap: 4,
  },
  amount: {
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
});
