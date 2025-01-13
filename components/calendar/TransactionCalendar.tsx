import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, Surface, IconButton } from 'react-native-paper';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Transaction } from '../../types/transaction';

interface TransactionCalendarProps {
  transactions: Transaction[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  dailyBudget: number;
}

export function TransactionCalendar({ 
  transactions, 
  selectedDate, 
  onSelectDate,
  dailyBudget 
}: TransactionCalendarProps) {
  const theme = useTheme();
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  // Get the first day of the month and adjust for the calendar grid
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Go to the first Sunday

  // Get the last day of the month and adjust for the calendar grid
  const endDate = new Date(monthEnd);
  const daysToAdd = 6 - endDate.getDay();
  endDate.setDate(endDate.getDate() + daysToAdd); // Go to the last Saturday

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Get day names for header
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate spending for each day
  const getDaySpending = (date: Date) => {
    const dayTransactions = transactions.filter(t => 
      isSameDay(new Date(t.transaction_time), date)
    );
    
    const totalSpent = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    console.log('Day spending:', {
      date: format(date, 'yyyy-MM-dd'),
      totalSpent,
      transactions: dayTransactions.map(t => ({
        amount: t.amount,
        time: format(new Date(t.transaction_time), 'HH:mm:ss')
      }))
    });
    
    return totalSpent;
  };

  // Calculate delta (budget - spending) for the day
  const getDayDelta = (date: Date) => {
    const dayTransactions = transactions.filter(t => 
      isSameDay(new Date(t.transaction_time), date)
    );
    
    const daySpending = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = dailyBudget - daySpending;
    
    console.log('Day calculation:', {
      date: format(date, 'yyyy-MM-dd'),
      daySpending,
      dailyBudget,
      remaining,
      transactions: dayTransactions.map(t => ({
        amount: t.amount,
        time: format(new Date(t.transaction_time), 'HH:mm:ss')
      }))
    });
    
    return remaining;
  };

  console.log('Calendar Debug:', {
    monthStart: format(monthStart, 'yyyy-MM-dd'),
    monthEnd: format(monthEnd, 'yyyy-MM-dd'),
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
    daysCount: days.length,
    dailyBudget,
    transactionsCount: transactions.length,
  });

  const renderDay = (date: Date) => {
    const isSelected = isSameDay(selectedDate, date);
    const totalSpent = getDaySpending(date);
    const isCurrentMonth = isSameMonth(date, selectedDate);
    const dayNumber = format(date, 'd');
    const isToday = isSameDay(date, new Date('2025-01-12T17:01:44-05:00'));
    const hasTransactions = totalSpent > 0;

    return (
      <Pressable 
        key={date.toISOString()}
        onPress={() => onSelectDate(date)}
        style={[
          styles.dayCellWrapper,
          !isCurrentMonth && { opacity: 0.5 }
        ]}
      >
        <Surface
          style={[
            styles.dayCell,
            {
              backgroundColor: isSelected 
                ? theme.colors.primaryContainer 
                : theme.colors.surfaceVariant,
              borderRadius: 8,
            },
          ]}
          elevation={isSelected ? 2 : 0}
        >
          <View style={styles.dayCellInner}>
            <Text
              style={{
                color: isSelected 
                  ? theme.colors.onPrimaryContainer 
                  : isToday
                  ? theme.colors.primary
                  : theme.colors.onSurface,
                fontSize: 16,
                fontWeight: '500',
                textAlign: 'center',
                marginBottom: hasTransactions ? 4 : 0,
              }}
            >
              {dayNumber}
            </Text>
            {isCurrentMonth && hasTransactions && (
              <Text
                style={{
                  color: theme.colors.error,
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                ${Math.round(totalSpent)}
              </Text>
            )}
          </View>
        </Surface>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          size={24}
          onPress={() => onSelectDate(subMonths(selectedDate, 1))}
          mode="contained"
          containerColor={theme.colors.surfaceVariant}
          iconColor={theme.colors.onSurfaceVariant}
        />
        <Text 
          style={{ 
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.onBackground,
            textAlign: 'center',
            marginHorizontal: 16,
          }}
        >
          {format(selectedDate, 'MMMM yyyy')}
        </Text>
        <IconButton
          icon="chevron-right"
          size={24}
          onPress={() => onSelectDate(addMonths(selectedDate, 1))}
          mode="contained"
          containerColor={theme.colors.surfaceVariant}
          iconColor={theme.colors.onSurfaceVariant}
        />
      </View>
      <View style={styles.weekDaysRow}>
        {weekDays.map(day => (
          <Text
            key={day}
            style={styles.weekDay}
          >
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {days.map(date => renderDay(date))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDay: {
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4, // Compensate for cell padding
  },
  dayCellWrapper: {
    width: '14.28%', // 100% / 7 days
    padding: 4,
    aspectRatio: 1,
  },
  dayCell: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});
