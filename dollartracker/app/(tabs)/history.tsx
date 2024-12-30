import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Chip } from 'react-native-paper';

export default function HistoryScreen() {
  const categories = ['All', 'Food', 'Transport', 'Shopping', 'Entertainment'];

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.filterContainer} showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <Chip
            key={category}
            style={styles.chip}
            textStyle={styles.chipText}
            onPress={() => {}}>
            {category}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView style={styles.transactionList}>
        {/* Transaction list will go here */}
        <Text style={styles.emptyText}>No transactions yet</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  filterContainer: {
    padding: 16,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#2D2D2D',
  },
  chipText: {
    color: '#FFFFFF',
  },
  transactionList: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    color: '#808080',
    textAlign: 'center',
    marginTop: 24,
  },
});
