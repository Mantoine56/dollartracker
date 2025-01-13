import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ButtonProps = React.ComponentProps<typeof PaperButton> & {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'success' | 'warning' | 'error';
};

export const Button = ({
  mode = 'contained',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  variant = 'primary',
  children,
  ...props
}: ButtonProps) => {
  const theme = useTheme();

  const getButtonColor = () => {
    switch (variant) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.primary;
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
      mode={mode}
      disabled={disabled}
      loading={loading}
      style={[
        styles.button,
        getButtonSize(),
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
      {...props}
    >
      {children}
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
