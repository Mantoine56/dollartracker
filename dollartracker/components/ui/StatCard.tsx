import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  style?: ViewStyle;
};

export const StatCard = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  style,
}: StatCardProps) => {
  const theme = useTheme();

  const getTrendColor = () => {
    if (!trend) return theme.colors.text.secondary;
    switch (trend.direction) {
      case 'up':
        return theme.colors.error.main;
      case 'down':
        return theme.colors.success.main;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'trending-neutral';
    }
  };

  return (
    <Card style={[styles.container, style]}>
      <View style={styles.header}>
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.text.secondary }]}
        >
          {title}
        </Text>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={theme.colors.primary.main}
          />
        )}
      </View>

      <View style={styles.content}>
        <Text variant="displaySmall" style={styles.value}>
          {value}
        </Text>
        
        {trend && (
          <View style={styles.trendContainer}>
            <MaterialCommunityIcons
              name={getTrendIcon()}
              size={20}
              color={getTrendColor()}
              style={styles.trendIcon}
            />
            <Text
              variant="bodyMedium"
              style={[styles.trendValue, { color: getTrendColor() }]}
            >
              {trend.value}%
            </Text>
          </View>
        )}
      </View>

      {subtitle && (
        <Text
          variant="bodySmall"
          style={[styles.subtitle, { color: theme.colors.text.secondary }]}
        >
          {subtitle}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  value: {
    fontWeight: 'bold',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    marginRight: 4,
  },
  trendValue: {
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 8,
  },
});
