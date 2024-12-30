import { View, StyleSheet, Animated } from 'react-native';
import { Text, Surface, useTheme, IconButton, Icon, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Screen,
  Container,
  EmptyState,
  LoadingOverlay,
  Toast,
  ToastProvider,
  ScrollView
} from '../../components/layout';

type Transaction = {
  id: string;
  amount: number;
  category: string;
  timestamp: Date;
  notes?: string;
};

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [isLoading] = useState(false);
  const [selectedDate] = useState(new Date());
  const [progressAnimation] = useState(new Animated.Value(0));

  const dailyAllowance = 50.00;
  const spent = 70.99;
  const remaining = dailyAllowance - spent;
  const allowanceStatus = remaining >= 0 ? 'success' : 'error';
  const spentPercentage = Math.min(spent / dailyAllowance, 1);

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: spentPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [spentPercentage]);

  const transactions = [
    {
      id: '1',
      amount: 25.99,
      category: 'food',
      timestamp: new Date(),
      notes: 'Lunch'
    },
    {
      id: '2',
      amount: 45.00,
      category: 'transport',
      timestamp: new Date(),
    }
  ];

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'food':
        return 'food';
      case 'transport':
        return 'car';
      default:
        return 'cash';
    }
  }

  const getStatusColors = () => {
    return allowanceStatus === 'success' 
      ? ['#4CAF50', '#45A049']  // Green gradient
      : ['#FF5252', '#FF1744']; // Red gradient
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
                <Text variant="displayLarge" style={[styles.allowanceAmount, { fontSize: 36, fontWeight: 'bold' }]}>
                  ${dailyAllowance.toFixed(2)}
                </Text>
                <Text variant="bodyMedium" style={[
                  styles.remainingAmount,
                  { color: theme.colors[allowanceStatus === 'success' ? 'success' : 'error'].main }
                ]}>
                  Remaining: ${remaining.toFixed(2)}
                </Text>
              </View>
              <Animated.View
                style={[
                  styles.progressRing,
                  {
                    transform: [{ rotate: rotateProgress }],
                    borderColor: getStatusColors()[0],
                  }
                ]}
              />
            </View>
          </View>

          <Surface style={styles.dateContainer} elevation={1}>
            <Icon 
              source="calendar" 
              size={20} 
              color={theme.colors.primary.main}
            />
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('en-US', { 
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </Surface>
        </View>

        <View style={styles.transactionsSection}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Today's Transactions
          </Text>

          <ScrollView style={styles.transactionsList}>
            {transactions.length === 0 ? (
              <EmptyState
                title="No Transactions Yet"
                description="Start tracking your expenses by adding your first transaction"
                icon="wallet-outline"
                action={{
                  label: "Add Transaction",
                  onPress: () => router.push('/add-transaction'),
                }}
              />
            ) : (
              transactions.map((transaction, index) => (
                <Surface 
                  key={index} 
                  style={styles.transactionItem}
                  elevation={2}
                >
                  <View style={styles.transactionLeft}>
                    <LinearGradient
                      colors={['#E3F2FD', '#BBDEFB']}
                      style={styles.iconContainer}
                    >
                      <Icon 
                        source={getCategoryIcon(transaction.category)}
                        size={24} 
                        color={theme.colors.primary.main}
                      />
                    </LinearGradient>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionCategory}>
                        {transaction.category.charAt(0).toUpperCase() + 
                         transaction.category.slice(1)}
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
          style={styles.fab}
          onPress={() => router.push('/transaction/new')}
          color={theme.colors.primary.contrast}
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateText: {
    marginLeft: 8,
    color: '#000000',
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
    bottom: 16,
    backgroundColor: '#1E90FF',
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
