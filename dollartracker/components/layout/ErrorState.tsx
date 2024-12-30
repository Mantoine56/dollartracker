import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../ui/Button';

type ErrorStateProps = {
  title?: string;
  message: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  action?: {
    label: string;
    onPress: () => void;
  };
  details?: string;
  style?: ViewStyle;
};

export const ErrorState = ({
  title = 'Oops!',
  message,
  icon = 'alert-circle',
  action,
  details,
  style,
}: ErrorStateProps) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.colors.error.light + '20',
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={48}
          color={theme.colors.error.main}
        />
      </View>

      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.text.primary }]}
      >
        {title}
      </Text>

      <Text
        variant="bodyLarge"
        style={[
          styles.message,
          { color: theme.colors.text.secondary },
        ]}
      >
        {message}
      </Text>

      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          mode="contained"
          style={styles.button}
        />
      )}

      {details && (
        <View style={styles.detailsContainer}>
          <Button
            label={showDetails ? 'Hide Details' : 'Show Details'}
            onPress={() => setShowDetails(!showDetails)}
            mode="text"
            icon={showDetails ? 'chevron-up' : 'chevron-down'}
          />
          {showDetails && (
            <View
              style={[
                styles.detailsContent,
                {
                  backgroundColor: theme.colors.grey[100],
                },
              ]}
            >
              <Text
                variant="bodyMedium"
                style={[
                  styles.detailsText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {details}
              </Text>
            </View>
          )}
        </View>
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
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
    marginBottom: 16,
  },
  detailsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  detailsContent: {
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  detailsText: {
    fontFamily: 'monospace',
  },
});
