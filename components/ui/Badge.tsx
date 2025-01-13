import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type BadgeProps = {
  title: string;
  description?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  variant?: 'outline' | 'filled';
  status?: 'locked' | 'unlocked' | 'completed';
};

export const Badge = ({
  title,
  description,
  icon,
  variant = 'filled',
  status = 'unlocked'
}: BadgeProps) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return theme.colors.success.main;
      case 'unlocked': return theme.colors.primary.main;
      case 'locked': return theme.colors.grey[400];
    }
  };

  return (
    <Surface
      style={[
        styles.container,
        {
          backgroundColor: variant === 'filled' ? theme.colors.grey[100] : 'transparent',
          borderColor: getStatusColor(),
          borderWidth: variant === 'outline' ? 2 : 0,
        },
      ]}
      elevation={1}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: variant === 'filled' ? getStatusColor() : 'transparent',
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={variant === 'filled' ? theme.colors.surface : getStatusColor()}
        />
      </View>
      <View style={styles.textContainer}>
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.text.primary }]}
        >
          {title}
        </Text>
        {description && (
          <Text
            variant="bodySmall"
            style={[styles.description, { color: theme.colors.text.secondary }]}
          >
            {description}
          </Text>
        )}
      </View>
      {status === 'completed' && (
        <MaterialCommunityIcons
          name="check-circle"
          size={24}
          color={theme.colors.success.main}
          style={styles.statusIcon}
        />
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: '600',
  },
  description: {
    marginTop: 2,
  },
  statusIcon: {
    marginLeft: 8,
  },
});
