import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ButtonProps = {
  onPress: () => void;
  label: string;
  mode?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'success' | 'warning' | 'error';
};

export const Button = ({
  onPress,
  label,
  mode = 'contained',
  size = 'medium',
  icon,
  disabled = false,
  loading = false,
  style,
  variant = 'primary',
}: ButtonProps) => {
  const theme = useTheme();

  const getButtonColor = () => {
    switch (variant) {
      case 'success': return theme.colors.success.main;
      case 'warning': return theme.colors.warning.main;
      case 'error': return theme.colors.error.main;
      default: return theme.colors.primary.main;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small': return styles.smallButton;
      case 'large': return styles.largeButton;
      default: return styles.mediumButton;
    }
  };

  const getLabelStyle = () => {
    switch (size) {
      case 'small': return styles.smallLabel;
      case 'large': return styles.largeLabel;
      default: return styles.mediumLabel;
    }
  };

  return (
    <PaperButton
      onPress={onPress}
      mode={mode}
      icon={icon}
      disabled={disabled}
      loading={loading}
      style={[
        styles.button,
        getButtonSize(),
        { borderRadius: theme.borderRadius.md },
        mode === 'contained' && { backgroundColor: getButtonColor() },
        mode === 'outlined' && { borderColor: getButtonColor() },
        style,
      ]}
      labelStyle={[
        styles.label,
        getLabelStyle(),
        mode !== 'contained' && { color: getButtonColor() },
      ]}
      contentStyle={styles.content}
    >
      {label}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
  },
  content: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  smallButton: {
    height: 32,
  },
  mediumButton: {
    height: 40,
  },
  largeButton: {
    height: 48,
  },
  smallLabel: {
    fontSize: 12,
  },
  mediumLabel: {
    fontSize: 14,
  },
  largeLabel: {
    fontSize: 16,
  },
});
