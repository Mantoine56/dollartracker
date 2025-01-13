import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  IconButton,
  Menu,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../../context/auth';
import { useRouter } from 'expo-router';
import { TransactionCalendar } from '../../components/calendar/TransactionCalendar';
import { useSettings } from '../../context/settings';
import { EmptyState } from '../../components/layout';

type TimeFrame = 'today' | 'week' | 'month' | 'all';
type ViewMode = 'list' | 'calendar';

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
  const { state: settings } = useSettings();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showTimeFrameMenu, setShowTimeFrameMenu] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState(new Date('2025-01-12T16:55:51-05:00'));

  console.log('Settings state:', settings);

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

  const groupedTransactions = groupTransactionsByDate(transactions);

  const renderTransaction = (transaction: Transaction) => {
    return (
      <Surface key={transaction.id} style={[styles.transactionItem, { backgroundColor: theme.colors.elevation.level2 }]} elevation={1}>
        <Surface style={[styles.transactionIcon, { backgroundColor: theme.colors.elevation.level3 }]} elevation={2}>
          <MaterialCommunityIcons
            name={transaction.category?.icon || 'cash'}
            size={20}
            color={theme.colors.primary}
          />
        </Surface>
        <View style={styles.transactionInfo}>
          <View style={styles.transactionRow}>
            <Text variant="bodyLarge" style={{ fontWeight: '500' }}>
              {transaction.category?.name || 'Other'}
            </Text>
            <Text variant="bodyLarge" style={[styles.amount, { color: theme.colors.error }]}>
              -${Math.abs(transaction.amount).toFixed(2)}
            </Text>
          </View>
          <View style={styles.transactionRow}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {format(new Date(transaction.transaction_time), 'h:mm a')}
              {__DEV__ && (
                <Text style={{ fontSize: 10 }}> ({transaction.transaction_time})</Text>
              )}
            </Text>
          </View>
        </View>
      </Surface>
    );
  };

  const renderTransactionGroup = ({ item }: { item: [string, Transaction[]] }) => {
    return (
      <View key={item[0]} style={styles.dateGroup}>
        <Surface style={[styles.dateHeader, { backgroundColor: theme.colors.background }]} elevation={0}>
          <Text variant="titleMedium">
            {format(new Date(item[0]), 'MMMM d, yyyy')}
          </Text>
        </Surface>
        {item[1].map(renderTransaction)}
      </View>
    );
  };

  const containerStyle = [styles.container, { backgroundColor: theme.colors.background }];
  const filtersContainerStyle = [styles.filtersContainer, { backgroundColor: theme.colors.background }];
  const dateHeaderStyle = [styles.dateHeader, { backgroundColor: theme.colors.background }];
  const transactionItemStyle = [styles.transactionItem, { backgroundColor: theme.colors.elevation.level2 }];
  const transactionIconStyle = [styles.transactionIcon, { backgroundColor: theme.colors.elevation.level3 }];
  const amountStyle = [styles.amount, { color: theme.colors.error }];
  const timeStyle = [styles.time, { color: theme.colors.onSurfaceVariant }];

  return (
    <View style={containerStyle}>
      <View style={styles.header}>
        <View style={styles.viewToggle}>
          <IconButton
            icon="format-list-bulleted"
            selected={viewMode === 'list'}
            onPress={() => setViewMode('list')}
            mode="contained"
            containerColor={viewMode === 'list' ? theme.colors.primaryContainer : theme.colors.surfaceVariant}
            iconColor={viewMode === 'list' ? theme.colors.primary : theme.colors.onSurfaceVariant}
            size={24}
          />
          <IconButton
            icon="calendar-month"
            selected={viewMode === 'calendar'}
            onPress={() => setViewMode('calendar')}
            mode="contained"
            containerColor={viewMode === 'calendar' ? theme.colors.primaryContainer : theme.colors.surfaceVariant}
            iconColor={viewMode === 'calendar' ? theme.colors.primary : theme.colors.onSurfaceVariant}
            size={24}
          />
        </View>

        {viewMode === 'list' && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterItem}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Time Frame
              </Text>
              <Menu
                visible={showTimeFrameMenu}
                onDismiss={() => setShowTimeFrameMenu(false)}
                anchor={
                  <Pressable 
                    onPress={() => setShowTimeFrameMenu(true)}
                    style={styles.filterButton}
                  >
                    <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
                      {timeFrameOptions.find(t => t.value === timeFrame)?.label}
                    </Text>
                    <MaterialCommunityIcons 
                      name="chevron-down" 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                  </Pressable>
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
            </View>

            <View style={styles.filterItem}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Category
              </Text>
              <Menu
                visible={showCategoryMenu}
                onDismiss={() => setShowCategoryMenu(false)}
                anchor={
                  <Pressable 
                    onPress={() => setShowCategoryMenu(true)}
                    style={styles.filterButton}
                  >
                    <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
                      {selectedCategory 
                        ? categories.find(c => c.id === selectedCategory)?.name 
                        : 'All Categories'}
                    </Text>
                    <MaterialCommunityIcons 
                      name="chevron-down" 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                  </Pressable>
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
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : viewMode === 'list' ? (
        <FlatList
          data={Object.entries(groupedTransactions)}
          renderItem={renderTransactionGroup}
          keyExtractor={item => item[0]}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                title="No Transactions Found"
                description="You haven't recorded any transactions yet"
                icon="cash-remove"
                action={{
                  label: "Add Transaction",
                  onPress: () => router.push('/new-transaction'),
                  mode: "contained"
                }}
              />
            </View>
          }
        />
      ) : (
        <View style={styles.calendarContainer}>
          <TransactionCalendar
            transactions={transactions}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            dailyBudget={settings.dailyBudget ?? 0}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    borderRadius: 20,
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  filterItem: {
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  calendarContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 4,
    borderRadius: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 3,
    borderRadius: 10,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
  },
});
