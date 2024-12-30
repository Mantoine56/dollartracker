import { StyleSheet, View, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { VictoryPie, VictoryLabel } from 'victory-native';

export default function StatsScreen() {
  const data = [
    { x: "Food", y: 35 },
    { x: "Transport", y: 25 },
    { x: "Shopping", y: 20 },
    { x: "Entertainment", y: 20 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Overview</Text>
      
      <View style={styles.chartContainer}>
        <VictoryPie
          data={data}
          width={Dimensions.get('window').width - 32}
          height={300}
          colorScale={['#58A6FF', '#32CD32', '#FFA500', '#FF6B6B']}
          style={{
            labels: {
              fill: '#FFFFFF',
            },
          }}
          labelComponent={<VictoryLabel style={{ fill: '#FFFFFF' }} />}
        />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        {/* Additional stats will go here */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 16,
  },
  title: {
    fontSize: 24,
    color: '#58A6FF',
    marginBottom: 24,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 16,
  },
});
