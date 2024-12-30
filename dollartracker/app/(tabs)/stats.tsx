import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { Text, useTheme, SegmentedButtons, Surface, IconButton } from 'react-native-paper';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { Screen } from '../../components/layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TimeFrame = 'week' | 'month' | 'custom';

export default function StatsScreen() {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState<TimeFrame>('month');

  // Sample data - replace with real data
  const barData = [
    { value: 250, label: 'Mon', frontColor: theme.colors.primary },
    { value: 500, label: 'Tue', frontColor: theme.colors.primary },
    { value: 745, label: 'Wed', frontColor: theme.colors.primary },
    { value: 320, label: 'Thu', frontColor: theme.colors.primary },
    { value: 600, label: 'Fri', frontColor: theme.colors.primary },
    { value: 256, label: 'Sat', frontColor: theme.colors.primary },
    { value: 300, label: 'Sun', frontColor: theme.colors.primary },
  ];

  const lineData = [
    { value: 500, label: '1' },
    { value: 600, label: '5' },
    { value: 700, label: '10' },
    { value: 550, label: '15' },
    { value: 800, label: '20' },
    { value: 750, label: '25' },
    { value: 650, label: '30' },
  ];

  const spendingPatterns = [
    [0, 1, 2, 3, 2, 1, 0],
    [1, 2, 3, 2, 1, 0, 1],
    [2, 3, 2, 1, 0, 1, 2],
    [3, 2, 1, 0, 1, 2, 3],
  ];

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export data');
  };

  return (
    <Screen>
      <ScrollView style={styles.container}>
        {/* Time Frame Selector */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>Stats Dashboard</Text>
          <IconButton
            icon="download"
            mode="contained"
            onPress={handleExport}
            style={styles.exportButton}
          />
        </View>

        <SegmentedButtons
          value={timeframe}
          onValueChange={setTimeframe}
          buttons={[
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'custom', label: 'Custom' },
          ]}
          style={styles.segmentedButtons}
        />

        {/* Monthly Spending Progress */}
        <Surface style={styles.chartCard}>
          <Text variant="titleMedium" style={styles.chartTitle}>Monthly Spending</Text>
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
            maxValue={1000}
          />
        </Surface>

        {/* Spending Patterns Heatmap */}
        <Surface style={styles.chartCard}>
          <Text variant="titleMedium" style={styles.chartTitle}>Spending Patterns</Text>
          <View style={styles.heatmapContainer}>
            {spendingPatterns.map((row, i) => (
              <View key={i} style={styles.heatmapRow}>
                {row.map((value, j) => (
                  <View
                    key={j}
                    style={[
                      styles.heatmapCell,
                      {
                        backgroundColor: theme.colors.primary,
                        opacity: 0.2 + (value * 0.2),
                      },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
          <View style={styles.heatmapLegend}>
            <Text variant="bodySmall">Low</Text>
            <View style={styles.heatmapLegendGradient}>
              {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                <View
                  key={i}
                  style={[
                    styles.legendCell,
                    {
                      backgroundColor: theme.colors.primary,
                      opacity,
                    },
                  ]}
                />
              ))}
            </View>
            <Text variant="bodySmall">High</Text>
          </View>
        </Surface>

        {/* Trends */}
        <Surface style={styles.chartCard}>
          <Text variant="titleMedium" style={styles.chartTitle}>Spending Trends</Text>
          <LineChart
            data={lineData}
            color={theme.colors.primary}
            thickness={2}
            maxValue={1000}
            noOfSections={4}
            yAxisTextStyle={{ color: theme.colors.onSurface }}
            xAxisLabelTextStyle={{ color: theme.colors.onSurface }}
            hideDataPoints
            curved
          />
        </Surface>
      </ScrollView>
    </Screen>
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
  title: {
    flex: 1,
  },
  exportButton: {
    marginLeft: 8,
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  chartCard: {
    padding: 16,
    marginBottom: 24,
    borderRadius: 12,
    elevation: 2,
  },
  chartTitle: {
    marginBottom: 16,
  },
  heatmapContainer: {
    marginVertical: 16,
  },
  heatmapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heatmapCell: {
    width: (Dimensions.get('window').width - 80) / 7,
    height: 30,
    borderRadius: 4,
    margin: 2,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  heatmapLegendGradient: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  legendCell: {
    width: 20,
    height: 20,
    marginHorizontal: 2,
  },
});
