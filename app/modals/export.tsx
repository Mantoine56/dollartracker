import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme, SegmentedButtons, Portal, Modal } from 'react-native-paper';
import { Screen } from '../../components/layout';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/auth';

type ExportFormat = 'csv' | 'pdf';
type DateRange = 'week' | 'month' | 'year' | 'all';

export default function ExportScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const [format, setFormat] = React.useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = React.useState<DateRange>('month');
  const [isExporting, setIsExporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const handleExport = async () => {
    if (!user) return;

    try {
      setIsExporting(true);
      setProgress(0);

      // Get transactions based on date range
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'all':
          startDate = new Date(0); // Beginning of time
          break;
      }

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProgress(50);

      let content = '';
      let filename = '';
      
      if (format === 'csv') {
        // Generate CSV content
        const headers = ['Date', 'Amount', 'Description', 'Category'];
        const rows = transactions.map(t => [
          new Date(t.created_at).toLocaleDateString(),
          t.amount.toString(),
          t.description,
          t.category
        ]);
        
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `transactions_${dateRange}_${new Date().toISOString()}.csv`;
      } else {
        // For PDF we'll just use a simple text format for now
        // In a real app, you'd want to use a proper PDF generation library
        content = transactions.map(t => 
          `${new Date(t.created_at).toLocaleDateString()} - $${t.amount} - ${t.description} (${t.category})`
        ).join('\n');
        filename = `transactions_${dateRange}_${new Date().toISOString()}.txt`;
      }

      setProgress(75);

      // Save to file
      const path = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(path, content);

      setProgress(90);

      // Share the file
      await Sharing.shareAsync(path, {
        mimeType: format === 'csv' ? 'text/csv' : 'text/plain',
        dialogTitle: 'Export Transactions',
      });

      setProgress(100);
      router.back();
    } catch (error) {
      console.error('Export error:', error);
      // Show error in UI
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Export Transactions</Text>
        
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Format</Text>
          <SegmentedButtons
            value={format}
            onValueChange={value => setFormat(value as ExportFormat)}
            buttons={[
              { value: 'csv', label: 'CSV' },
              { value: 'pdf', label: 'PDF' }
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Date Range</Text>
          <SegmentedButtons
            value={dateRange}
            onValueChange={value => setDateRange(value as DateRange)}
            buttons={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
              { value: 'all', label: 'All' }
            ]}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleExport}
            loading={isExporting}
            disabled={isExporting}
            style={styles.button}
          >
            Export
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            disabled={isExporting}
            style={styles.button}
          >
            Cancel
          </Button>
        </View>
      </View>

      <Portal>
        <Modal
          visible={isExporting}
          dismissable={false}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.background }
          ]}
        >
          <Text variant="bodyLarge">Exporting transactions...</Text>
          <Text variant="bodyMedium" style={styles.progress}>{progress}%</Text>
        </Modal>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
    gap: 8,
  },
  button: {
    marginVertical: 4,
  },
  modal: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  progress: {
    marginTop: 8,
  },
});
