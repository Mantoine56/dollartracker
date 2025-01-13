import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type EmptyStateProps = {
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  isError?: boolean;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  isError = false,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={icon}
        size={80}
        color={isError ? theme.colors.error : theme.colors.primary}
        style={styles.icon}
      />
      <Text
        variant="headlineSmall"
        style={[
          styles.title,
          { color: isError ? theme.colors.error : theme.colors.onSurface },
        ]}
      >
        {title}
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        {description}
      </Text>
      {action && (
        <Button
          mode="contained"
          onPress={action.onPress}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {action.label}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.9,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
});
