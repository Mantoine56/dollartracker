import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Searchbar,
  Chip,
  Surface,
  useTheme,
  IconButton,
  SegmentedButtons,
  Menu,
  Divider,
} from 'react-native-paper';
import { Screen, ScrollView } from '../../components/layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TimeFrame = 'day' | 'week' | 'month' | 'custom';
type Category = 'all' | 'food' | 'transport' | 'shopping' | 'entertainment' | 'other';

interface Transaction {
  id: string;
  amount: number;
  category: Exclude<Category, 'all'>;
  timestamp: Date;
  notes?: string;
}

// Mock data - replace with actual data from your database
const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 25.99,
    category: 'food',
    timestamp: new Date('2024-12-30T12:00:00'),
    notes: 'Lunch'
  },
  {
    id: '2',
    amount: 45.00,
    category: 'transport',
    timestamp: new Date('2024-12-30T10:30:00'),
  },
  {
    id: '3',
    amount: 89.99,
    category: 'shopping',
    timestamp: new Date('2024-12-29T15:20:00'),
    notes: 'Groceries'
  },
  {
    id: '4',
    amount: 15.00,
    category: 'entertainment',
    timestamp: new Date('2024-12-29T20:00:00'),
    notes: 'Movie ticket'
  },
];

export default function HistoryScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: 'view-grid' },
    { value: 'food', label: 'Food', icon: 'food' },
    { value: 'transport', label: 'Transport', icon: 'bus' },
    { value: 'shopping', label: 'Shopping', icon: 'shopping' },
    { value: 'entertainment', label: 'Entertainment', icon: 'movie' },
    { value: 'other', label: 'Other', icon: 'dots-horizontal' },
  ];

  const timeFrameOptions = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom' },
  ];

  const filterTransactions = (transactions: Transaction[]) => {
    return transactions.filter(transaction => {
      const matchesSearch = searchQuery === '' ||
        transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.amount.toString().includes(searchQuery);
      
      const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
      
      // Add timeframe filtering logic here
      return matchesSearch && matchesCategory;
    });
  };

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const date = transaction.timestamp.toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    
    return groups;
  };

  const getCategoryIcon = (category: Category) => {
    return categories.find(c => c.value === category)?.icon || 'cash';
  };

  const filteredTransactions = filterTransactions(mockTransactions);
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

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
          <SegmentedButtons
            value={timeFrame}
            onValueChange={value => setTimeFrame(value as TimeFrame)}
            buttons={timeFrameOptions}
            style={styles.timeFrameButtons}
          />
          
          <Menu
            visible={showCategoryMenu}
            onDismiss={() => setShowCategoryMenu(false)}
            anchor={
              <Chip
                icon={() => (
                  <MaterialCommunityIcons
                    name={getCategoryIcon(selectedCategory)}
                    size={20}
                    color={theme.colors.primary}
                  />
                )}
                onPress={() => setShowCategoryMenu(true)}
                style={styles.categoryChip}
              >
                {categories.find(c => c.value === selectedCategory)?.label}
              </Chip>
            }
          >
            {categories.map(category => (
              <Menu.Item
                key={category.value}
                onPress={() => {
                  setSelectedCategory(category.value);
                  setShowCategoryMenu(false);
                }}
                title={category.label}
                leadingIcon={category.icon}
              />
            ))}
          </Menu>
        </View>
      </View>

      <ScrollView style={styles.transactionList}>
        {Object.entries(groupedTransactions).map(([date, transactions]) => (
          <View key={date} style={styles.dateGroup}>
            <Surface style={styles.dateHeader}>
              <Text variant="titleMedium">{date}</Text>
              <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                ${transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
              </Text>
            </Surface>

            {transactions.map(transaction => (
              <Surface key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Surface style={styles.categoryIcon}>
                    <MaterialCommunityIcons
                      name={getCategoryIcon(transaction.category)}
                      size={24}
                      color={theme.colors.primary}
                    />
                  </Surface>
                  <View style={styles.transactionDetails}>
                    <Text variant="titleMedium">
                      {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
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
                    -${transaction.amount.toFixed(2)}
                  </Text>
                  <Text variant="bodySmall" style={styles.time}>
                    {transaction.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </Surface>
            ))}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    gap: 16,
  },
  searchBar: {
    elevation: 0,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeFrameButtons: {
    flex: 1,
  },
  categoryChip: {
    borderRadius: 20,
  },
  transactionList: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    padding: 8,
    borderRadius: 8,
  },
  transactionDetails: {
    gap: 4,
  },
  notes: {
    opacity: 0.7,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontWeight: '600',
  },
  time: {
    opacity: 0.7,
  },
});
