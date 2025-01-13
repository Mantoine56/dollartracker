import React from 'react';
import { StyleSheet, TextInput as RNTextInput, ViewStyle } from 'react-native';
import { TextInput, HelperText, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
  mode?: 'flat' | 'outlined';
  type?: 'text' | 'number' | 'currency';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  style?: ViewStyle;
  maxLength?: number;
  multiline?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
};

export const Input = ({
  value,
  onChangeText,
  label,
  mode = 'outlined',
  type = 'text',
  icon,
  error,
  disabled = false,
  placeholder,
  style,
  maxLength,
  multiline = false,
  onBlur,
  onFocus,
}: InputProps) => {
  const theme = useTheme();
  const inputRef = React.useRef<RNTextInput>(null);

  const handleChangeText = (text: string) => {
    if (type === 'number') {
      // Allow only numbers
      const numericValue = text.replace(/[^0-9]/g, '');
      onChangeText(numericValue);
    } else if (type === 'currency') {
      // Allow decimal numbers with 2 decimal places
      const numericValue = text.replace(/[^0-9.]/g, '');
      const parts = numericValue.split('.');
      if (parts.length > 2) return; // Don't allow multiple decimal points
      if (parts[1]?.length > 2) return; // Don't allow more than 2 decimal places
      onChangeText(numericValue);
    } else {
      onChangeText(text);
    }
  };

  return (
    <>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        label={label}
        mode={mode}
        left={icon ? <TextInput.Icon icon={icon} /> : undefined}
        error={!!error}
        disabled={disabled}
        placeholder={placeholder}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            fontSize: theme.typography.bodyLarge.fontSize,
          },
          style,
        ]}
        maxLength={maxLength}
        multiline={multiline}
        onBlur={onBlur}
        onFocus={onFocus}
        keyboardType={type === 'text' ? 'default' : 'decimal-pad'}
        returnKeyType={multiline ? 'default' : 'done'}
        blurOnSubmit={!multiline}
      />
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    marginVertical: 8,
  },
});
