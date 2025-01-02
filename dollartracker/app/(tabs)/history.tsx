import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Searchbar,
  Chip,
  Surface,
  useTheme,
  IconButton,
  Menu,
  ActivityIndicator,
} from 'react-native-paper';
import { Screen, ScrollView, EmptyState } from '../../components/layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../../context/auth';
import { useRouter } from 'expo-router';

type TimeFrame = 'today' | 'week' | 'month' | 'all';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Transaction {
  id: string;
  amount: number;
  category_id: string;
  transaction_time: string;
  notes?: string;
  category: Category | null;
}

export default function HistoryScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showTimeFrameMenu, setShowTimeFrameMenu] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const timeFrameOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ];

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [timeFrame, selectedCategory]);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon')
        .eq('user_id', user?.id);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function fetchTransactions() {
    try {
      setIsLoading(true);
      let query = supabase
        .from('daily_transactions')
        .select(`
          id,
          amount,
          category_id,
          transaction_time,
          notes,
          category:categories!daily_transactions_category_id_fkey (
            id,
            name,
            icon
          )
        `)
        .eq('user_id', user?.id)
        .order('transaction_time', { ascending: false });

      // Apply time frame filter
      const now = new Date();
      if (timeFrame === 'today') {
        query = query.gte('transaction_time', now.toISOString().split('T')[0]);
      } else if (timeFrame === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        query = query.gte('transaction_time', weekAgo.toISOString());
      } else if (timeFrame === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        query = query.gte('transaction_time', monthAgo.toISOString());
      }

      // Apply category filter
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to match our Transaction type
      const transformedData = data.map((item: any) => ({
        ...item,
        category: item.category
      }));
      
      setTransactions(transformedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filterTransactions = (transactions: Transaction[]) => {
    if (!searchQuery) return transactions;
    
    return transactions.filter(transaction => {
      const matchesSearch = 
        transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.amount.toString().includes(searchQuery) ||
        transaction.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  };

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const date = format(new Date(transaction.transaction_time), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    
    return groups;
  };

  const filteredTransactions = filterTransactions(transactions);
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  const renderTransaction = (transaction: Transaction) => {
    return (
      <Surface key={transaction.id} style={styles.transactionItem} elevation={1}>
        <View style={styles.transactionLeft}>
          <Surface style={styles.categoryIcon} elevation={2}>
            <MaterialCommunityIcons
              name={transaction.category?.icon || 'cash'}
              size={24}
              color={theme.colors.primary}
            />
          </Surface>
          <View style={styles.transactionDetails}>
            <Text variant="titleMedium">
              {transaction.category?.name || 'Other'}
            </Text>
            {transaction.notes && (
              <Text variant="bodyMedium" style={styles.notes}>
                {transaction.notes}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text variant="titleMedium" style={styles.amount}>
            -${Math.abs(transaction.amount).toFixed(2)}
          </Text>
          <Text variant="bodySmall" style={styles.time}>
            {format(new Date(transaction.transaction_time), 'h:mm a')}
          </Text>
        </View>
      </Surface>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search transactions"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          mode="bar"
        />
        
        <View style={styles.filters}>
          <View style={styles.filterRow}>
            <Menu
              visible={showTimeFrameMenu}
              onDismiss={() => setShowTimeFrameMenu(false)}
              anchor={
                <Chip
                  mode="outlined"
                  onPress={() => setShowTimeFrameMenu(true)}
                  style={styles.filterChip}
                >
                  {timeFrameOptions.find(opt => opt.value === timeFrame)?.label}
                </Chip>
              }
            >
              {timeFrameOptions.map(option => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setTimeFrame(option.value as TimeFrame);
                    setShowTimeFrameMenu(false);
                  }}
                  title={option.label}
                />
              ))}
            </Menu>

            <Menu
              visible={showCategoryMenu}
              onDismiss={() => setShowCategoryMenu(false)}
              anchor={
                <Chip
                  mode="outlined"
                  onPress={() => setShowCategoryMenu(true)}
                  style={styles.filterChip}
                >
                  {selectedCategory
                    ? categories.find(cat => cat.id === selectedCategory)?.name
                    : 'All Categories'}
                </Chip>
              }
            >
              <Menu.Item
                onPress={() => {
                  setSelectedCategory(null);
                  setShowCategoryMenu(false);
                }}
                title="All Categories"
              />
              {categories.map(category => (
                <Menu.Item
                  key={category.id}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setShowCategoryMenu(false);
                  }}
                  title={category.name}
                />
              ))}
            </Menu>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No Transactions Found"
            description={
              searchQuery
                ? "No transactions match your search criteria"
                : "You haven't recorded any transactions yet"
            }
            icon="cash-remove"
            action={{
              label: "Add Transaction",
              onPress: () => router.push('/new-transaction'),
              mode: "contained"
            }}
          />
        </View>
      ) : (
        <ScrollView>
          {Object.entries(groupedTransactions).map(([date, transactions]) => {
            return (
              <View key={date} style={styles.dateGroup}>
                <Surface style={styles.dateHeader} elevation={0}>
                  <Text variant="titleMedium">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </Text>
                </Surface>
                {transactions.map(renderTransaction)}
              </View>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    gap: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  filters: {
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  filterChip: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  notes: {
    color: '#666',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  amount: {
    color: '#FF4444',
  },
  time: {
    color: '#666',
    marginTop: 4,
  },
});
