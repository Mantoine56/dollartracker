import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../ui/Button';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  action?: {
    label: string;
    onPress: () => void;
    mode?: 'contained' | 'outlined' | 'text';
  };
  style?: ViewStyle;
  imageComponent?: React.ReactNode;
};

export const EmptyState = ({
  title,
  description,
  icon = 'alert-circle-outline',
  action,
  style,
  imageComponent,
}: EmptyStateProps) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      {imageComponent || (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.colors.surfaceVariant,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      )}
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      {description && (
        <Text
          variant="bodyLarge"
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {description}
        </Text>
      )}
      {action && (
        <Button
          mode={action.mode || 'contained'}
          onPress={action.onPress}
          style={styles.button}
        >
          {action.label}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  button: {
    minWidth: 200,
  },
});
