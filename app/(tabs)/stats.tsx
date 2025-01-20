import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, ActivityIndicator, Clipboard, Platform } from 'react-native';
import { Text, useTheme, SegmentedButtons, Surface, IconButton, Snackbar, Portal, Modal, Button } from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Screen } from '../../components/layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSpendingByTimeframe, useSpendingByCategory, useDailySpendingPatterns } from '../../lib/enhanced-hooks';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

type TimeFrame = 'week' | 'month' | 'custom';

const AnimatedSurface = Animated.createAnimatedComponent(Surface);

export default function StatsScreen() {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState<TimeFrame>('week');
  const [categoryViewType, setCategoryViewType] = useState<'bar' | 'pie'>('bar');
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [currentDateSelection, setCurrentDateSelection] = useState<'start' | 'end'>('start');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 24,
      gap: 8,
    },
    segmentedButtons: {
      marginBottom: 12,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    title: {
      flex: 1,
    },
    chartCard: {
      padding: 16,
      borderRadius: 12,
    },
    chartTitle: {
      marginBottom: 12,
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
      marginBottom: 12,
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
    chartHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    pieChartContainer: {
      alignItems: 'center',
    },
    insightsList: {
      gap: 16,
    },
    insightItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    insightLabel: {
      flex: 1,
    },
    insightValue: {
      fontWeight: '600',
    },
    savingsContainer: {
      gap: 12,
    },
    savingsProgressBar: {
      height: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 4,
      overflow: 'hidden',
    },
    savingsProgress: {
      height: '100%',
      borderRadius: 4,
    },
    savingsInfo: {
      marginTop: 12,
      alignItems: 'center',
      gap: 4,
    },
    savingsAmount: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    savingsDaysLeft: {
      fontSize: 14,
      textAlign: 'center',
      color: theme.colors.primary,
      opacity: 0.9,
    },
    savingsStatus: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    savingsGoalMarker: {
      position: 'absolute',
      top: -20,
      transform: [{ translateX: -20 }],
      fontSize: 12,
      color: theme.colors.outline,
    },
    loadingContainer: {
      height: 220,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      height: 220,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    emptyText: {
      color: theme.colors.onSurfaceDisabled,
    },
  });

  const getContextualColor = (value: number, threshold: number, isInverse: boolean = false) => {
    if (isInverse) {
      return value > threshold ? theme.colors.error : theme.colors.success;
    }
    return value > threshold ? theme.colors.success : theme.colors.error;
  };

  const getDailySpendingColor = (avgSpending: number) => {
    const dailyBudget = 1000 / (timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 
      Math.ceil((customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24)));
    return getContextualColor(dailyBudget - avgSpending, 0);
  };

  const getSavingsColor = (saved: number) => {
    const targetSavings = timeframe === 'week' ? 200 : timeframe === 'month' ? 800 : 400;
    return getContextualColor(saved, targetSavings);
  };

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

  const getDaysLeftInPeriod = () => {
    const end = timeframe === 'week' ? endOfWeek(new Date()) :
               timeframe === 'month' ? endOfMonth(new Date()) :
               customEndDate;
    const daysLeft = Math.ceil((end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const getSavingsGoalInfo = () => {
    const totalBudget = 1000;
    const currentSpending = spendingData?.reduce((sum, t) => sum + (t?.amount || 0), 0) || 0;
    const savedAmount = totalBudget - currentSpending;
    const targetSavings = timeframe === 'week' ? 200 : timeframe === 'month' ? 800 : 400;
    const savingsProgress = (savedAmount / targetSavings) * 100;
    const daysLeft = getDaysLeftInPeriod();
    
    return {
      savedAmount,
      targetSavings,
      savingsProgress: Math.min(100, Math.max(0, savingsProgress)),
      daysLeft,
      isOnTrack: savedAmount >= targetSavings * (1 - daysLeft / (timeframe === 'week' ? 7 : 30))
    };
  };

  const renderSpendingChart = () => {
    if (isSpendingLoading) {
      return (
        <View style={[styles.chartCard, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (!chartData.datasets[0].data.length) {
      return (
        <Surface style={[styles.chartCard, styles.emptyContainer]}>
          <MaterialCommunityIcons name="chart-line" size={48} color={theme.colors.onSurfaceDisabled} />
          <Text variant="bodyLarge" style={styles.emptyText}>No spending data available</Text>
        </Surface>
      );
    }

    return (
      <Surface style={styles.chartCard}>
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
      </Surface>
    );
  };

  const renderCategoryChart = () => {
    if (isCategoryLoading) {
      return (
        <View style={[styles.chartCard, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (!categorySpending.length) {
      return (
        <Surface style={[styles.chartCard, styles.emptyContainer]}>
          <MaterialCommunityIcons name="chart-pie" size={48} color={theme.colors.onSurfaceDisabled} />
          <Text variant="bodyLarge" style={styles.emptyText}>No category data available</Text>
        </Surface>
      );
    }

    return categoryViewType === 'pie' ? (
      <Surface style={styles.chartCard}>
        <PieChart
          data={categorySpending.map((category, index) => ({
            name: category.name,
            amount: category.amount,
            color: theme.colors.primary,
            legendFontColor: theme.colors.onSurface,
          }))}
          width={Dimensions.get('window').width - 64}
          height={220}
          chartConfig={{
            color: (opacity = 1) => theme.colors.primary,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </Surface>
    ) : (
      <Surface style={styles.chartCard}>
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
    );
  };

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
          <Animated.View 
            entering={FadeInDown} 
            layout={Layout.duration(300)}
            style={styles.dateRangeContainer}
          >
            <Text variant="bodyMedium" style={styles.dateRangeText}>
              {format(customStartDate, 'MMM d, yyyy')} - {format(customEndDate, 'MMM d, yyyy')}
            </Text>
            <IconButton
              icon="calendar"
              mode="contained-tonal"
              size={20}
              onPress={() => setShowCustomDateModal(true)}
            />
          </Animated.View>
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
            <AnimatedSurface 
              style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} 
              elevation={1}
              entering={FadeInDown.delay(100).duration(400)}
              layout={Layout.duration(300)}
            >
              <Text variant="titleMedium" style={styles.chartTitle}>Spending Over Time</Text>
              <View style={styles.chartWrapper}>
                <View style={styles.chartContainer}>
                  {renderSpendingChart()}
                </View>
              </View>
            </AnimatedSurface>

            <AnimatedSurface 
              style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} 
              elevation={1}
              entering={FadeInDown.delay(200).duration(400)}
              layout={Layout.duration(300)}
            >
              <View style={styles.chartHeaderContainer}>
                <Text variant="titleMedium" style={styles.chartTitle}>Spending by Category</Text>
                <IconButton
                  icon={categoryViewType === 'bar' ? 'chart-pie' : 'chart-bar'}
                  size={20}
                  onPress={() => setCategoryViewType(prev => prev === 'bar' ? 'pie' : 'bar')}
                />
              </View>
              {renderCategoryChart()}
            </AnimatedSurface>

            <AnimatedSurface 
              style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} 
              elevation={1}
              entering={FadeInDown.delay(300).duration(400)}
              layout={Layout.duration(300)}
            >
              <Text variant="titleMedium" style={styles.chartTitle}>Spending Insights</Text>
              <View style={styles.insightsList}>
                {!isLoading && spendingData && (
                  <>
                    <View style={styles.insightItem}>
                      <Text variant="bodyMedium" style={styles.insightLabel}>Average Daily Spending</Text>
                      <Text variant="bodyLarge" style={[
                        styles.insightValue,
                        { color: getDailySpendingColor(spendingData && spendingData.length > 0
                          ? spendingData.reduce((sum, t) => sum + (t?.amount || 0), 0) / 
                            (timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 
                            Math.ceil((customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24)))
                          : 0) }
                      ]}>
                        ${spendingData && spendingData.length > 0
                          ? (spendingData.reduce((sum, t) => sum + (t?.amount || 0), 0) / 
                            (timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 
                            Math.ceil((customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24)))).toFixed(2)
                          : '0.00'}
                      </Text>
                    </View>

                    <View style={styles.insightItem}>
                      <Text variant="bodyMedium" style={styles.insightLabel}>Peak Spending Day</Text>
                      <Text variant="bodyLarge" style={styles.insightValue}>
                        {spendingData && spendingData.length > 0 
                          ? format(new Date(spendingData.reduce((max, t) => 
                              (t?.amount || 0) > (max?.amount || 0) ? t : max, 
                              spendingData[0])?.transaction_time || new Date()), 
                            'EEEE')
                          : 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.insightItem}>
                      <Text variant="bodyMedium" style={styles.insightLabel}>Total Transactions</Text>
                      <Text variant="bodyLarge" style={styles.insightValue}>
                        {spendingData?.length || 0}
                      </Text>
                    </View>

                    <View style={styles.insightItem}>
                      <Text variant="bodyMedium" style={styles.insightLabel}>Budget Status</Text>
                      <Text 
                        variant="bodyLarge" 
                        style={[
                          styles.insightValue,
                          { color: (spendingData?.reduce((sum, t) => sum + (t?.amount || 0), 0) || 0) > 1000 
                            ? theme.colors.error 
                            : theme.colors.success }
                        ]}
                      >
                        {(spendingData?.reduce((sum, t) => sum + (t?.amount || 0), 0) || 0) > 1000 
                          ? 'Over Budget' 
                          : 'Under Budget'}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </AnimatedSurface>

            <AnimatedSurface 
              style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} 
              elevation={1}
              entering={FadeInDown.delay(400).duration(400)}
              layout={Layout.duration(300)}
            >
              <Text variant="titleMedium" style={styles.chartTitle}>Savings Progress</Text>
              <View style={styles.savingsContainer}>
                <View style={styles.savingsProgressBar}>
                  <View
                    style={[
                      styles.savingsProgress,
                      {
                        backgroundColor: theme.colors.primary,
                        width: `${getSavingsGoalInfo().savingsProgress}%`
                      }
                    ]}
                  />
                  <Text style={[styles.savingsGoalMarker, { left: '40%' }]}>Target</Text>
                </View>
                <View style={styles.savingsInfo}>
                  <Text variant="bodyMedium" style={[
                    styles.savingsAmount,
                    { color: getSavingsGoalInfo().isOnTrack ? theme.colors.success : theme.colors.error }
                  ]}>
                    ${getSavingsGoalInfo().savedAmount.toFixed(2)} saved of ${getSavingsGoalInfo().targetSavings} goal
                  </Text>
                  <Text style={styles.savingsDaysLeft}>
                    {getSavingsGoalInfo().daysLeft} days left in {timeframe}
                  </Text>
                  <Text style={[
                    styles.savingsStatus,
                    { color: getSavingsGoalInfo().isOnTrack ? theme.colors.success : theme.colors.error }
                  ]}>
                    {getSavingsGoalInfo().isOnTrack ? 'On track to meet savings goal! 🎯' : 'Need to save more to meet goal 💪'}
                  </Text>
                </View>
              </View>
            </AnimatedSurface>
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
