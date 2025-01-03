import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, ActivityIndicator, Clipboard, Platform } from 'react-native';
import { Text, useTheme, SegmentedButtons, Surface, IconButton, Snackbar, Portal, Modal, Button } from 'react-native-paper';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { Screen } from '../../components/layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSpendingByTimeframe, useSpendingByCategory, useDailySpendingPatterns } from '../../lib/enhanced-hooks';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
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
    getDateRange.start,
    getDateRange.end
  );
  const { data: patternsData, isLoading: isPatternsLoading } = useDailySpendingPatterns();

  // Process spending data for charts
  const barData = useMemo(() => {
    if (!spendingData) return [];

    const groupedByDay = spendingData.reduce((acc: any, transaction: any) => {
      const date = format(new Date(transaction.transaction_time), 'EEE');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += transaction.amount;
      return acc;
    }, {});

    return Object.entries(groupedByDay).map(([label, value]) => ({
      value,
      label,
      frontColor: theme.colors.primary,
    }));
  }, [spendingData]);

  // Process category data for pie chart
  const pieData = useMemo(() => {
    if (!categoryData) return [];

    return categoryData.map((category: any) => ({
      value: category.total_amount,
      text: category.category_name,
      color: category.color || theme.colors.primary,
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
            <Surface style={styles.chartCard} elevation={1}>
              <Text variant="titleMedium" style={styles.chartTitle}>Spending Over Time</Text>
              <BarChart
                data={barData}
                barWidth={30}
                spacing={20}
                roundedTop
                hideRules
                xAxisThickness={1}
                yAxisThickness={1}
                yAxisTextStyle={{ color: theme.colors.onSurface }}
                xAxisLabelTextStyle={{ color: theme.colors.onSurface }}
                noOfSections={4}
              />
            </Surface>

            <Surface style={styles.chartCard} elevation={1}>
              <Text variant="titleMedium" style={styles.chartTitle}>Spending by Category</Text>
              <PieChart
                data={pieData}
                donut
                showText
                textColor={theme.colors.onSurface}
                radius={120}
                innerRadius={80}
              />
            </Surface>

            <Surface style={styles.chartCard} elevation={1}>
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
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background }
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Select Date Range</Text>
          
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerRow}>
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

            <View style={styles.datePickerRow}>
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
              <View style={styles.iosDatePickerContainer}>
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

          <View style={styles.modalActions}>
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  chartCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  chartTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  loading: {
    marginTop: 32,
  },
  patternsContainer: {
    marginTop: 16,
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  patternLabel: {
    width: 100,
  },
  patternBar: {
    height: 20,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  patternValue: {
    minWidth: 60,
    textAlign: 'right',
  },
  exportButton: {
    marginLeft: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dateRangeText: {
    marginRight: 8,
  },
  modalContainer: {
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
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iosDatePickerContainer: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
