import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme, IconButton } from 'react-native-paper';
import type { DailyTransaction } from '../../types/database';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: DailyTransaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {transactions.map((transaction, index) => (
        <Surface 
          key={transaction.id} 
          style={[
            styles.transactionCard,
            { backgroundColor: theme.colors.elevation.level2 },
            index === 0 && styles.firstCard,
            index === transactions.length - 1 && styles.lastCard,
          ]}
        >
          <View style={styles.transactionContent}>
            <View style={styles.leftContent}>
              <View 
                style={[
                  styles.categoryIcon,
                  { backgroundColor: theme.colors.elevation.level3 }
                ]}
              >
                <Text>💰</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text 
                  variant="titleMedium"
                  style={{ color: theme.colors.onSurface }}
                >
                  {transaction.notes || 'Expense'}
                </Text>
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
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  transactionCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  firstCard: {
    marginTop: 0,
  },
  lastCard: {
    marginBottom: 0,
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
});
