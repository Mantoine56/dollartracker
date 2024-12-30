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
              backgroundColor: theme.colors.grey[100],
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={48}
            color={theme.colors.text.secondary}
          />
        </View>
      )}

      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.text.primary }]}
      >
        {title}
      </Text>

      {description && (
        <Text
          variant="bodyLarge"
          style={[
            styles.description,
            { color: theme.colors.text.secondary },
          ]}
        >
          {description}
        </Text>
      )}

      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          mode={action.mode || 'contained'}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
});
