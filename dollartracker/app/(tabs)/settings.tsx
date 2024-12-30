import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { Screen } from '../../components/layout';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>Settings</Text>
        <Button 
          mode="contained" 
          onPress={() => router.push('/setup')}
          style={styles.button}
        >
          Budget Setup
        </Button>
      </View>
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
  button: {
    marginVertical: 8,
  },
});
