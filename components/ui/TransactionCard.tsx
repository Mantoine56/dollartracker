import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';

type TransactionCardProps = {
  amount: number;
  category: string;
  timestamp: Date;
  notes?: string;
  onPress?: () => void;
};

export const TransactionCard = ({
  amount,
  category,
  timestamp,
  notes,
  onPress,
}: TransactionCardProps) => {
  const theme = useTheme();

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food': return 'food';
      case 'transport': return 'car';
      case 'shopping': return 'shopping';
      case 'entertainment': return 'movie';
      case 'bills': return 'file-document';
      case 'health': return 'medical-bag';
      default: return 'cash';
    }
  };

  return (
    <Card onPress={onPress} elevation="small">
      <View style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primary.light + '20' }, // 20% opacity
          ]}
        >
          <MaterialCommunityIcons
            name={getCategoryIcon(category)}
            size={24}
            color={theme.colors.primary.main}
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.topRow}>
            <Text variant="titleMedium" style={styles.category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <Text
              variant="titleMedium"
              style={[styles.amount, { color: theme.colors.error.main }]}
            >
              -${amount.toFixed(2)}
            </Text>
          </View>

          {notes && (
            <Text
              variant="bodyMedium"
              style={[styles.notes, { color: theme.colors.text.secondary }]}
            >
              {notes}
            </Text>
          )}

          <Text
            variant="bodySmall"
            style={[styles.timestamp, { color: theme.colors.text.muted }]}
          >
            {timestamp.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontWeight: '600',
  },
  amount: {
    fontWeight: '600',
  },
  notes: {
    marginTop: 2,
  },
  timestamp: {
    marginTop: 4,
  },
});
