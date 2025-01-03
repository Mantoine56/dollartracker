import { View, StyleSheet, Animated, Pressable } from 'react-native';
import { Text, Surface, useTheme, IconButton, Icon, Portal, Modal, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Screen,
  Container,
  EmptyState,
  LoadingOverlay,
  Toast,
  ToastProvider,
  ScrollView
} from '../../components/layout';
import { TransactionForm } from '../../components/transactions/TransactionForm';
import { FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurrentBudget, useDailyTransactions } from '../../lib/enhanced-hooks';
import { DailyTransaction } from '../../types/database';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [progressAnimation] = useState(new Animated.Value(0));
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  // Fetch real data
  const { data: budget, isLoading: budgetLoading } = useCurrentBudget();
  const { data: transactions, isLoading: transactionsLoading } = useDailyTransactions(selectedDate);

  console.log('Budget data:', JSON.stringify(budget, null, 2));
  console.log('Transactions data:', JSON.stringify(transactions, null, 2));

  const isLoading = budgetLoading || transactionsLoading;

  // Date picker handlers
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const showPreviousDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate);
  };

  const showNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const now = new Date();
    if (nextDate <= now) {
      setSelectedDate(nextDate);
    }
  };

  // Calculate daily allowance and spent amount
  const dailyAllowance = budget?.daily_allowance ?? 0;
  const spent = transactions?.reduce((total, t) => total + t.amount, 0) ?? 0;
  const remaining = dailyAllowance - spent;
  const allowanceStatus = remaining >= 0 ? 'success' : 'error';
  const spentPercentage = dailyAllowance > 0 ? Math.min(spent / dailyAllowance, 1) : 0;

  useEffect(() => {
    if (!isLoading && dailyAllowance > 0) {
      Animated.timing(progressAnimation, {
        toValue: spentPercentage,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [spentPercentage, isLoading, dailyAllowance]);

  function getCategoryIcon(transaction: any) {
    console.log('Getting icon for transaction:', transaction);
    if (!transaction.category?.icon) {
      console.log('No category icon found, using default');
      return 'cash';
    }
    console.log('Using category icon:', transaction.category.icon);
    return transaction.category.icon;
  }

  const getStatusColors = () => {
    return allowanceStatus === 'success' 
      ? [theme.colors.primaryContainer, theme.colors.primary]  // Green gradient
      : [theme.colors.errorContainer, theme.colors.error]; // Red gradient
  };

  const rotateProgress = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ToastProvider>
      <Screen contentStyle={styles.screen}>
        <LoadingOverlay visible={isLoading} message="Loading transactions..." />
        
        <View style={styles.budgetContainer}>
          <View style={styles.circleContainer}>
            <View style={styles.circle}>
              <View style={styles.innerCircle}>
                {isLoading ? (
                  <LoadingOverlay visible={true} message="Loading..." />
                ) : (
                  <>
                    <Text variant="displayLarge" style={[styles.allowanceAmount, { fontSize: 36, fontWeight: 'bold' }]}>
                      ${dailyAllowance.toFixed(2)}
                    </Text>
                    <Text variant="bodyMedium" style={[
                      styles.remainingAmount,
                      { color: allowanceStatus === 'success' ? theme.colors.primary : theme.colors.error }
                    ]}>
                      Remaining: ${remaining.toFixed(2)}
                    </Text>
                  </>
                )}
              </View>
              {!isLoading && (
                <Animated.View
                  style={[
                    styles.progressRing,
                    {
                      transform: [{ rotate: rotateProgress }],
                      borderColor: getStatusColors()[0],
                    }
                  ]}
                />
              )}
            </View>
          </View>

          <View style={styles.datePickerContainer}>
            <IconButton
              icon="chevron-left"
              onPress={showPreviousDay}
              mode="contained"
              containerColor={theme.colors.primaryContainer}
            />
            <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
              <Surface style={styles.dateSurface} elevation={1}>
                <Icon source="calendar" size={20} />
                <Text variant="bodyLarge" style={styles.dateText}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </Surface>
            </Pressable>
            <IconButton
              icon="chevron-right"
              onPress={showNextDay}
              mode="contained"
              containerColor={theme.colors.primaryContainer}
              disabled={new Date(selectedDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)}
            />
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

        </View>

        <View style={styles.transactionsSection}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Today's Transactions
          </Text>

          <ScrollView style={styles.transactionsList}>
            {!transactions || transactions.length === 0 ? (
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
              transactions.map((transaction) => (
                <Surface 
                  key={transaction.id} 
                  style={styles.transactionItem}
                  elevation={2}
                >
                  <View style={styles.transactionLeft}>
                    <LinearGradient
                      colors={['#E3F2FD', '#BBDEFB']}
                      style={styles.iconContainer}
                    >
                      <Icon 
                        source={getCategoryIcon(transaction)}
                        size={24} 
                        color={theme.colors.primary}
                      />
                    </LinearGradient>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionCategory}>
                        {transaction.category?.name || 'Uncategorized'}
                      </Text>
                      {transaction.notes && (
                        <Text style={styles.transactionNotes}>
                          {transaction.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.transactionAmount}>
                    -${transaction.amount.toFixed(2)}
                  </Text>
                </Surface>
              ))
            )}
          </ScrollView>
        </View>

        <FAB
          icon="plus"
          onPress={() => router.push('/transaction/new')}
          style={[styles.fab, { bottom: insets.bottom + 16 }]}
        />

      </Screen>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
  },
  budgetContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  circleContainer: {
    marginBottom: 16,
  },
  circle: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  progressRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 110,
    borderWidth: 10,
    borderColor: '#4CAF50',
    borderStyle: 'solid',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  allowanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  remainingAmount: {
    fontSize: 16,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  dateButton: {
    flex: 1,
    maxWidth: 200,
  },
  dateSurface: {
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateText: {
    textAlign: 'center',
  },
  transactionsSection: {
    flex: 1,
    padding: 16,
    marginHorizontal: -8,
  },
  sectionTitle: {
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 20,
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 8, 
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8, 
    marginHorizontal: 4, 
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 16,
    marginLeft: 2,
    marginRight: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    marginLeft: 4,
  },
  transactionCategory: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  transactionNotes: {
    color: '#666666',
    fontSize: 14,
    marginTop: 2,
  },
  transactionAmount: {
    color: '#FF4444',
    fontWeight: '600',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#4285F4',
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
});
