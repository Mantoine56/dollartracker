import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, ActivityIndicator, Clipboard, Platform } from 'react-native';
import { Text, useTheme, SegmentedButtons, Surface, IconButton, Snackbar, Portal, Modal, Button } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Screen } from '../../components/layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSpendingByTimeframe, useSpendingByCategory, useDailySpendingPatterns } from '../../lib/enhanced-hooks';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type TimeFrame = 'week' | 'month' | 'custom';

export default function StatsScreen() {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState<TimeFrame>('month');
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [currentDateSelection, setCurrentDateSelection] = useState<'start' | 'end'>('start');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Get date range based on timeframe
  const getDateRange = useMemo(() => {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'custom':
        return {
          start: customStartDate,
          end: customEndDate
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
    }
  }, [timeframe, customStartDate, customEndDate]);

  // Handle timeframe change
  const handleTimeframeChange = (value: TimeFrame) => {
    setTimeframe(value);
    if (value === 'custom') {
      setShowCustomDateModal(true);
    }
  };

  // Handle date selection
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || (currentDateSelection === 'start' ? customStartDate : customEndDate);
    
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }

    if (currentDateSelection === 'start') {
      setCustomStartDate(currentDate);
      if (Platform.OS === 'ios') {
        setCurrentDateSelection('end');
      }
    } else {
      setCustomEndDate(currentDate);
      if (Platform.OS === 'ios') {
        setDatePickerVisible(false);
      }
    }
  };

  // Fetch data using hooks with date range
  const { data: spendingData, isLoading: isSpendingLoading } = useSpendingByTimeframe(
    timeframe,
    getDateRange.start,
    getDateRange.end
  );
  const { data: categoryData, isLoading: isCategoryLoading } = useSpendingByCategory(
    timeframe,
    timeframe === 'custom' ? customStartDate : undefined,
    timeframe === 'custom' ? customEndDate : undefined
  );
  const { data: patternsData, isLoading: isPatternsLoading } = useDailySpendingPatterns();

  // Process spending data for charts
  const processTransactionsForChart = (transactions: any[], timeframe: TimeFrame) => {
    if (!transactions) return { labels: [], datasets: [{ data: [] }] };

    let startDate: Date;
    let endDate: Date;
    let dateFormat: string;

    if (timeframe === 'week') {
      startDate = startOfWeek(new Date());
      endDate = endOfWeek(new Date());
      dateFormat = 'EEE';
    } else if (timeframe === 'month') {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
      dateFormat = 'MMM d';
    } else {
      startDate = customStartDate;
      endDate = customEndDate;
      dateFormat = 'MMM d';
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Initialize spending for all days
    const dailySpending = days.reduce((acc, day) => {
      acc[format(day, 'yyyy-MM-dd')] = 0;
      return acc;
    }, {} as Record<string, number>);

    // Sum transactions for each day
    transactions.forEach((transaction: any) => {
      const date = format(parseISO(transaction.transaction_time), 'yyyy-MM-dd');
      if (dailySpending.hasOwnProperty(date)) {
        dailySpending[date] += transaction.amount;
      }
    });

    // Convert to chart data format
    let labels: string[];
    if (timeframe === 'month') {
      // For monthly view, only show every 5th day and month start/end
      labels = days.map((day, index) => {
        const dayOfMonth = parseInt(format(day, 'd'));
        if (dayOfMonth === 1 || dayOfMonth % 5 === 0 || index === days.length - 1) {
          return format(day, 'd');
        }
        return '';
      });
    } else {
      labels = days.map(day => format(day, dateFormat));
    }
    
    const data = days.map(day => dailySpending[format(day, 'yyyy-MM-dd')]);

    return {
      labels,
      datasets: [{ data }],
    };
  };

  const chartData = useMemo(() => processTransactionsForChart(spendingData, timeframe), [spendingData, timeframe]);

  // Process category data
  const categorySpending = useMemo(() => {
    if (!categoryData) return [];

    // Sort categories by amount in descending order
    const sortedCategories = [...categoryData].sort((a, b) => b.total_amount - a.total_amount);
    
    // Get the highest spending amount for relative scaling
    const maxAmount = sortedCategories[0]?.total_amount || 0;
    
    return sortedCategories.map(category => ({
      name: category.category_name,
      amount: category.total_amount,
      // Calculate relative width (leave some space for the amount text)
      relativeWidth: maxAmount > 0 ? (category.total_amount / maxAmount) * 65 : 0 // 65% of available width
    }));
  }, [categoryData]);

  // Process patterns data for heatmap
  const spendingPatterns = useMemo(() => {
    if (!patternsData) return [];

    return patternsData.map((pattern: any) => ({
      day: pattern.day_of_week,
      hour: pattern.hour_of_day,
      value: pattern.transaction_count,
    }));
  }, [patternsData]);

  const handleExport = async () => {
    if (!spendingData) return;

    const csvContent = [
      'Date,Category,Amount,Notes',
      ...spendingData.map((transaction: any) => 
        `${format(new Date(transaction.transaction_time), 'yyyy-MM-dd')},${transaction.categories?.name || 'Uncategorized'},${transaction.amount},${transaction.notes || ''}`
      )
    ].join('\n');

    await Clipboard.setString(csvContent);
    setSnackbarVisible(true);
  };

  const isLoading = isSpendingLoading || isCategoryLoading || isPatternsLoading;

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <SegmentedButtons
          value={timeframe}
          onValueChange={handleTimeframeChange}
          buttons={[
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'custom', label: 'Custom' },
          ]}
          style={styles.segmentedButtons}
        />

        {timeframe === 'custom' && (
          <View style={styles.dateRangeContainer}>
            <Text variant="bodyMedium" style={styles.dateRangeText}>
              {format(customStartDate, 'MMM d, yyyy')} - {format(customEndDate, 'MMM d, yyyy')}
            </Text>
            <IconButton
              icon="calendar"
              mode="contained-tonal"
              size={20}
              onPress={() => setShowCustomDateModal(true)}
            />
          </View>
        )}

        <View style={styles.titleContainer}>
          <Text variant="headlineMedium" style={styles.title}>Stats Dashboard</Text>
          <IconButton
            icon="content-copy"
            mode="contained-tonal"
            onPress={handleExport}
            style={styles.exportButton}
            disabled={isLoading || !spendingData}
            accessibilityLabel="Export stats as CSV"
            accessibilityHint="Copies spending data to clipboard in CSV format"
          />
        </View>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <>
            <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <Text variant="titleMedium" style={styles.chartTitle}>Spending Over Time</Text>
              <View style={styles.chartWrapper}>
                <View style={styles.chartContainer}>
                  <LineChart
                    data={chartData}
                    width={Dimensions.get('window').width - 64}
                    height={200}
                    chartConfig={{
                      backgroundColor: theme.colors.surface,
                      backgroundGradientFrom: theme.colors.surface,
                      backgroundGradientTo: theme.colors.surface,
                      decimalPlaces: 0,
                      color: (opacity = 1) => theme.colors.primary,
                      labelColor: (opacity = 1) => theme.colors.onSurface,
                      style: {
                        borderRadius: 8,
                      },
                      propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: theme.colors.primary
                      },
                      propsForLabels: {
                        fontSize: timeframe === 'month' ? 10 : 12,
                        rotation: timeframe === 'month' ? 45 : 0,
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: [], // Solid lines
                        stroke: theme.colors.outlineVariant,
                        strokeWidth: 1,
                      },
                    }}
                    bezier
                    style={{
                      borderRadius: 8,
                      backgroundColor: theme.colors.surface,
                    }}
                    withVerticalLabels
                    withHorizontalLabels
                    withDots
                    withInnerLines
                    withOuterLines
                    yAxisLabel="$"
                    yAxisInterval={timeframe === 'month' ? 2 : 1}
                    formatYLabel={(value) => value.toString()}
                    getDotColor={(dataPoint, index) => theme.colors.primary}
                  />
                </View>
              </View>
            </Surface>

            <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <Text variant="titleMedium" style={styles.chartTitle}>Spending by Category</Text>
              <View style={styles.categoryList}>
                {categorySpending.map((category, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryNameContainer}>
                      <Text variant="bodyMedium" numberOfLines={1} style={styles.categoryName}>
                        {category.name.length > 8 ? category.name.slice(0, 8) + '...' : category.name}
                      </Text>
                    </View>
                    <View style={[
                      styles.categoryBarContainer,
                      { backgroundColor: theme.colors.surfaceVariant }
                    ]}>
                      <View 
                        style={[
                          styles.categoryBar,
                          { 
                            width: `${category.relativeWidth}%`,
                            backgroundColor: theme.colors.primary,
                          }
                        ]} 
                      />
                    </View>
                    <Text variant="bodyMedium" style={styles.categoryAmount}>
                      ${category.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </Surface>

            <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <Text variant="titleMedium" style={styles.chartTitle}>Daily Spending Patterns</Text>
              <View style={styles.patternsContainer}>
                {spendingPatterns.map((pattern, index) => (
                  <View key={index} style={styles.patternRow}>
                    <Text style={styles.patternLabel}>{pattern.day}</Text>
                    <View style={[
                      styles.patternBar,
                      {
                        backgroundColor: theme.colors.primary,
                        width: `${(pattern.value / Math.max(...spendingPatterns.map(p => p.value))) * 100}%`,
                      }
                    ]} />
                    <Text style={styles.patternValue}>${pattern.value.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </Surface>
          </>
        )}
      </ScrollView>
      <Portal>
        <Modal
          visible={showCustomDateModal}
          onDismiss={() => setShowCustomDateModal(false)}
          contentContainerStyle={{
            margin: 20,
            borderRadius: 12,
            padding: 20,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            backgroundColor: theme.colors.background,
          }}
        >
          <Text variant="titleLarge" style={{ marginBottom: 20, textAlign: 'center', fontWeight: '600' }}>Select Date Range</Text>
          
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text variant="bodyMedium">Start Date:</Text>
              <Button
                mode="contained-tonal"
                onPress={() => {
                  setCurrentDateSelection('start');
                  setDatePickerVisible(true);
                }}
              >
                {format(customStartDate, 'MMM d, yyyy')}
              </Button>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text variant="bodyMedium">End Date:</Text>
              <Button
                mode="contained-tonal"
                onPress={() => {
                  setCurrentDateSelection('end');
                  setDatePickerVisible(true);
                }}
              >
                {format(customEndDate, 'MMM d, yyyy')}
              </Button>
            </View>

            {Platform.OS === 'ios' && datePickerVisible && (
              <View style={{ marginTop: 10, marginBottom: 10, borderRadius: 8, overflow: 'hidden' }}>
                <DateTimePicker
                  value={currentDateSelection === 'start' ? customStartDate : customEndDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  textColor={theme.colors.onBackground}
                />
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
            <Button 
              onPress={() => {
                setShowCustomDateModal(false);
                setDatePickerVisible(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={() => {
                setShowCustomDateModal(false);
                setDatePickerVisible(false);
              }}
            >
              Apply
            </Button>
          </View>
        </Modal>
      </Portal>

      {Platform.OS === 'android' && datePickerVisible && (
        <DateTimePicker
          value={currentDateSelection === 'start' ? customStartDate : customEndDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
        
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        Data copied to clipboard in CSV format
      </Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    flex: 1,
  },
  chartCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  chartTitle: {
    marginBottom: 16,
  },
  chartWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartContainer: {
    marginHorizontal: -8,
  },
  categoryList: {
    marginTop: 8,
    width: '100%',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  categoryNameContainer: {
    width: 80,
    paddingRight: 8,
  },
  categoryName: {
    flexShrink: 1,
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryAmount: {
    width: 80,
    textAlign: 'right',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateRangeText: {
    flex: 1,
  },
  loading: {
    marginTop: 32,
  },
  exportButton: {
    marginLeft: 8,
  },
  customDateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
